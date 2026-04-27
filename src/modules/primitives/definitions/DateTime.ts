import { Json } from '../../../types/Json'
import { Normalizer } from '../../../types/Normalizer'
import { PrimitiveId } from '../PrimitiveId'

/** ISO 8601 formatted string: `YYYY-MM-DDTHH:mm:ss.sssZ` */
export type DateTime = string & {}

export namespace DateTime {
  export const id = 'date time'

  export const name = 'DateTime'

  export const normalizer = new Normalizer((value, warn) => {
    if (value === null) return null

    const date =
      value instanceof Date
        ? value
        : typeof value === 'string' || typeof value === 'number'
          ? new Date(value)
          : undefined
    if (!date || Number.isNaN(date.getTime())) throw new Error('Invalid date time.')

    const refinedValue: DateTime = date.toISOString()
    return refinedValue
  })

  export const jsonSchema: Json.Schema = {
    type: 'string',
    format: 'date-time',
    description: 'ISO 8601 formatted string: `YYYY-MM-DDTHH:mm:ss.sssZ`',
  }

  export const typeScript: string = `/** ISO 8601 formatted string: \`YYYY-MM-DDTHH:mm:ss.sssZ\` */
type DateTime = string`

  export const dependencies: readonly PrimitiveId[] = []
}
