import { Json } from '../../../types/Json'
import { Normalizer } from '../../../types/Normalizer'
import { PrimitiveId } from '../PrimitiveId'

/** A string representing a color, typically in hexadecimal format. */
export type Color = string

export namespace Color {
  export const id = 'color'

  export const name = 'Color'

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

  export const jsonSchema: Json.Schema = {
    type: 'string',
    description: 'A string representing a color, typically in hexadecimal format.',
  }

  export const typeScript: string = `/** A string representing a color, typically in hexadecimal format. */
type Color = string`

  export const dependencies: readonly PrimitiveId[] = []
}
