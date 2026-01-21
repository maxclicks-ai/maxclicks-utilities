// The return type should be `void`, not `never`; this way TypeScript still complains
// about missing return values even if it encounters this call:
/**
 * It's effectively the same as `throw new Error(message)` but with two differences:
 * - It's a function call and can be used inline inside expressions.
 * - TypeScript won't consider the following lines "unreachable", so we may use it
 * inside the `switch` blocks' `default` sections while having TypeScript still
 * complaining about the missing `case` sections.
 */
export function throwError<R = void>(error?: string | Error): R {
  throw typeof error === 'string' ? new Error(error) : error
}
