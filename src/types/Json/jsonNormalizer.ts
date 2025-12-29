import { Normalizer } from '../Normalizer'
import { Json } from './Json'

export const jsonNormalizer = new Normalizer((value, warn): Json => {
  if (!isJson(value)) throw new Error('Invalid JSON object.')
  return value
})

function isJson(value: any): boolean {
  return isJsonLeafValue(value) || isJsonArray(value) || isJsonObject(value)
}

function isJsonObject(value: any): boolean {
  return typeof value === 'object' && value !== null && Object.values(value).every(item => isJson(item))
}

function isJsonArray(value: any): boolean {
  return Array.isArray(value) && value.every(item => isJson(item))
}

function isJsonLeafValue(value: any): boolean {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}
