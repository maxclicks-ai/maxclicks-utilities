import { Normalizer } from './Normalizer'

/** A UUID string. */
export type Uuid = string

export namespace Uuid {
  export const id = 'uuid'

  export const typeName = 'Uuid'

  export const typeDefinition = `/** A UUID string. */
type ${typeName} = string`

  export const normalizer = Normalizer.stringTrimmedAndLowerCased.chain((value, warn) => {
    if (!value) return null
    if (!REGEXP.test(value)) throw new Error('Invalid UUID.')
    return value
  })
}

const REGEXP = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
