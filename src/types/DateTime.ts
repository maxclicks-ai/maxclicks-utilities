import { Normalizer } from './Normalizer'

/** ISO formatted string: `YYYY-MM-DDTHH:mm:ss.sssZ` */
export type DateTime = string

export namespace DateTime {
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
}
