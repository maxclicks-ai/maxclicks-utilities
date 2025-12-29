import { arrayHelpers } from './native/arrayHelpers'
import { objectHelpers } from './native/objectHelpers'

/** Deep equality check for JSON-like values. Handles `NaN` and `Date` objects. */
export function haveSameContents(first: any, second: any): boolean {
  switch (typeof first) {
    case 'string':
    case 'bigint':
    case 'boolean':
    case 'symbol':
    case 'undefined':
    case 'function':
      return first === second

    case 'number':
      return Number.isNaN(first) ? Number.isNaN(second) : first === second

    case 'object':
      if (!first) return first === second
      if (arrayHelpers.isArray(first))
        return (
          !!second &&
          typeof second === 'object' &&
          arrayHelpers.isArray(second) &&
          first.length === second.length &&
          first.every((item, index) => haveSameContents(item, second[index]))
        )
      if (first instanceof Date && second instanceof Date)
        return (Number.isNaN(first.getTime()) && Number.isNaN(second.getTime())) || first.getTime() === second.getTime()
      return (
        !!second &&
        typeof second === 'object' &&
        !arrayHelpers.isArray(second) &&
        objectHelpers.entries(first).every(([key, value]) => key in second && haveSameContents(value, second[key])) &&
        objectHelpers.keys(second).every(key => key in first)
      )
  }
}
