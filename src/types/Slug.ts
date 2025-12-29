import { Normalizer } from './Normalizer'

/** A URL-friendly string consisting of lowercase letters, numbers, and dash (-) characters. */
export type Slug = string

export namespace Slug {
  export const normalizer = Normalizer.stringTrimmedAndLowerCased.chain((value, warn) => {
    if (!value) return null
    if (value.includes(' ')) throw new Error('No spaces are allowed.')
    if (value.length > 100) throw new Error('At most 100 characters.')
    if (REGEX.test(value)) throw new Error('Only latin letters, numbers, and "-" characters are allowed.')
    return value
  })
}

const REGEX = /[^a-z0-9-]/
