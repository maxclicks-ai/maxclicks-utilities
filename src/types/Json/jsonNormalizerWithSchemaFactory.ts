import { prependMessage } from '../../helpers/error-warning/prependMessage'
import { throwError } from '../../helpers/error-warning/throwError'
import { haveSameContents } from '../../helpers/haveSameContents'
import { DateTime } from '../DateTime'
import { Email } from '../Email'
import { Normalizer } from '../Normalizer'
import { Url } from '../Url'
import { Uuid } from '../Uuid'
import { Json } from './Json'
import { jsonNormalizer } from './jsonNormalizer'

export function jsonNormalizerWithSchemaFactory<T = Json>(schema: Json.Schema): Normalizer<T | null> {
  return jsonNormalizer.chain((value, warn): T | null => {
    if (value === null) return null
    validateAgainstSchema(value, schema, warn, undefined)
    return value as T
  })
}

function validateAgainstSchema(
  value: Json,
  schema: Json.Schema,
  warn: Normalizer.Warn,
  path: string | undefined
): void {
  // Handle const validation
  if ('const' in schema) {
    if (!haveSameContents(value, schema.const))
      throw new Error(prependMessage(path, `Value must be ${JSON.stringify(schema.const)}.`))
    return
  }

  // Handle enum validation
  if ('enum' in schema) {
    if (!schema.enum.some(enumValue => haveSameContents(value, enumValue)))
      throw new Error(
        prependMessage(path, `Value must be one of: ${schema.enum.map(v => JSON.stringify(v)).join(', ')}.`)
      )
    return
  }

  const type = schema.type

  // Any validation (no type or type: 'any')
  if (type === undefined || type === 'any') return

  // Parse type for nullable handling
  const typeArray = Array.isArray(type) ? type : null
  const nullable = typeArray !== null && typeArray.includes('null')
  const typeValue = typeArray ? typeArray.find(t => t !== 'null') : type

  // Handle null values
  if (value === null) {
    if (nullable || typeValue === 'null') return
    throw new Error(prependMessage(path, 'Value cannot be null.'))
  }

  // Null type (but value is not null at this point)
  if (typeValue === 'null') throw new Error(prependMessage(path, 'Value must be null.'))

  // String validation
  if (typeValue === 'string') {
    if (typeof value !== 'string') throw new Error(prependMessage(path, 'Value must be a string.'))
    const stringValue = value as string
    const stringSchema = schema as Json.Schema.StringValidation
    if (stringSchema.minLength !== undefined && stringValue.length < stringSchema.minLength)
      throw new Error(prependMessage(path, `String length must be at least ${stringSchema.minLength}.`))
    if (stringSchema.maxLength !== undefined && stringValue.length > stringSchema.maxLength)
      throw new Error(prependMessage(path, `String length must be at most ${stringSchema.maxLength}.`))
    if (stringSchema.format !== undefined) validateStringFormat(stringValue, stringSchema.format, path, warn)
    return
  }

  // Number/Integer validation
  if (typeValue === 'number' || typeValue === 'integer') {
    if (typeof value !== 'number') throw new Error(prependMessage(path, `Value must be a ${typeValue}.`))
    const numberValue = value as number
    if (typeValue === 'integer' && numberValue % 1 !== 0)
      throw new Error(prependMessage(path, 'Value must be an integer.'))
    const numberSchema = schema as Json.Schema.NumberIntegerValidation
    if (numberSchema.minimum !== undefined && numberValue < numberSchema.minimum)
      throw new Error(prependMessage(path, `Value must be at least ${numberSchema.minimum}.`))
    if (numberSchema.maximum !== undefined && numberValue > numberSchema.maximum)
      throw new Error(prependMessage(path, `Value must be at most ${numberSchema.maximum}.`))
    if (numberSchema.exclusiveMinimum !== undefined && numberValue <= numberSchema.exclusiveMinimum)
      throw new Error(prependMessage(path, `Value must be greater than ${numberSchema.exclusiveMinimum}.`))
    if (numberSchema.exclusiveMaximum !== undefined && numberValue >= numberSchema.exclusiveMaximum)
      throw new Error(prependMessage(path, `Value must be less than ${numberSchema.exclusiveMaximum}.`))
    if (numberSchema.multipleOf !== undefined && numberValue % numberSchema.multipleOf !== 0)
      throw new Error(prependMessage(path, `Value must be a multiple of ${numberSchema.multipleOf}.`))
    return
  }

  // Boolean validation
  if (typeValue === 'boolean') {
    if (typeof value !== 'boolean') throw new Error(prependMessage(path, 'Value must be a boolean.'))
    return
  }

  // Array validation
  if (typeValue === 'array') {
    if (!Array.isArray(value)) throw new Error(prependMessage(path, 'Value must be an array.'))
    const arrayValue = value as readonly Json[]
    const arraySchema = schema as Json.Schema.ArrayValidation
    if (arraySchema.minItems !== undefined && arrayValue.length < arraySchema.minItems)
      throw new Error(prependMessage(path, `Array must have at least ${arraySchema.minItems} item(s).`))
    if (arraySchema.maxItems !== undefined && arrayValue.length > arraySchema.maxItems)
      throw new Error(prependMessage(path, `Array must have at most ${arraySchema.maxItems} item(s).`))
    if (arraySchema.items !== undefined) {
      for (let index = 0; index < arrayValue.length; index++) {
        validateAgainstSchema(arrayValue[index], arraySchema.items, warn, path ? `${path}[${index}]` : `[${index}]`)
      }
    }
    return
  }

  // Object validation
  if (typeValue === 'object') {
    if (typeof value !== 'object' || Array.isArray(value))
      throw new Error(prependMessage(path, 'Value must be an object.'))
    const objectSchema = schema as Json.Schema.ObjectValidation
    const objectValue = value as Record<string, Json>

    // Check required properties
    if (objectSchema.required) {
      for (const requiredKey of objectSchema.required) {
        if (!(requiredKey in objectValue))
          throw new Error(prependMessage(path, `Missing required property "${requiredKey}".`))
      }
    }

    // Validate properties
    const definedProperties = new Set(objectSchema.properties ? Object.keys(objectSchema.properties) : [])

    for (const [key, propertyValue] of Object.entries(objectValue)) {
      const propertyPath = path ? `${path}.${key}` : key

      if (objectSchema.properties && key in objectSchema.properties) {
        validateAgainstSchema(propertyValue, objectSchema.properties[key], warn, propertyPath)
      } else if (objectSchema.additionalProperties !== undefined) {
        if (objectSchema.additionalProperties !== true)
          validateAgainstSchema(propertyValue, objectSchema.additionalProperties, warn, propertyPath)
      } else if (definedProperties.size > 0) {
        warn(prependMessage(propertyPath, 'Unknown property not defined in schema.'))
      }
    }
    return
  }

  throwError(prependMessage(path, `Unsupported schema type "${typeValue}".`))
}

function validateStringFormat(value: string, format: string, path: string | undefined, warn: Normalizer.Warn): void {
  switch (format) {
    case 'date-time': {
      const normalized = DateTime.normalizer.normalize(value)
      if (normalized.errorMessage) throw new Error(prependMessage(path, 'Invalid date-time format.'))
      if (normalized.warningMessage) warn(prependMessage(path, normalized.warningMessage))
      break
    }
    case 'email': {
      const normalized = Email.normalizer.normalize(value)
      if (normalized.errorMessage) throw new Error(prependMessage(path, 'Invalid email format.'))
      if (normalized.warningMessage) warn(prependMessage(path, normalized.warningMessage))
      break
    }
    case 'uuid': {
      const normalized = Uuid.normalizer.normalize(value)
      if (normalized.errorMessage) throw new Error(prependMessage(path, 'Invalid UUID format.'))
      if (normalized.warningMessage) warn(prependMessage(path, normalized.warningMessage))
      break
    }
    case 'uri': {
      const normalized = Url.normalizer.normalize(value)
      if (normalized.errorMessage) throw new Error(prependMessage(path, 'Invalid URI format.'))
      if (normalized.warningMessage) warn(prependMessage(path, normalized.warningMessage))
      break
    }
  }
}
