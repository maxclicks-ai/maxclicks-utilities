import { Normalizer } from './Normalizer'

/** ISO formatted time string: `HH:mm:ss.sss` */
export type TimeOnly = string

export namespace TimeOnly {
  export const normalizer = new Normalizer((value, warn) => {
    if (value === null) return null

    const date =
      value instanceof Date
        ? value
        : typeof value === 'string' || typeof value === 'number'
          ? new Date(value)
          : undefined
    if (date) {
      if (Number.isNaN(date.getTime())) throw new Error('Invalid date.')
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`
    }

    if (typeof value === 'string' && REGEX.test(value)) return value

    throw new Error('Invalid time.')
  })
}

const REGEX = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)\.(\d{1,3})$/
