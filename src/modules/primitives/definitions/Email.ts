import { Json } from '../../../types/Json'
import { Normalizer } from '../../../types/Normalizer'
import { PrimitiveId } from '../PrimitiveId'

/** A lowercase email address string. */
export type Email = string & {}

export namespace Email {
  export const id = 'email'

  export const name = 'Email'

  export const normalizer = Normalizer.stringTrimmed.chain((value, warn) => {
    const refinedValue = value?.toLowerCase()
    if (!refinedValue) return null
    if (!REGEXP.test(refinedValue)) throw new Error('Invalid email address.')
    return refinedValue
  })

  export const jsonSchema: Json.Schema = {
    type: 'string',
    format: 'email',
    description: 'A lowercase email address string.',
  }

  export const typeScript: string = `/** An email address. */
type Email = string`

  export const dependencies: readonly PrimitiveId[] = []
}

const REGEXP =
  /^([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/
