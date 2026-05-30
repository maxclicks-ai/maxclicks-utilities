// `AbortError` can cross package-instance boundaries in monorepos, so runtime checks must not rely on
// constructor identity. The shared symbol marker below intentionally lives on the prototype instead.
const abortErrorTypeSymbol = Symbol.for('maxclicks-ai.utilities.AbortError')

export class AbortError extends Error {
  constructor(message = 'Aborted.') {
    super(message)
  }

  private get [abortErrorTypeSymbol](): true {
    return true
  }

  static isAbortError(value: unknown): value is AbortError {
    return typeof value === 'object' && value !== null && (value as any)[abortErrorTypeSymbol] === true
  }
}
