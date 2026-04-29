import { haveSameContents } from '../../../helpers/haveSameContents'
import { Json } from '../Json'
import { isJsonSchemaNullable } from './isJsonSchemaNullable'
import { JsonSchema } from './JsonSchema'

/**
 * Checks if the `wider` schema accepts every JSON value that the `narrower` schema accepts —
 * i.e. the set of values valid under `narrower` is a subset of those valid under `wider`.
 * The relation is reflexive: equivalent schemas return `true`.
 *
 * This single check covers two common scenarios:
 *
 * - **Backward compatibility (old vs. new schema):** when migrating a stored dataset whose items
 *   conform to an old schema, pass `wider = newSchema`, `narrower = oldSchema`. A `true` result
 *   means every existing item remains valid under the new schema (no migration needed).
 *
 * - **Producer/consumer compatibility:** when wiring a producer (emits values matching schema P)
 *   to a consumer (accepts values matching schema C), pass `wider = consumerSchema`,
 *   `narrower = producerSchema`. A `true` result means the consumer accepts everything the
 *   producer can emit. Note: the consumer is the *wider* side, because it must tolerate
 *   anything the producer might send.
 *
 * The check is sound but not always complete: it operates on the simplified `JsonSchema` subset
 * used by this package (no `oneOf` / `anyOf` / `allOf` / `not` / pattern properties), which makes
 * the comparison deterministic.
 *
 * @param wider - The schema expected to accept at least as many values
 * @param narrower - The schema whose accepted values must all be accepted by `wider`
 */
export function isJsonSchemaWiderThan(wider: JsonSchema, narrower: JsonSchema): boolean {
  // Trivial: `Any` accepts every JSON value.
  if (JsonSchema.Any.check(wider)) return true
  // `narrower` is `Any` (accepts everything) but `wider` is not — `wider` rejects something.
  if (JsonSchema.Any.check(narrower)) return false

  // Finite-domain narrower: enumerate its values and check `wider` accepts each.
  if (JsonSchema.Const.check(narrower)) return schemaAcceptsValue(wider, narrower.const)
  if (JsonSchema.Enum.check(narrower)) return narrower.enum.every(value => schemaAcceptsValue(wider, value))

  // From here, `narrower` is type-based.
  // If `wider` is `Const`/`Enum`, it can only cover a finite-domain `narrower` (Null, Boolean).
  if (JsonSchema.Const.check(wider) || JsonSchema.Enum.check(wider)) {
    const finiteValues = enumerateFiniteValues(narrower)
    if (finiteValues === null) return false
    return finiteValues.every(value => schemaAcceptsValue(wider, value))
  }

  // Both are type-based. Nullability: if `narrower` admits `null`, `wider` must too.
  if (isJsonSchemaNullable(narrower) && !isJsonSchemaNullable(wider)) return false

  if (JsonSchema.Null.check(narrower)) return JsonSchema.Null.check(wider) || isJsonSchemaNullable(wider)

  if (JsonSchema.String.check(narrower)) return JsonSchema.String.check(wider) && isStringWiderThan(wider, narrower)

  if (JsonSchema.Number.check(narrower)) return JsonSchema.Number.check(wider) && isNumericWiderThan(wider, narrower)

  // `Number` is wider than `Integer` (it accepts non-integer values too).
  if (JsonSchema.Integer.check(narrower))
    return (JsonSchema.Integer.check(wider) || JsonSchema.Number.check(wider)) && isNumericWiderThan(wider, narrower)

  if (JsonSchema.Boolean.check(narrower)) return JsonSchema.Boolean.check(wider)

  if (JsonSchema.Array.check(narrower)) return JsonSchema.Array.check(wider) && isArrayWiderThan(wider, narrower)

  if (JsonSchema.Object.check(narrower)) return JsonSchema.Object.check(wider) && isObjectWiderThan(wider, narrower)

  return false
}

/**
 * Returns the complete list of JSON values a schema accepts when that list is finite,
 * otherwise `null`. Used to check whether a `Const`/`Enum` `wider` covers a type-based `narrower`.
 */
function enumerateFiniteValues(jsonSchema: JsonSchema): Json[] | null {
  if (JsonSchema.Null.check(jsonSchema)) return [null]
  if (JsonSchema.Boolean.check(jsonSchema)) {
    const values: Json[] = [true, false]
    if (isJsonSchemaNullable(jsonSchema)) values.push(null)
    return values
  }
  return null
}

/** Check if a schema accepts a specific JSON value. */
function schemaAcceptsValue(jsonSchema: JsonSchema, value: Json): boolean {
  if (JsonSchema.Any.check(jsonSchema)) return true
  if (JsonSchema.Const.check(jsonSchema)) return haveSameContents(jsonSchema.const, value)
  if (JsonSchema.Enum.check(jsonSchema)) return jsonSchema.enum.some(item => haveSameContents(item, value))

  if (value === null) return isJsonSchemaNullable(jsonSchema)
  if (JsonSchema.Null.check(jsonSchema)) return false

  if (JsonSchema.String.check(jsonSchema)) {
    if (typeof value !== 'string') return false
    if (jsonSchema.minLength !== undefined && value.length < jsonSchema.minLength) return false
    if (jsonSchema.maxLength !== undefined && value.length > jsonSchema.maxLength) return false
    // Format validation is intentionally lenient: const/enum values are assumed well-formed.
    return true
  }

  if (JsonSchema.Integer.check(jsonSchema)) {
    if (typeof value !== 'number' || !Number.isInteger(value)) return false
    return numberConstraintsAccept(jsonSchema, value)
  }

  if (JsonSchema.Number.check(jsonSchema)) {
    if (typeof value !== 'number') return false
    return numberConstraintsAccept(jsonSchema, value)
  }

  if (JsonSchema.Boolean.check(jsonSchema)) return typeof value === 'boolean'

  if (JsonSchema.Array.check(jsonSchema)) {
    if (!Array.isArray(value)) return false
    if (jsonSchema.minItems !== undefined && value.length < jsonSchema.minItems) return false
    if (jsonSchema.maxItems !== undefined && value.length > jsonSchema.maxItems) return false
    if (jsonSchema.items !== undefined) {
      const itemSchema = jsonSchema.items
      return value.every(item => schemaAcceptsValue(itemSchema, item))
    }
    return true
  }

  if (JsonSchema.Object.check(jsonSchema)) {
    if (typeof value !== 'object' || Array.isArray(value) || value === null) return false
    const objectValue = value as Record<string, Json>
    if (jsonSchema.required) {
      for (const key of jsonSchema.required) {
        if (objectValue[key] === undefined && !(key in objectValue)) return false
      }
    }
    const additional = resolveAdditionalProperties(jsonSchema)
    for (const [key, propertyValue] of Object.entries(objectValue)) {
      const propertySchema = jsonSchema.properties?.[key] ?? additional
      if (!schemaAcceptsValue(propertySchema, propertyValue)) return false
    }
    return true
  }

  return false
}

function numberConstraintsAccept(jsonSchema: JsonSchema.Number | JsonSchema.Integer, value: number): boolean {
  if (jsonSchema.minimum !== undefined && value < jsonSchema.minimum) return false
  if (jsonSchema.maximum !== undefined && value > jsonSchema.maximum) return false
  if (jsonSchema.exclusiveMinimum !== undefined && value <= jsonSchema.exclusiveMinimum) return false
  if (jsonSchema.exclusiveMaximum !== undefined && value >= jsonSchema.exclusiveMaximum) return false
  if (jsonSchema.multipleOf !== undefined && value % jsonSchema.multipleOf !== 0) return false
  return true
}

function isStringWiderThan(wider: JsonSchema.String, narrower: JsonSchema.String): boolean {
  // `wider` requires length ≥ wider.minLength → `narrower` must guarantee the same.
  if (wider.minLength !== undefined) {
    if (narrower.minLength === undefined || narrower.minLength < wider.minLength) return false
  }
  if (wider.maxLength !== undefined) {
    if (narrower.maxLength === undefined || narrower.maxLength > wider.maxLength) return false
  }
  // `wider` requires a specific format → `narrower` must declare the same format.
  // (We can't prove a `narrower` without `format` only emits, e.g., valid emails.)
  if (wider.format !== undefined) {
    if (narrower.format !== wider.format) return false
  }
  return true
}

interface NumericLowerBound {
  readonly value: number
  readonly exclusive: boolean
}

function lowerBound(s: JsonSchema.Number | JsonSchema.Integer): NumericLowerBound | null {
  const inclusive = s.minimum
  const exclusive = s.exclusiveMinimum
  if (inclusive !== undefined && exclusive !== undefined)
    return exclusive >= inclusive ? { value: exclusive, exclusive: true } : { value: inclusive, exclusive: false }
  if (exclusive !== undefined) return { value: exclusive, exclusive: true }
  if (inclusive !== undefined) return { value: inclusive, exclusive: false }
  return null
}

function upperBound(s: JsonSchema.Number | JsonSchema.Integer): NumericLowerBound | null {
  const inclusive = s.maximum
  const exclusive = s.exclusiveMaximum
  if (inclusive !== undefined && exclusive !== undefined)
    return exclusive <= inclusive ? { value: exclusive, exclusive: true } : { value: inclusive, exclusive: false }
  if (exclusive !== undefined) return { value: exclusive, exclusive: true }
  if (inclusive !== undefined) return { value: inclusive, exclusive: false }
  return null
}

/** Is `narrower`'s lower bound at least as restrictive as `wider`'s? */
function lowerBoundCovers(wider: NumericLowerBound, narrower: NumericLowerBound | null): boolean {
  if (narrower === null) return false
  if (narrower.value > wider.value) return true
  if (narrower.value < wider.value) return false
  // Equal values: if `wider` is exclusive, `narrower` must also be exclusive.
  return !wider.exclusive || narrower.exclusive
}

function upperBoundCovers(wider: NumericLowerBound, narrower: NumericLowerBound | null): boolean {
  if (narrower === null) return false
  if (narrower.value < wider.value) return true
  if (narrower.value > wider.value) return false
  return !wider.exclusive || narrower.exclusive
}

function isNumericWiderThan(
  wider: JsonSchema.Number | JsonSchema.Integer,
  narrower: JsonSchema.Number | JsonSchema.Integer
): boolean {
  const widerLower = lowerBound(wider)
  if (widerLower !== null && !lowerBoundCovers(widerLower, lowerBound(narrower))) return false

  const widerUpper = upperBound(wider)
  if (widerUpper !== null && !upperBoundCovers(widerUpper, upperBound(narrower))) return false

  // `wider` only accepts multiples of M → `narrower`'s multipleOf must be a multiple of M.
  if (wider.multipleOf !== undefined) {
    if (narrower.multipleOf === undefined) return false
    if (narrower.multipleOf % wider.multipleOf !== 0) return false
  }

  return true
}

function isArrayWiderThan(wider: JsonSchema.Array, narrower: JsonSchema.Array): boolean {
  if (wider.minItems !== undefined) {
    if (narrower.minItems === undefined || narrower.minItems < wider.minItems) return false
  }
  if (wider.maxItems !== undefined) {
    if (narrower.maxItems === undefined || narrower.maxItems > wider.maxItems) return false
  }
  if (wider.items !== undefined) {
    // If `narrower.items` is omitted it accepts any item; we treat that as `Any` for the recursion.
    const narrowerItems = narrower.items ?? ANY_SCHEMA
    if (!isJsonSchemaWiderThan(wider.items, narrowerItems)) return false
  }
  return true
}

function resolveAdditionalProperties(jsonSchema: JsonSchema.Object): JsonSchema {
  const additional = jsonSchema.additionalProperties
  if (additional === undefined || additional === true) return ANY_SCHEMA
  return additional
}

function isObjectWiderThan(wider: JsonSchema.Object, narrower: JsonSchema.Object): boolean {
  // `wider` requires key K → `narrower` must also require K, otherwise `narrower` admits objects
  // missing K which `wider` rejects.
  if (wider.required) {
    const narrowerRequired = new Set(narrower.required ?? [])
    for (const key of wider.required) {
      if (!narrowerRequired.has(key)) return false
    }
  }

  const widerAdditional = resolveAdditionalProperties(wider)
  const narrowerAdditional = resolveAdditionalProperties(narrower)

  // For every key explicitly named in either schema, the per-key value schemas must be compatible.
  const namedKeys = new Set([...Object.keys(wider.properties ?? {}), ...Object.keys(narrower.properties ?? {})])
  for (const key of namedKeys) {
    const widerProperty = wider.properties?.[key] ?? widerAdditional
    const narrowerProperty = narrower.properties?.[key] ?? narrowerAdditional
    if (!isJsonSchemaWiderThan(widerProperty, narrowerProperty)) return false
  }

  // For arbitrary keys named in neither schema, `additionalProperties` governs both sides.
  if (!isJsonSchemaWiderThan(widerAdditional, narrowerAdditional)) return false

  return true
}

export namespace isJsonSchemaWiderThan {}

const ANY_SCHEMA: JsonSchema.Any = {}
