import { getErrorMessage } from '../../../helpers/error-warning/getErrorMessage'
import { prependMessage } from '../../../helpers/error-warning/prependMessage'
import { Json } from '../../../types/Json'
import { Normalizer } from '../../../types/Normalizer'
import { PrimitiveId } from '../PrimitiveId'

/** A URL string (href). */
export type Url = string & {}

export namespace Url {
  export const id = 'url'

  export const name = 'Url'

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
    description: 'A URL string (href).',
    format: 'uri',
  }

  export const typeScript: string = `/** A URL string (href). */
type Url = string`

  export const dependencies: readonly PrimitiveId[] = []
}
