/** Like `Omit`, but constrains `K` to keys of `T` for type safety. */
export type OmitTyped<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/** Like `Exclude`, but constrains `U` to extend `T` for type safety. */
export type ExcludeTyped<T, U extends T> = T extends U ? never : T

/** Removes `readonly` modifier from all properties of `T`. */
export type Writable<T> = { -readonly [K in keyof T]: T[K] }

/** Recursively removes `readonly` modifier from all properties. */
export type DeepWritable<T> = T extends BuiltIns
  ? T
  : T extends ReadonlyArray<infer U>
    ? Array<DeepWritable<U>>
    : T extends ReadonlyMap<infer K, infer V>
      ? Map<K, DeepWritable<V>>
      : T extends ReadonlySet<infer M>
        ? Set<DeepWritable<M>>
        : {
            -readonly [K in keyof T]: DeepWritable<T[K]>
          }

/** Recursively adds `readonly` modifier to all properties. */
export type DeepReadonly<T> = T extends BuiltIns
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends ReadonlyMap<infer K, infer V>
      ? ReadonlyMap<K, DeepReadonly<V>>
      : T extends ReadonlySet<infer M>
        ? ReadonlySet<DeepReadonly<M>>
        : {
            readonly [K in keyof T]: DeepReadonly<T[K]>
          }

/** Recursively makes all properties optional. */
export type DeepPartial<T> = T extends BuiltIns
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U> | undefined>
    : T extends Array<infer U>
      ? Array<DeepPartial<U> | undefined>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<K, DeepPartial<V> | undefined>
        : T extends Map<infer K, infer V>
          ? Map<K, DeepPartial<V> | undefined>
          : T extends ReadonlySet<infer M>
            ? ReadonlySet<DeepPartial<M>>
            : T extends Set<infer M>
              ? Set<DeepPartial<M>>
              : {
                  [K in keyof T]?: DeepPartial<T[K]>
                }

/** Narrows a union type `U` to members with a specific `type` discriminant. */
export type WithType<U extends { readonly type?: any }, T extends U['type']> = U & { readonly type: T }

/**
 * Works together with the `typed()` helper function to help define objects with
 * specific types that _extend_ some other type.
 *
 * @example
 * ```ts
 * interface Base { x: number }
 *
 * const extendingValue = (typed as Extender<Base>)({ x: 123, y: 'foo' }) // ✅ typeof extendingValue === { x: number; y: string }
 *
 * const invalidValue = (typed as Extender<Base>)({ y: 'foo' }) // ❌ TypeScript will complain about the value not extending the Base type correctly.
 * ```
 */
export type Extender<U> = <T extends U>(value: T) => T

/**
 * Sometimes TypeScript fails to figure out the "index signature of 'string'"
 * in some type definitions, thus considers them unable to extend some base
 * types like `Readonly<string, unknown>`.
 * Even though. this is practically the same as the given type, it can help
 * TypeScript to figure out the index signature it expects.
 */
export type WithStringIndexSignature<T> = { [Key in keyof T]: T[Key] }

/** Values that are falsy in JavaScript. */
export type Falsy = false | '' | 0 | null | undefined | void

/** Excludes falsy values from type `T`. */
export type Trucy<T> = Exclude<T, Falsy>

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type BuiltIns = Primitive | Function | Date | RegExp

type Primitive = null | undefined | string | number | boolean | symbol | bigint
