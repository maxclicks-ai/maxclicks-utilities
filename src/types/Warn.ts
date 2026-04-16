import { arrayHelpers } from '../helpers/native/arrayHelpers'
import { Falsy } from '../types/base'

/** Warning collector function. Call with a message to accumulate warnings. */
export interface Warn {
  (message: string | { readonly warningMessage?: string | Falsy } | Falsy): void
  /** Accumulated warning messages joined by newlines. */
  readonly message: string | undefined
}

export namespace Warn {
  /** Creates a new warning collector. */
  export function create(callback?: (message: string) => void, getMessage?: () => string | undefined): Warn {
    const warn: Warn & { message: string | undefined } = message => {
      const warningMessage = !message
        ? undefined
        : typeof message === 'string'
          ? message
          : message.warningMessage || undefined

      if (!getMessage)
        warn.message =
          arrayHelpers
            .distinctString(
              arrayHelpers.filterFalsy([warn.message, warningMessage].flatMap(message => (message || '').split('\n')))
            )
            .join('\n') || undefined

      if (callback && warningMessage) callback(warningMessage)
    }

    if (getMessage) {
      Object.defineProperty(warn, 'message', {
        get: getMessage,
        enumerable: true,
        configurable: true,
      })
    } else {
      warn.message = undefined
    }

    return warn
  }
}
