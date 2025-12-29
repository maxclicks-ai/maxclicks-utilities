import { combineMessages } from '../helpers/error-warning/combineMessages'
import { getErrorMessage } from '../helpers/error-warning/getErrorMessage'
import { prependMessage } from '../helpers/error-warning/prependMessage'
import { arrayHelpers } from '../helpers/native/arrayHelpers'
import { objectHelpers } from '../helpers/native/objectHelpers'
import type { Falsy } from '../types'

/**
 * A composable validation and transformation pipeline for parsing input values.
 *
 * Normalizers can be chained to build complex validation logic:
 * ```ts
 * const emailNormalizer = Normalizer.stringTrimmed
 *   .chain(value => value?.toLowerCase())
 *   .chain(value => { if (!isValidEmail(value)) throw new Error('Invalid email'); return value })
 * ```
 */
export class Normalizer<Value> {
  constructor(readonly parseOrThrow: Normalizer.ParseOrThrow<Value>) {}

  /** Runs the normalizer, returning a `Normalized` result with value or error. */
  normalize<V>(value: V): Normalizer.Normalized<undefined extends V ? Value | undefined : Value> {
    const warn = Normalizer.Warn.create()
    try {
      const parsedValue = value === undefined ? undefined : this.parseOrThrow(value, warn)
      return new Normalizer.Normalized({
        warningMessage: warn.message,
        value: parsedValue as undefined extends V ? Value | undefined : Value,
      })
    } catch (error) {
      return new Normalizer.Normalized({
        errorMessage: getErrorMessage(error),
      })
    }
  }

  /** Chains another synchronous transformation step. */
  chain<NewValue>(parseOrThrow: Normalizer.ParseOrThrow<NewValue, Value>): Normalizer<NewValue> {
    return new Normalizer((value, warn) => parseOrThrow(this.parseOrThrow(value, warn), warn))
  }

  /** Chains an asynchronous transformation step, converting to `Normalizer.Async`. */
  chainAsync<NewValue>(parseOrThrowAsync: Normalizer.ParseOrThrowAsync<NewValue, Value>): Normalizer.Async<NewValue> {
    return new Normalizer.Async((value, warn, abortSignal) =>
      parseOrThrowAsync(this.parseOrThrow(value, warn), warn, abortSignal)
    )
  }

  /** Creates a normalizer that throws if value is null, empty string, or empty array. */
  get required(): Normalizer<Exclude<Value, null>> {
    return this.chain((value, warn) => {
      if (
        (!value && value !== 0 && !Number.isNaN(value) && value !== false) ||
        (Array.isArray(value) && value.length === 0)
      )
        throw new Error('Required.')
      return value as Exclude<Value, null>
    })
  }
}

export namespace Normalizer {
  /** Async variant of `Normalizer` for pipelines with async steps. */
  export class Async<Value> {
    constructor(readonly parseOrThrowAsync: ParseOrThrowAsync<Value>) {}

    /** Runs the async normalizer, returning a `Normalized` result. */
    async normalize<V>(
      value: V,
      abortSignal?: AbortSignal
    ): Promise<Normalized<undefined extends V ? Value | undefined : Value>> {
      const warn = Warn.create()
      try {
        if (abortSignal?.aborted) throw new Error('Aborted.')
        const parsedValue = value === undefined ? undefined : await this.parseOrThrowAsync(value, warn, abortSignal)
        if (abortSignal?.aborted) throw new Error('Aborted.')
        return new Normalized({
          warningMessage: warn.message,
          value: parsedValue as undefined extends V ? Value | undefined : Value,
        })
      } catch (error) {
        return new Normalized({
          errorMessage: abortSignal?.aborted ? 'Aborted.' : getErrorMessage(error),
        })
      }
    }

    /** Chains a synchronous transformation step. */
    chain<NewValue>(parseOrThrow: ParseOrThrow<NewValue, Value>): Async<NewValue> {
      return new Async(async (value, warn, abortSignal) =>
        parseOrThrow(await this.parseOrThrowAsync(value, warn, abortSignal), warn)
      )
    }

    /** Chains an asynchronous transformation step. */
    chainAsync<NewValue>(parseOrThrowAsync: ParseOrThrowAsync<NewValue, Value>): Async<NewValue> {
      return new Async(
        async (value, warn, abortSignal) =>
          await parseOrThrowAsync(await this.parseOrThrowAsync(value, warn, abortSignal), warn, abortSignal)
      )
    }

    /** Creates an async normalizer that throws if value is null, empty string, or empty array. */
    get required(): Async<Exclude<Value, null>> {
      return this.chain((value, warn) => {
        if (
          (!value && value !== 0 && !Number.isNaN(value) && value !== false) ||
          (Array.isArray(value) && value.length === 0)
        )
          throw new Error('Required.')
        return value as Exclude<Value, null>
      })
    }
  }

  /** Result container holding either a normalized value (with optional warning) or an error. */
  export class Normalized<Value> {
    constructor(
      private readonly state:
        | {
            readonly errorMessage: string
            readonly warningMessage?: undefined
            readonly value?: undefined
          }
        | {
            readonly errorMessage?: undefined
            readonly warningMessage?: string
            readonly value: Value
          }
    ) {}

    /** Error message if normalization failed. */
    get errorMessage(): string | undefined {
      return this.state.errorMessage
    }

    /** Warning message if normalization succeeded with issues. */
    get warningMessage(): string | undefined {
      return this.state.warningMessage
    }

    /** The normalized value, or undefined if failed. Does not throw. */
    get valueSafe(): Value | undefined {
      return this.state.value
    }

    /** The normalized value. Throws if normalization failed. */
    get value(): Value {
      if (this.state.errorMessage) throw new Error(this.errorMessage)
      return this.state.value!
    }

    /** Allows using `Normalized` in expressions expecting the value type. */
    valueOf(): Value {
      return this.value
    }

    /**
     * Gets the value, passing any warning to the warn function.
     * Throws with optional prefix if normalization failed.
     */
    getValue(warn: Warn): Value
    getValue(messagePrefix: string): Value
    getValue(messagePrefix: string, warn: Warn): Value
    getValue(
      warnOrMessagePrefix: Warn | string,
      warn = typeof warnOrMessagePrefix === 'function' ? warnOrMessagePrefix : undefined
    ): Value {
      const messagePrefix = typeof warnOrMessagePrefix === 'string' ? warnOrMessagePrefix : undefined
      if (this.state.errorMessage) throw new Error(prependMessage(messagePrefix, this.state.errorMessage))
      warn?.(prependMessage(messagePrefix, this.warningMessage))
      return this.state.value!
    }

    /**
     * Combines multiple `Normalized` results into a single result.
     * Aggregates all errors/warnings with optional labels.
     */
    static combine<T extends { readonly [K in string]: any } | readonly any[]>(
      normalizedItems: T,
      labelByKey?: { readonly [K in keyof T]?: string | Falsy }
    ): Normalized<{ -readonly [K in keyof T]: Exclude<T[K] extends Normalized<infer V> ? V : T[K], undefined> }> {
      const normalizedItemsByKey = (
        Array.isArray(normalizedItems)
          ? arrayHelpers.toDictionary(
              normalizedItems,
              (item, itemIndex) => (labelByKey?.[itemIndex as any as keyof T] || `Item #${itemIndex + 1}`) as string
            )
          : objectHelpers.map(normalizedItems, (key, item) => labelByKey?.[key] || key)
      ) as { readonly [K in string]: Normalized<any> }

      const errorMessage = combineMessages.errors(normalizedItemsByKey)
      if (errorMessage) return new Normalized({ errorMessage })

      const warningMessage = combineMessages.warnings(normalizedItemsByKey)
      const value = Array.isArray(normalizedItems)
        ? (normalizedItems as readonly Normalized<any>[])
            .map(item => (item instanceof Normalizer ? item.value : item))
            .filter(item => item !== undefined)
        : objectHelpers.onlyExisting(
            objectHelpers.map(normalizedItems as { readonly [K in string]: Normalized<any> }, (key, value) =>
              value instanceof Normalizer ? value.value : value
            )
          )

      return new Normalized({
        warningMessage,
        value: value as any,
      })
    }
  }

  export namespace Normalized {
    /**
     * Use it with `satisfies`.
     *
     * @example
     * interface Type {
     *   key1: Type1
     *   key2: Type2
     *   key3: Type3
     * }
     * const items = {
     *   key1: normalizer.normalize(value1),
     *   key2: normalizer.normalize(value2),
     *   key3: value3,
     * } satisfies Normalizer.Normalized.Items<Type> // Helps with correctly defining items while not restricting the actual type definition.
     * const combined = Normalizer.Normalized.combine(items) // combined.value is compatible with Type.
     */
    export type Items<T extends { readonly [K in string]: any } | readonly any[]> = {
      -readonly [K in keyof T]: T[K] | Normalized<T[K]>
    }
  }

  /** Synchronous parser function signature. Throws on validation failure. */
  export type ParseOrThrow<ToValue, FromValue = any> = (value: FromValue, warn: Warn) => ToValue

  /** Async parser function signature. Throws on validation failure. */
  export type ParseOrThrowAsync<ToValue, FromValue = any> = (
    value: FromValue,
    warn: Warn,
    abortSignal: AbortSignal | undefined
  ) => Promise<ToValue>

  /** Warning collector function passed to parsers. Call with a message to accumulate warnings. */
  export interface Warn {
    (message: string | Falsy): void
    /** Accumulated warning messages joined by newlines. */
    readonly message: string | undefined
  }

  export namespace Warn {
    /** Creates a new warning collector. */
    export function create(): Warn {
      const warn: Warn & { message: string | undefined } = message => {
        warn.message =
          arrayHelpers
            .distinctString(
              arrayHelpers.filterFalsy([warn.message, message].flatMap(message => (message || '').split('\n')))
            )
            .join('\n') || undefined
      }
      warn.message = undefined
      return warn
    }
  }

  /** Passthrough normalizer that accepts any value unchanged. */
  export const any = new Normalizer((value, warn) => value)

  /** Normalizer that coerces to string. Returns null for empty strings. */
  export const string = new Normalizer((value, warn) => {
    if (value === null) return null
    typeof value !== 'string' && warn('Expected a string.')
    const parsedValue = typeof value === 'string' ? value : String(value)
    return parsedValue || null
  })

  /** Normalizer that trims whitespace and warns if trimming occurred. */
  export const stringTrimmed = string.chain((value, warn) => {
    const trimmedValue = value?.trim()
    if (!trimmedValue) return value
    if (value !== null && trimmedValue.length !== value.length) warn('Leading or trailing whitespace is removed.')
    return trimmedValue
  })

  /** Normalizer that trims and lowercases strings. */
  export const stringTrimmedAndLowerCased = stringTrimmed.chain((value, warn) => {
    const trimmedValue = value?.trim()
    if (!trimmedValue) return value
    if (value !== null && trimmedValue.length !== value.length) warn('Leading or trailing whitespace is removed.')
    return trimmedValue.toLowerCase()
  })

  /** Creates a parser that warns if string length is outside bounds. */
  export function stringLimitLength(minimum: number, maximum: number): ParseOrThrow<string | null, string | null> {
    return (value, warn) => {
      if (value === null) return null
      if (value.length < minimum) warn(`At least ${minimum} characters.`)
      if (value.length > maximum) warn(`At most ${maximum} characters.`)
      return value
    }
  }

  /** Creates a parser that validates string is a value from an enum object. */
  export function stringEnum<E extends string>(enumObject: { readonly [K in string]: E }): ParseOrThrow<
    E | null,
    string | null
  > {
    return stringEnumValues(...Object.values(enumObject))
  }

  /** Creates a parser that validates string is one of the allowed values. */
  export function stringEnumValues<E extends readonly string[]>(
    ...allowedValues: E
  ): ParseOrThrow<E[number] | null, string | null> {
    return (value, warn) => {
      if (value === null) return null
      if (!allowedValues.includes(value))
        throw new Error(
          allowedValues.length < 7
            ? `Expected one of the following values: ${allowedValues.map(allowedValue => `"${allowedValue}"`).join(', ')}.`
            : `Invalid value.`
        )
      return value
    }
  }

  /** Normalizer that coerces to number. Throws for NaN. */
  export const number = new Normalizer((value, warn) => {
    if (value === null) return null
    if (typeof value !== 'number') warn('Expected a number.')
    const parsedValue = typeof value === 'number' ? value : Number(value)
    if (Number.isNaN(parsedValue)) throw new Error('Invalid number value.')
    return parsedValue
  })

  /** Normalizer that validates number is an integer. */
  export const numberInteger = number.chain((value, warn) => {
    if (value === null) return null
    if (!Number.isInteger(value)) throw new Error('Expected an integer number.')
    return value
  })

  /** Creates a parser that warns if number is outside bounds. */
  export function numberLimitRange(minimum: number, maximum: number): ParseOrThrow<number | null, number | null> {
    return (value, warn) => {
      if (!value) return value
      if (value < minimum) warn(`At least ${minimum}.`)
      if (value > maximum) warn(`At most ${maximum}.`)
      return value
    }
  }

  /** Normalizer that coerces to boolean. Accepts `'true'`/`'false'` strings. */
  export const boolean = new Normalizer((value, warn) => {
    if (value === null) return null
    if (typeof value !== 'boolean') warn('Expected a boolean.')
    const parsedValue =
      typeof value === 'boolean' ? value : value === 'true' ? true : value === 'false' ? false : undefined
    if (parsedValue === undefined) throw new Error('Invalid boolean value.')
    return parsedValue
  })

  /** Normalizer that validates value is a plain object (not array). */
  export const object = new Normalizer((value, warn) => {
    if (value === null) return null
    if (!value || typeof value !== 'object' || arrayHelpers.isArray(value)) throw new Error('Expected an object.')
    return value as Record<string, any>
  })

  /** Creates a parser that throws if object is missing required keys. */
  export function objectRequireKeys(
    ...keys: readonly string[]
  ): ParseOrThrow<Record<string, any> | null, Record<string, any> | null> {
    return (value, warn) => {
      if (!value) return value
      const missingKeys = keys.filter(key => value[key] === undefined)
      if (missingKeys.length > 0)
        throw new Error(`Missing required propert${missingKeys.length === 1 ? 'y' : 'ies'}: ${missingKeys.join(', ')}.`)
      return value
    }
  }

  /** Normalizer that wraps non-array values in an array. Returns empty array for null. */
  export const array = new Normalizer((value, warn) => {
    if (value === null) return []
    return (arrayHelpers.isArray(value) ? value : [value]) as any[]
  })
}
