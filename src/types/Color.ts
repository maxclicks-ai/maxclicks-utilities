import { Normalizer } from './Normalizer'

/** A string representing a color, typically in hexadecimal format. */
export type Color = string

export namespace Color {
  export const normalizer = Normalizer.stringTrimmedAndLowerCased.chain((value, warn) => {
    if (!value) return null
    if (value.startsWith('#')) {
      if (value.length !== 4 && value.length !== 5 && value.length !== 7 && value.length !== 9)
        throw new Error('Invalid color format.')
      if (
        value
          .slice(1)
          .split('')
          .some(character => character < '0' || character > 'f')
      )
        throw new Error('Invalid color scheme.')
    }
    return value
  })
}
