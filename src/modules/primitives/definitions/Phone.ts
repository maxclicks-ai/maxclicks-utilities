import { Json } from '../../../types/Json'
import { Normalizer } from '../../../types/Normalizer'
import { PrimitiveId } from '../PrimitiveId'

/** A phone number string with optional leading `+`. */
export type Phone = string & {}

export namespace Phone {
  export const id = 'phone'

  export const name = 'Phone'

  export const normalizer = Normalizer.string.chain((value, warn) => {
    const refinedValue = value && `${value.trimStart().startsWith('+') ? '+' : ''}${value.replace(/[^0-9]/g, '')}`
    if (!refinedValue) return null
    if (!REGEXP.test(refinedValue)) throw new Error('Invalid phone number.')
    if (refinedValue.length > 15) throw new Error('Phone number too long.')
    return refinedValue
  })

  export const jsonSchema: Json.Schema = {
    type: 'string',
    description: 'A phone number string with optional leading `+`.',
    format: 'phone',
  }

  export const typeScript: string = `/** A phone number, with optional country code. */
type Phone = string`

  export const dependencies: readonly PrimitiveId[] = []
}

const REGEXP = /^\+?\d{3,}$/
