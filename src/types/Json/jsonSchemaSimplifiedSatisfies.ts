import { haveSameContents } from '../../helpers/haveSameContents'
import { Json } from './Json'

/** Checks if any JSON value valid under `required` (old) will also be valid under `provided` (new). */
export function jsonSchemaSatisfies(provided: Json.Schema, required: Json.Schema): boolean {
  if (isAnySchema(provided)) return true
  if (isAnySchema(required)) return isAnySchema(provided)

  if ('const' in required) {
    if ('const' in provided) return haveSameContents(provided.const, required.const)
    if ('enum' in provided) return provided.enum.some(value => haveSameContents(value, required.const))
    return schemaAcceptsValue(provided, required.const)
  }

  if ('enum' in required) {
    if ('const' in provided) return required.enum.length === 1 && haveSameContents(provided.const, required.enum[0])
    if ('enum' in provided)
      return required.enum.every(requiredValue =>
        provided.enum.some(providedValue => haveSameContents(providedValue, requiredValue))
      )
    return required.enum.every(value => schemaAcceptsValue(provided, value))
  }

  if ('const' in provided || 'enum' in provided) return false

  const providedBaseType = getBaseType(provided.type)
  const requiredBaseType = getBaseType(required.type)
  const providedNullable = isNullable(provided.type)
  const requiredNullable = isNullable(required.type)

  if (requiredNullable && !providedNullable) return false
  if (requiredBaseType === 'null') return providedBaseType === 'null' || providedNullable

  if (providedBaseType !== requiredBaseType) {
    // number satisfies integer since number is more permissive
    if (!(providedBaseType === 'number' && requiredBaseType === 'integer')) return false
  }

  switch (requiredBaseType) {
    case 'string':
      return stringSchemasSatisfy(provided as Json.Schema.StringValidation, required as Json.Schema.StringValidation)

    case 'number':
    case 'integer':
      return numberSchemasSatisfy(
        provided as Json.Schema.NumberIntegerValidation,
        required as Json.Schema.NumberIntegerValidation
      )

    case 'boolean':
      return true

    case 'array':
      return arraySchemasSatisfy(provided as Json.Schema.ArrayValidation, required as Json.Schema.ArrayValidation)

    case 'object':
      return objectSchemasSatisfy(provided as Json.Schema.ObjectValidation, required as Json.Schema.ObjectValidation)

    default:
      return false
  }
}

function isAnySchema(schema: Json.Schema): boolean {
  return !('const' in schema) && !('enum' in schema) && (schema.type === undefined || schema.type === 'any')
}

type BaseType = 'any' | 'null' | 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'

function getBaseType(type: Json.Schema['type']): BaseType {
  if (type === undefined) return 'any'
  if (Array.isArray(type)) return type.find(t => t !== 'null') as BaseType
  return type as BaseType
}

function isNullable(type: Json.Schema['type']): boolean {
  if (type === 'null') return true
  if (Array.isArray(type)) return type.includes('null')
  return false
}

function schemaAcceptsValue(schema: Json.Schema, value: Json): boolean {
  if (isAnySchema(schema)) return true

  const baseType = getBaseType(schema.type)
  const nullable = isNullable(schema.type)

  if (value === null) return nullable || baseType === 'null'

  switch (baseType) {
    case 'null':
      return value === null

    case 'string': {
      if (typeof value !== 'string') return false
      const stringSchema = schema as Json.Schema.StringValidation
      if (stringSchema.minLength !== undefined && value.length < stringSchema.minLength) return false
      if (stringSchema.maxLength !== undefined && value.length > stringSchema.maxLength) return false
      return true
    }

    case 'number':
    case 'integer': {
      if (typeof value !== 'number') return false
      if (baseType === 'integer' && value % 1 !== 0) return false
      const numberSchema = schema as Json.Schema.NumberIntegerValidation
      if (numberSchema.minimum !== undefined && value < numberSchema.minimum) return false
      if (numberSchema.maximum !== undefined && value > numberSchema.maximum) return false
      if (numberSchema.exclusiveMinimum !== undefined && value <= numberSchema.exclusiveMinimum) return false
      if (numberSchema.exclusiveMaximum !== undefined && value >= numberSchema.exclusiveMaximum) return false
      if (numberSchema.multipleOf !== undefined && value % numberSchema.multipleOf !== 0) return false
      return true
    }

    case 'boolean':
      return typeof value === 'boolean'

    case 'array': {
      if (!Array.isArray(value)) return false
      const arraySchema = schema as Json.Schema.ArrayValidation
      if (arraySchema.minItems !== undefined && value.length < arraySchema.minItems) return false
      if (arraySchema.maxItems !== undefined && value.length > arraySchema.maxItems) return false
      if (arraySchema.items !== undefined) return value.every(item => schemaAcceptsValue(arraySchema.items!, item))
      return true
    }

    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value) || value === null) return false
      const objectSchema = schema as Json.Schema.ObjectValidation
      const objectValue = value as Record<string, Json>
      if (objectSchema.required) {
        for (const key of objectSchema.required) {
          if (!(key in objectValue)) return false
        }
      }
      for (const [key, propertyValue] of Object.entries(objectValue)) {
        if (objectSchema.properties && key in objectSchema.properties) {
          if (!schemaAcceptsValue(objectSchema.properties[key], propertyValue)) return false
        } else if (objectSchema.additionalProperties !== undefined && objectSchema.additionalProperties !== true) {
          if (!schemaAcceptsValue(objectSchema.additionalProperties, propertyValue)) return false
        }
      }
      return true
    }

    default:
      return false
  }
}

function stringSchemasSatisfy(provided: Json.Schema.StringValidation, required: Json.Schema.StringValidation): boolean {
  if (required.minLength !== undefined && provided.minLength !== undefined && provided.minLength > required.minLength)
    return false
  if (required.maxLength !== undefined && provided.maxLength !== undefined && provided.maxLength < required.maxLength)
    return false
  if (required.format !== undefined && provided.format !== undefined && provided.format !== required.format)
    return false
  return true
}

function numberSchemasSatisfy(
  provided: Json.Schema.NumberIntegerValidation,
  required: Json.Schema.NumberIntegerValidation
): boolean {
  if (required.minimum !== undefined && provided.minimum !== undefined && provided.minimum > required.minimum)
    return false
  if (required.maximum !== undefined && provided.maximum !== undefined && provided.maximum < required.maximum)
    return false
  if (
    required.exclusiveMinimum !== undefined &&
    provided.exclusiveMinimum !== undefined &&
    provided.exclusiveMinimum > required.exclusiveMinimum
  )
    return false
  if (
    required.exclusiveMaximum !== undefined &&
    provided.exclusiveMaximum !== undefined &&
    provided.exclusiveMaximum < required.exclusiveMaximum
  )
    return false
  if (
    required.multipleOf !== undefined &&
    provided.multipleOf !== undefined &&
    required.multipleOf % provided.multipleOf !== 0
  )
    return false
  return true
}

function arraySchemasSatisfy(provided: Json.Schema.ArrayValidation, required: Json.Schema.ArrayValidation): boolean {
  if (required.minItems !== undefined && provided.minItems !== undefined && provided.minItems > required.minItems)
    return false
  if (required.maxItems !== undefined && provided.maxItems !== undefined && provided.maxItems < required.maxItems)
    return false
  if (required.items !== undefined) {
    if (provided.items === undefined) return true
    return jsonSchemaSatisfies(provided.items, required.items)
  }
  return true
}

function objectSchemasSatisfy(provided: Json.Schema.ObjectValidation, required: Json.Schema.ObjectValidation): boolean {
  if (provided.required) {
    for (const key of provided.required) {
      if (!required.required?.includes(key)) return false
    }
  }

  if (required.properties) {
    for (const [key, requiredPropertySchema] of Object.entries(required.properties)) {
      if (provided.properties && key in provided.properties) {
        if (!jsonSchemaSatisfies(provided.properties[key], requiredPropertySchema)) return false
      } else if (provided.additionalProperties !== undefined) {
        if (provided.additionalProperties === true) continue
        if (!jsonSchemaSatisfies(provided.additionalProperties, requiredPropertySchema)) return false
      }
    }
  }

  if (required.additionalProperties !== undefined) {
    if (provided.additionalProperties === undefined) return true
    if (required.additionalProperties === true) return provided.additionalProperties === true
    if (provided.additionalProperties === true) return true
    return jsonSchemaSatisfies(provided.additionalProperties, required.additionalProperties)
  }

  return true
}
