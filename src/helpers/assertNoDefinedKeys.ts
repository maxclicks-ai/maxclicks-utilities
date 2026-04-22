/**
 * Only for TypeScript compile-time checks, no run-time effect.
 * This ensures that the given object if of type `{}` with no defined keys.
 * It helps to make sure an object decomposition has no leftover keys that are not destructured.
 *
 * @example
 * const data = { a: 1, b: 2 }
 * const { a, b, ...rest } = data
 * assertNoDefinedKeys(rest) // TypeScript will error if `rest` is not empty
 */
export function assertNoDefinedKeys<T>(object: [keyof T] extends [never] ? T : never): void {}
