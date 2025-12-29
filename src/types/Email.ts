import { Normalizer } from './Normalizer'

/** A lowercase email address string. */
export type Email = string

export namespace Email {
  export const normalizer = Normalizer.stringTrimmed.chain((value, warn) => {
    const refinedValue = value?.toLowerCase()
    if (!refinedValue) return null
    if (!REGEXP.test(refinedValue)) throw new Error('Invalid email address.')
    return refinedValue
  })
}

const REGEXP =
  /^([a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/
