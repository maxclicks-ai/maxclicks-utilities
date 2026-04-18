import { Falsy } from '../../types/base'
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
