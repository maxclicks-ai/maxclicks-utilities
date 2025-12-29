/**
 * A helper function to enforce a type on a value to provide type safety and intellisense when building a value.
 *
 * This function is specially useful when the typing will be used by the surrounding code type determination.
 *
 * For example:
 * ```ts
 * function createTuple<K extends string, V>(key: K, value: V): [T, V] { return [key, value] }
 * const options = createTuple('mode', typed<'dark' | 'light'>('dark'))
 * ```
 *
 * Otherwise, if it's just about enforcing a type, you can use `satisfies`:
 * ```ts
 * const mode = 'dark' satisfies 'dark' | 'light'
 * ```
 *
 * Note that in the previous example using `satisfies` would result in a widened type `['mode', string]`
 * instead of `['mode', 'dark' | 'light']`, even though it too provides safety and intellisense for the value.
 */
export function typed<T>(value: T): T {
  return value
}
