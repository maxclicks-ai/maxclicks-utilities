import { Json } from '../../../types/Json'
import { Normalizer } from '../../../types/Normalizer'
import { PrimitiveId } from '../PrimitiveId'

/** ISO 8601 formatted date string: `YYYY-MM-DD` */
export type DateOnly = string & {}

export namespace DateOnly {
  export const id = 'date only'

  export const name = 'DateOnly'

  export const normalizer = new Normalizer((value, warn) => {
    if (value === null) return null

    const date =
      value instanceof Date
        ? value
        : typeof value === 'string' || typeof value === 'number'
          ? new Date(value)
          : undefined
    if (!date || Number.isNaN(date.getTime())) throw new Error('Invalid date.')

    const refinedValue: DateOnly = `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    return refinedValue
  })

  export const jsonSchema: Json.Schema = {
    type: 'string',
    format: 'date',
    description: 'ISO 8601 formatted date string: `YYYY-MM-DD`',
  }

  export const typeScript: string = `/** ISO 8601 formatted date string: \`YYYY-MM-DD\` */
type DateOnly = string`

  export const dependencies: readonly PrimitiveId[] = []
}
