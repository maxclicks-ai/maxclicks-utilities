import { Normalizer } from './Normalizer'

/** String representation for decimal numbers with up to 15 integer and 5 fractional digits, with support for negative values. */
export type Decimal = string

export namespace Decimal {
  export const normalizer = Normalizer.stringTrimmed.chain((value, warn) => {
    if (value === null) return null
    if (!CHECK_REGEX.test(value)) throw new Error('Invalid decimal format.')
    const valueWithNoLeadingZeros = value.replace(NO_LEADING_ZEROS_REGEX, '$1$2')
    const [, sign, integerPart, fractionalPart = ''] = valueWithNoLeadingZeros.match(BREAK_DOWN_REGEX)!
    if (integerPart.length > 15) throw new Error('Decimal integer part exceeds maximum length of 15 digits.')
    if (fractionalPart.length > 5) warn('Decimal fractional part exceeds recommended length of 5 digits.')
    const refinedValue: Decimal =
      fractionalPart.length > 0 ? `${sign}${integerPart}.${fractionalPart}` : `${sign}${integerPart}`
    return refinedValue
  })
}

const CHECK_REGEX = /^-?\d+(\.\d+)?$/
const NO_LEADING_ZEROS_REGEX = /^(-?)0+(\d)/
const BREAK_DOWN_REGEX = /^(-?)(\d+)(?:\.(\d+))?$/
