import { arrayHelpers } from '../helpers/native/arrayHelpers'
import { Falsy } from '../types/base'

/** Warning collector function. Call with a message to accumulate warnings. */
export interface Warn {
  (message: string | Falsy): void
  /** Accumulated warning messages joined by newlines. */
  readonly accumulatedMessage: string | undefined
  /** Creates a new Warn proxy that uses a mapper before forwarding messages. */
  readonly withMessageMapper: (convertMessage: (message: string) => string | Falsy) => Warn
}

export namespace Warn {
  /** Creates a new warning collector. */
  export function create(options?: {
    readonly onMessage?: (message: string) => void
    readonly getAccumulatedMessage?: () => string | undefined
  }): Warn {
    const warn: Warn & {
      accumulatedMessage: string | undefined
      withMessageMapper: (convertMessage: (message: string) => string | Falsy) => Warn
    } = message => {
      const warningMessage = message && typeof message === 'string' ? message : undefined
      if (!options?.getAccumulatedMessage) {
        warn.accumulatedMessage =
          arrayHelpers
            .distinctString(
              arrayHelpers.filterFalsy(
                [warn.accumulatedMessage, warningMessage].flatMap(message => (message || '').split('\n'))
              )
            )
            .join('\n') || undefined
      }

      if (options?.onMessage && warningMessage) {
        options.onMessage(warningMessage)
      }
    }

    if (options?.getAccumulatedMessage) {
      Object.defineProperty(warn, 'accumulatedMessage', {
        get: options.getAccumulatedMessage,
        enumerable: true,
        configurable: true,
      })
    } else {
      warn.accumulatedMessage = undefined
    }

    warn.withMessageMapper = convertMessage =>
      Warn.create({
        onMessage(message) {
          warn(convertMessage(message))
        },
        getAccumulatedMessage() {
          return warn.accumulatedMessage
        },
      })

    return warn
  }
}
