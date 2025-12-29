/** Escapes special RegExp characters in a string for safe use in `new RegExp()`. */
export function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string.
}
