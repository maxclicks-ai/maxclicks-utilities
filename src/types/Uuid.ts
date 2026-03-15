import { Json } from './Json'
import { Normalizer } from './Normalizer'

/** A UUID string. */
export type Uuid = string

export namespace Uuid {
  export const normalizer = Normalizer.stringTrimmedAndLowerCased.chain((value, warn) => {
    if (!value) return null
    if (!REGEXP.test(value)) throw new Error('Invalid UUID.')
    return value
  })

  export const jsonSchema: Json.Schema = {
    type: 'string',
    description: 'A UUID string.',
  }
}

const REGEXP = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
