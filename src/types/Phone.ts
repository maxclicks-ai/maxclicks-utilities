import { Normalizer } from './Normalizer'

/** A phone number string with optional leading `+`. */
export type Phone = string

export namespace Phone {
  export const normalizer = Normalizer.string.chain((value, warn) => {
    const refinedValue = value && `${value.trimStart().startsWith('+') ? '+' : ''}${value.replace(/[^0-9]/g, '')}`
    if (!refinedValue) return null
    if (!REGEXP.test(refinedValue)) throw new Error('Invalid phone number.')
    if (refinedValue.length > 15) throw new Error('Phone number too long.')
    return refinedValue
  })
}

const REGEXP = /^\+?\d{3,}$/
