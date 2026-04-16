import { Falsy } from '../../types/base'

/**
 * Executes an action, allowing error transformation if it throws.
 *
 * @param handleError - Returns a new error message/Error to throw, or falsy to rethrow original.
 */
export function alterError<R>(action: () => R, handleError: (error: unknown) => string | Error | Falsy): R {
  try {
    return action()
  } catch (error) {
    const handledError = handleError(error)
    if (!handledError) throw error
    if (typeof handledError === 'string') throw new Error(handledError)
    throw handledError
  }
}

export namespace alterError {
  /** Async variant of `alterError`. */
  export async function async<R>(
    action: () => R,
    handleError: (error: unknown) => string | Error | Falsy
  ): Promise<Awaited<R>> {
    try {
      return await action()
    } catch (error) {
      const handledError = handleError(error)
      if (!handledError) throw error
      if (typeof handledError === 'string') throw new Error(handledError)
      throw handledError
    }
  }
}
