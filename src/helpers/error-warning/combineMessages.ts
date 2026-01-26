import { Falsy } from '../../types'
import { arrayHelpers } from '../native/arrayHelpers'
import { objectHelpers } from '../native/objectHelpers'
import { prependMessage } from './prependMessage'

/**
 * Combines an object of keyed messages into a single newline-separated string.
 * Each message is prefixed with its key.
 */
export function combineMessages(messagesByKey: { readonly [key: string]: string | Falsy }): string | undefined {
  return (
    arrayHelpers
      .mapFilter(objectHelpers.entries(messagesByKey), ([key, value]) => value && prependMessage(key, value))
      .join('\n') || undefined
  )
}

export namespace combineMessages {
  /** Combines `errorMessage` properties from normalized results. */
  export function errors(normalizedByKey: {
    readonly [key: string]: string | Falsy | { readonly errorMessage?: string | Falsy }
  }): string | undefined {
    return combineMessages(
      objectHelpers.map(normalizedByKey, (key, value) =>
        !value ? undefined : typeof value === 'string' ? value : value.errorMessage
      )
    )
  }

  /** Combines `warningMessage` properties from normalized results. */
  export function warnings(normalizedByKey: {
    readonly [key: string]: string | Falsy | { readonly warningMessage?: string | Falsy }
  }): string | undefined {
    return combineMessages(
      objectHelpers.map(normalizedByKey, (key, value) =>
        !value ? undefined : typeof value === 'string' ? value : value.warningMessage
      )
    )
  }
}
