import { objectHelpers } from '../../helpers/native/objectHelpers'
import { Json } from './Json'
import { jsonNormalizer } from './jsonNormalizer'

export const jsonSchemaNormalizer = jsonNormalizer.chain((value, warn): Json.Schema | null => {
  if (value === null) return null

  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('Schema must be an object.')

  const schema = value as Record<string, Json>

  // Extract and validate annotations
  const { $comment, title, description, default: defaultValue, examples, ...rest } = schema

  if ($comment !== undefined && typeof $comment !== 'string') throw new Error('"$comment" must be a string.')
  if (title !== undefined && typeof title !== 'string') throw new Error('"title" must be a string.')
  if (description !== undefined && typeof description !== 'string') throw new Error('"description" must be a string.')
  if (examples !== undefined && !Array.isArray(examples)) throw new Error('"examples" must be an array.')

  // Check for const validation
  if ('const' in rest) {
    const { const: constValue, ...afterConst } = rest
    const unsupportedKeys = objectHelpers.keys(afterConst)
    if (unsupportedKeys.length > 0)
      throw new Error(
        `When "const" is declared, these properties are not supported: ${unsupportedKeys.map(k => `"${k}"`).join(', ')}.`
      )
    return value as Json.Schema
  }

  // Check for enum validation
  if ('enum' in rest) {
    const { enum: enumValue, ...afterEnum } = rest
    if (!Array.isArray(enumValue)) throw new Error('"enum" must be an array.')
    if (enumValue.length === 0) throw new Error('"enum" must have at least one value.')
    const unsupportedKeys = objectHelpers.keys(afterEnum)
    if (unsupportedKeys.length > 0)
      throw new Error(
        `When "enum" is declared, these properties are not supported: ${unsupportedKeys.map(k => `"${k}"`).join(', ')}.`
      )
    return value as Json.Schema
  }

  const { type, ...afterType } = rest

  // Any validation (no type or type: 'any')
  if (type === undefined || type === 'any') {
    const unsupportedKeys = objectHelpers.keys(afterType)
    if (unsupportedKeys.length > 0)
      throw new Error(
        `When ${type === undefined ? 'no type is specified' : 'type is "any"'}, these properties are not supported: ${unsupportedKeys.map(k => `"${k}"`).join(', ')}.`
      )
    return value as Json.Schema
  }

  // Parse type (handle nullable types like ['string', 'null'])
  const typeArray = Array.isArray(type) ? type : null
  const nullable = typeArray !== null && typeArray.includes('null')
  const typeValues = typeArray ? typeArray.filter(t => t !== 'null') : [type]

  if (typeValues.length !== 1)
    throw new Error('Type must be a single type or a tuple of [type, "null"] for nullable types.')

  const typeValue = typeValues[0]

  if (typeof typeValue !== 'string') throw new Error('"type" must be a string or an array of strings.')

  // Null validation
  if (typeValue === 'null') {
    const unsupportedKeys = objectHelpers.keys(afterType)
    if (unsupportedKeys.length > 0)
      throw new Error(
        `When type is "null", these properties are not supported: ${unsupportedKeys.map(k => `"${k}"`).join(', ')}.`
      )
    return value as Json.Schema
  }

  // String validation
  if (typeValue === 'string') {
    const { minLength, maxLength, format, ...remaining } = afterType
    const unsupportedKeys = objectHelpers.keys(remaining)
    if (unsupportedKeys.length > 0)
      throw new Error(
        `When type is "string", these properties are not supported: ${unsupportedKeys.map(k => `"${k}"`).join(', ')}.`
      )
    if (minLength !== undefined) {
      if (typeof minLength !== 'number') throw new Error('"minLength" must be a number.')
      if (minLength < 0) throw new Error('"minLength" cannot be negative.')
      if (minLength % 1 !== 0) throw new Error('"minLength" must be an integer.')
    }
    if (maxLength !== undefined) {
      if (typeof maxLength !== 'number') throw new Error('"maxLength" must be a number.')
      if (maxLength < 0) throw new Error('"maxLength" cannot be negative.')
      if (maxLength % 1 !== 0) throw new Error('"maxLength" must be an integer.')
      if (minLength !== undefined && maxLength < (minLength as number))
        throw new Error('"maxLength" cannot be less than "minLength".')
    }
    if (format !== undefined && typeof format !== 'string') throw new Error('"format" must be a string.')
    return value as Json.Schema
  }

  // Number/Integer validation
  if (typeValue === 'number' || typeValue === 'integer') {
    const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, ...remaining } = afterType
    const unsupportedKeys = objectHelpers.keys(remaining)
    if (unsupportedKeys.length > 0)
      throw new Error(
        `When type is "${typeValue}", these properties are not supported: ${unsupportedKeys.map(k => `"${k}"`).join(', ')}.`
      )
    if (minimum !== undefined && typeof minimum !== 'number') throw new Error('"minimum" must be a number.')
    if (maximum !== undefined && typeof maximum !== 'number') throw new Error('"maximum" must be a number.')
    if (minimum !== undefined && maximum !== undefined && (maximum as number) < (minimum as number))
      throw new Error('"maximum" cannot be less than "minimum".')
    if (exclusiveMinimum !== undefined && typeof exclusiveMinimum !== 'number')
      throw new Error('"exclusiveMinimum" must be a number.')
    if (exclusiveMaximum !== undefined && typeof exclusiveMaximum !== 'number')
      throw new Error('"exclusiveMaximum" must be a number.')
    if (
      exclusiveMinimum !== undefined &&
      exclusiveMaximum !== undefined &&
      (exclusiveMaximum as number) <= (exclusiveMinimum as number)
    )
      throw new Error('"exclusiveMaximum" must be greater than "exclusiveMinimum".')
    if (multipleOf !== undefined) {
      if (typeof multipleOf !== 'number') throw new Error('"multipleOf" must be a number.')
      if (multipleOf <= 0) throw new Error('"multipleOf" must be positive.')
    }
    return value as Json.Schema
  }

  // Boolean validation
  if (typeValue === 'boolean') {
    const unsupportedKeys = objectHelpers.keys(afterType)
    if (unsupportedKeys.length > 0)
      throw new Error(
        `When type is "boolean", these properties are not supported: ${unsupportedKeys.map(k => `"${k}"`).join(', ')}.`
      )
    return value as Json.Schema
  }

  // Array validation
  if (typeValue === 'array') {
    const { items, minItems, maxItems, ...remaining } = afterType
    const unsupportedKeys = objectHelpers.keys(remaining)
    if (unsupportedKeys.length > 0)
      throw new Error(
        `When type is "array", these properties are not supported: ${unsupportedKeys.map(k => `"${k}"`).join(', ')}.`
      )
    if (items !== undefined) jsonSchemaNormalizer.required.normalize(items).getValue('items', warn)
    if (minItems !== undefined) {
      if (typeof minItems !== 'number') throw new Error('"minItems" must be a number.')
      if (minItems < 0) throw new Error('"minItems" cannot be negative.')
      if (minItems % 1 !== 0) throw new Error('"minItems" must be an integer.')
    }
    if (maxItems !== undefined) {
      if (typeof maxItems !== 'number') throw new Error('"maxItems" must be a number.')
      if (maxItems < 0) throw new Error('"maxItems" cannot be negative.')
      if (maxItems % 1 !== 0) throw new Error('"maxItems" must be an integer.')
      if (minItems !== undefined && maxItems < (minItems as number))
        throw new Error('"maxItems" cannot be less than "minItems".')
    }
    return value as Json.Schema
  }

  // Object validation
  if (typeValue === 'object') {
    const { properties, additionalProperties, required, ...remaining } = afterType
    const unsupportedKeys = objectHelpers.keys(remaining)
    if (unsupportedKeys.length > 0)
      throw new Error(
        `When type is "object", these properties are not supported: ${unsupportedKeys.map(k => `"${k}"`).join(', ')}.`
      )
    if (properties !== undefined) {
      if (typeof properties !== 'object' || properties === null || Array.isArray(properties))
        throw new Error('"properties" must be an object.')
      for (const [key, propertySchema] of Object.entries(properties)) {
        jsonSchemaNormalizer.required.normalize(propertySchema).getValue(`properties.${key}`, warn)
      }
    }
    if (additionalProperties !== undefined && additionalProperties !== true) {
      jsonSchemaNormalizer.required.normalize(additionalProperties).getValue('additionalProperties', warn)
    }
    if (required !== undefined) {
      if (!Array.isArray(required)) throw new Error('"required" must be an array.')
      for (const item of required) {
        if (typeof item !== 'string') throw new Error('"required" array must contain only strings.')
      }
    }
    return value as Json.Schema
  }

  throw new Error(`Unsupported type "${typeValue}".`)
})
