import { Json } from '../../../types/Json'
import { Normalizer } from '../../../types/Normalizer'
import { PrimitiveId } from '../PrimitiveId'

/** A UUID string. */
export type Uuid = string

export namespace Uuid {
  export const id = 'uuid'

  export const name = 'Uuid'

  export const normalizer = Normalizer.stringTrimmedAndLowerCased.chain((value, warn) => {
    if (!value) return null
    if (!REGEXP.test(value)) throw new Error('Invalid UUID.')
    return value
  })

  export const jsonSchema: Json.Schema = {
    type: 'string',
    description: 'A UUID string.',
  }

  export const typeScript: string = `/** A UUID string in standard format. */
type Uuid = string`

  export const dependencies: readonly PrimitiveId[] = []
}

const REGEXP = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
