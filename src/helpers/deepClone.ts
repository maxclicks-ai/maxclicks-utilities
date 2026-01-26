import { DeepWritable } from '../types'
import { Json } from '../types/Json/Json'

/** Creates a deep copy of a JSON value, removing readonly modifiers from the type. */
export function deepClone<T extends Json>(value: T): DeepWritable<T> {
  if (!value || typeof value !== 'object') return value as any
  if (Array.isArray(value)) return value.map(deepClone) as any
  const result: any = {}
  for (const key in value) result[key] = deepClone((value as any)[key])
  return result
}
