import { Normalizer } from './Normalizer'

/** ISO formatted date string: `YYYY-MM-DD` */
export type DateOnly = string

export namespace DateOnly {
  /** Normalizer that parses dates/strings/numbers into ISO date format. */
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
}
