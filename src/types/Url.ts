import { getErrorMessage } from '../helpers/error-warning/getErrorMessage'
import { prependMessage } from '../helpers/error-warning/prependMessage'
import { Json } from './Json'
import { Normalizer } from './Normalizer'

/** A URL string (href). */
export type Url = string

export namespace Url {
  export const normalizer = Normalizer.stringTrimmed.chain((value, warn) => {
    if (!value) return null
    try {
      return new URL(value).href
    } catch (error) {
      throw new Error(prependMessage('Invalid URL', getErrorMessage(error)))
    }
  })

  export const jsonSchema: Json.Schema = {
    type: 'string',
    format: 'uri',
    description: 'A URL string (href).',
  }
}
