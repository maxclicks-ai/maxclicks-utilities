import { prependMessage } from '../../helpers/error-warning/prependMessage'
import { haveSameContents } from '../../helpers/haveSameContents'
import { objectHelpers } from '../../helpers/native/objectHelpers'
import { DateOnly, DateTime, Email, TimeOnly, Url, Uuid } from '../../modules/primitives'
import { Normalizer } from '../Normalizer'
import { Warn } from '../Warn'
import { Json } from './Json'
import { jsonNormalizer } from './jsonNormalizer'
import { JsonSchema } from './JsonSchema'

export function jsonNormalizerWithSchemaFactory<T = Json>(jsonSchema: JsonSchema): Normalizer<T> {
  return jsonNormalizer.chain((value, warn): T => normalize(value, jsonSchema, warn, undefined) as T)
}

export namespace jsonNormalizerWithSchemaFactory {}

function normalize(value: Json, jsonSchema: JsonSchema, warn: Warn, path: string | undefined): Json {
  if (JsonSchema.Any.check(jsonSchema)) return value

  if (JsonSchema.Const.check(jsonSchema)) {
    if (!haveSameContents(value, jsonSchema.const))
      throw new Error(prependMessage(path, `Value must be ${JSON.stringify(jsonSchema.const)}.`))
    return jsonSchema.const
  }

  if (JsonSchema.Enum.check(jsonSchema)) {
    const index = jsonSchema.enum.findIndex(enumValue => haveSameContents(value, enumValue))
    if (index < 0)
      throw new Error(
        prependMessage(
          path,
          `Value must be one of: ${jsonSchema.enum.map(enumValue => JSON.stringify(enumValue)).join(', ')}.`
        )
      )
    return jsonSchema.enum[index]
  }

  if (JsonSchema.Null.check(jsonSchema)) {
    if (value !== null) throw new Error(prependMessage(path, 'Value must be null.'))
    return null
  }

  if (JsonSchema.String.check(jsonSchema)) {
    if (value === null) {
      if (!JsonSchema.isNullable(jsonSchema)) throw new Error(prependMessage(path, 'Value cannot be null.'))
      return null
    }
    const valueNormalized = Normalizer.string.required.normalize(value)
    if (valueNormalized.errorMessage) throw new Error(prependMessage(path, valueNormalized.errorMessage))
    if (valueNormalized.warningMessage) warn(prependMessage(path, valueNormalized.warningMessage))
    const valueNormalizedValue = valueNormalized.value
    if (jsonSchema.minLength !== undefined && valueNormalizedValue.length < jsonSchema.minLength)
      throw new Error(prependMessage(path, `String length must be at least ${jsonSchema.minLength}.`))
    if (jsonSchema.maxLength !== undefined && valueNormalizedValue.length > jsonSchema.maxLength)
      throw new Error(prependMessage(path, `String length must be at most ${jsonSchema.maxLength}.`))
    const formatNormalizer = ((): Normalizer<string> | null => {
      switch (jsonSchema.format) {
        case undefined:
          return null

        case 'date-time':
          return DateTime.normalizer.required

        case 'email':
          return Email.normalizer.required

        case 'uri':
          return Url.normalizer.required

        case 'date':
          return DateOnly.normalizer.required

        case 'time':
          return TimeOnly.normalizer.required

        case 'hostname':
          return null // TODO: Provide a better normalizer.

        case 'ipv4':
          return null // TODO: Provide a better normalizer.

        case 'ipv6':
          return null // TODO: Provide a better normalizer.

        case 'uuid':
          return Uuid.normalizer.required

        default:
          return null
      }
    })()
    if (!formatNormalizer) return valueNormalizedValue
    const formatNormalized = formatNormalizer.normalize(valueNormalizedValue)
    if (formatNormalized.errorMessage) {
      warn(prependMessage(path, formatNormalized.errorMessage))
      return valueNormalizedValue
    }
    if (formatNormalized.warningMessage) warn(prependMessage(path, formatNormalized.warningMessage))
    return formatNormalized.value
  }

  if (JsonSchema.Number.check(jsonSchema)) {
    if (value === null) {
      if (!JsonSchema.isNullable(jsonSchema)) throw new Error(prependMessage(path, 'Value cannot be null.'))
      return null
    }
    const valueNormalized = Normalizer.number.required.normalize(value)
    if (valueNormalized.errorMessage) throw new Error(prependMessage(path, valueNormalized.errorMessage))
    if (valueNormalized.warningMessage) warn(prependMessage(path, valueNormalized.warningMessage))
    const valueNormalizedValue = valueNormalized.value
    if (!Number.isFinite(valueNormalizedValue)) throw new Error(prependMessage(path, 'Value must be a finite number.'))
    if (jsonSchema.minimum !== undefined && valueNormalizedValue < jsonSchema.minimum)
      throw new Error(prependMessage(path, `Value must be at least ${jsonSchema.minimum}.`))
    if (jsonSchema.maximum !== undefined && valueNormalizedValue > jsonSchema.maximum)
      throw new Error(prependMessage(path, `Value must be at most ${jsonSchema.maximum}.`))
    if (jsonSchema.exclusiveMinimum !== undefined && valueNormalizedValue <= jsonSchema.exclusiveMinimum)
      throw new Error(prependMessage(path, `Value must be greater than ${jsonSchema.exclusiveMinimum}.`))
    if (jsonSchema.exclusiveMaximum !== undefined && valueNormalizedValue >= jsonSchema.exclusiveMaximum)
      throw new Error(prependMessage(path, `Value must be less than ${jsonSchema.exclusiveMaximum}.`))
    if (jsonSchema.multipleOf !== undefined && valueNormalizedValue % jsonSchema.multipleOf !== 0)
      throw new Error(prependMessage(path, `Value must be a multiple of ${jsonSchema.multipleOf}.`))
    return valueNormalizedValue
  }

  if (JsonSchema.Integer.check(jsonSchema)) {
    if (value === null) {
      if (!JsonSchema.isNullable(jsonSchema)) throw new Error(prependMessage(path, 'Value cannot be null.'))
      return null
    }
    const valueNormalized = Normalizer.number.required.normalize(value)
    if (valueNormalized.errorMessage) throw new Error(prependMessage(path, valueNormalized.errorMessage))
    if (valueNormalized.warningMessage) warn(prependMessage(path, valueNormalized.warningMessage))
    const valueNormalizedValue = valueNormalized.value
    if (!Number.isFinite(valueNormalizedValue)) throw new Error(prependMessage(path, 'Value must be a finite number.'))
    if (!Number.isInteger(valueNormalizedValue)) throw new Error(prependMessage(path, 'Value must be an integer.'))
    if (jsonSchema.minimum !== undefined && valueNormalizedValue < jsonSchema.minimum)
      throw new Error(prependMessage(path, `Value must be at least ${jsonSchema.minimum}.`))
    if (jsonSchema.maximum !== undefined && valueNormalizedValue > jsonSchema.maximum)
      throw new Error(prependMessage(path, `Value must be at most ${jsonSchema.maximum}.`))
    if (jsonSchema.exclusiveMinimum !== undefined && valueNormalizedValue <= jsonSchema.exclusiveMinimum)
      throw new Error(prependMessage(path, `Value must be greater than ${jsonSchema.exclusiveMinimum}.`))
    if (jsonSchema.exclusiveMaximum !== undefined && valueNormalizedValue >= jsonSchema.exclusiveMaximum)
      throw new Error(prependMessage(path, `Value must be less than ${jsonSchema.exclusiveMaximum}.`))
    if (jsonSchema.multipleOf !== undefined && valueNormalizedValue % jsonSchema.multipleOf !== 0)
      throw new Error(prependMessage(path, `Value must be a multiple of ${jsonSchema.multipleOf}.`))
    return valueNormalizedValue
  }

  if (JsonSchema.Boolean.check(jsonSchema)) {
    if (value === null) {
      if (!JsonSchema.isNullable(jsonSchema)) throw new Error(prependMessage(path, 'Value cannot be null.'))
      return null
    }
    const valueNormalized = Normalizer.boolean.required.normalize(value)
    if (valueNormalized.errorMessage) throw new Error(prependMessage(path, valueNormalized.errorMessage))
    if (valueNormalized.warningMessage) warn(prependMessage(path, valueNormalized.warningMessage))
    return valueNormalized.value
  }

  if (JsonSchema.Array.check(jsonSchema)) {
    if (value === null) {
      if (!JsonSchema.isNullable(jsonSchema)) throw new Error(prependMessage(path, 'Value cannot be null.'))
      return null
    }
    const valueNormalized = Normalizer.array.required.normalize(value)
    if (valueNormalized.errorMessage) throw new Error(prependMessage(path, valueNormalized.errorMessage))
    if (valueNormalized.warningMessage) warn(prependMessage(path, valueNormalized.warningMessage))
    const valueNormalizedValue = valueNormalized.value
    if (jsonSchema.minItems !== undefined && valueNormalizedValue.length < jsonSchema.minItems)
      throw new Error(prependMessage(path, `Array must have at least ${jsonSchema.minItems} item(s).`))
    if (jsonSchema.maxItems !== undefined && valueNormalizedValue.length > jsonSchema.maxItems)
      throw new Error(prependMessage(path, `Array must have at most ${jsonSchema.maxItems} item(s).`))
    if (jsonSchema.items !== undefined)
      return valueNormalizedValue.map((item, index) =>
        normalize(item, jsonSchema.items!, warn, path ? `${path}[${index}]` : `[${index}]`)
      )
    return valueNormalizedValue
  }

  if (JsonSchema.Object.check(jsonSchema)) {
    if (value === null) {
      if (!JsonSchema.isNullable(jsonSchema)) throw new Error(prependMessage(path, 'Value cannot be null.'))
      return null
    }
    const valueNormalized = Normalizer.object.required.normalize(value)
    if (valueNormalized.errorMessage) throw new Error(prependMessage(path, valueNormalized.errorMessage))
    if (valueNormalized.warningMessage) warn(prependMessage(path, valueNormalized.warningMessage))
    const valueNormalizedValue = valueNormalized.value as Record<string, any>
    const jsonSchemaProperties = jsonSchema.properties ?? {}
    const jsonSchemaRequired = new Set(jsonSchema.required ?? [])
    const propertyNormalizedValue = objectHelpers.map(
      objectHelpers.onlyExisting(valueNormalizedValue),
      (key, value) => {
        const itemPath = path ? `${path}.${key}` : key
        if (key in jsonSchemaProperties && jsonSchemaProperties[key] !== undefined)
          return normalize(value, jsonSchemaProperties[key], warn, itemPath)
        if (jsonSchema.additionalProperties === true) return value
        if (jsonSchema.additionalProperties === undefined) return value
        return normalize(value, jsonSchema.additionalProperties, warn, itemPath)
      }
    )
    for (const requiredKey of jsonSchemaRequired) {
      if (propertyNormalizedValue[requiredKey] === undefined)
        throw new Error(prependMessage(path, `Missing required property: ${requiredKey}.`))
    }
    return propertyNormalizedValue
  }

  throw new Error(prependMessage(path, 'Invalid JSON Schema.'))
}
