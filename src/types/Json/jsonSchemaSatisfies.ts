import { haveSameContents } from '../../helpers/haveSameContents'
import { Json } from './Json'

/**
 * Checks if the `provided` schema satisfies the `required` schema.
 * In other words, any JSON value valid under `required` (old schema) will also be valid under `provided` (new schema).
 * This is useful for checking backward compatibility when updating schemas.
 *
 * @param provided - The new schema (what the provider now offers)
 * @param required - The old schema (what consumers expect)
 * @returns true if the provided schema accepts all values that required schema accepts
 */
export function jsonSchemaSatisfies(provided: Json.Schema, required: Json.Schema): boolean {
  // If provided accepts any value, it satisfies any required schema
  if (isAnySchema(provided)) return true

  // If required accepts any value, provided must also accept any value
  if (isAnySchema(required)) return isAnySchema(provided)

  // Handle const in required
  if ('const' in required) {
    if ('const' in provided) return haveSameContents(provided.const, required.const)
    if ('enum' in provided) return provided.enum.some(value => haveSameContents(value, required.const))
    // Provided is a typed schema - check if it would accept the const value
    return schemaAcceptsValue(provided, required.const)
  }

  // Handle enum in required
  if ('enum' in required) {
    if ('const' in provided) return required.enum.length === 1 && haveSameContents(provided.const, required.enum[0])
    if ('enum' in provided)
      return required.enum.every(requiredValue =>
        provided.enum.some(providedValue => haveSameContents(providedValue, requiredValue))
      )
    // Provided is a typed schema - check if it would accept all enum values
    return required.enum.every(value => schemaAcceptsValue(provided, value))
  }

  // Handle const/enum in provided when required is a typed schema
  // const/enum are more restrictive than type-based schemas
  if ('const' in provided || 'enum' in provided) return false

  // Both schemas are type-based - compare types and constraints
  const providedBaseType = getBaseType(provided.type)
  const requiredBaseType = getBaseType(required.type)
  const providedNullable = isNullable(provided.type)
  const requiredNullable = isNullable(required.type)

  // If required accepts null, provided must also accept null
  if (requiredNullable && !providedNullable) return false

  // Handle null type
  if (requiredBaseType === 'null') return providedBaseType === 'null' || providedNullable

  // Types must match (with special case: number satisfies integer since number is more permissive)
  if (providedBaseType !== requiredBaseType) {
    if (!(providedBaseType === 'number' && requiredBaseType === 'integer')) return false
  }

  // Type-specific constraint checks
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
      return true // No additional constraints for boolean

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

/**
 * Check if a typed schema would accept a specific JSON value.
 * Used when required has const/enum and provided is type-based.
 */
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
      // Note: format validation is lenient here - we assume the const/enum value is well-formed
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
  // Provided minLength must be <= required minLength (or undefined = no constraint)
  if (required.minLength !== undefined) {
    if (provided.minLength !== undefined && provided.minLength > required.minLength) return false
  }

  // Provided maxLength must be >= required maxLength (or undefined = no constraint)
  if (required.maxLength !== undefined) {
    if (provided.maxLength !== undefined && provided.maxLength < required.maxLength) return false
  }

  // Format: if required has a format, provided must have the same format or no format (more permissive)
  if (required.format !== undefined) {
    if (provided.format !== undefined && provided.format !== required.format) return false
  }

  return true
}

function numberSchemasSatisfy(
  provided: Json.Schema.NumberIntegerValidation,
  required: Json.Schema.NumberIntegerValidation
): boolean {
  // Provided minimum must be <= required minimum
  if (required.minimum !== undefined) {
    if (provided.minimum !== undefined && provided.minimum > required.minimum) return false
  }

  // Provided maximum must be >= required maximum
  if (required.maximum !== undefined) {
    if (provided.maximum !== undefined && provided.maximum < required.maximum) return false
  }

  // Provided exclusiveMinimum must be <= required exclusiveMinimum
  if (required.exclusiveMinimum !== undefined) {
    if (provided.exclusiveMinimum !== undefined && provided.exclusiveMinimum > required.exclusiveMinimum) return false
  }

  // Provided exclusiveMaximum must be >= required exclusiveMaximum
  if (required.exclusiveMaximum !== undefined) {
    if (provided.exclusiveMaximum !== undefined && provided.exclusiveMaximum < required.exclusiveMaximum) return false
  }

  // multipleOf: provided's multipleOf must divide required's multipleOf
  // e.g., if required is multipleOf: 6, provided can be multipleOf: 2 or 3 (accepts more values)
  if (required.multipleOf !== undefined) {
    if (provided.multipleOf !== undefined && required.multipleOf % provided.multipleOf !== 0) return false
  }

  return true
}

function arraySchemasSatisfy(provided: Json.Schema.ArrayValidation, required: Json.Schema.ArrayValidation): boolean {
  // Provided minItems must be <= required minItems
  if (required.minItems !== undefined) {
    if (provided.minItems !== undefined && provided.minItems > required.minItems) return false
  }

  // Provided maxItems must be >= required maxItems
  if (required.maxItems !== undefined) {
    if (provided.maxItems !== undefined && provided.maxItems < required.maxItems) return false
  }

  // Items schema: provided's items must satisfy required's items
  if (required.items !== undefined) {
    if (provided.items === undefined) return true // No constraint = accepts any items
    return jsonSchemaSatisfies(provided.items, required.items)
  }

  return true
}

function objectSchemasSatisfy(provided: Json.Schema.ObjectValidation, required: Json.Schema.ObjectValidation): boolean {
  // Required properties: provided can have fewer required properties (more permissive)
  // But if provided requires a property that required doesn't, it's more restrictive
  if (provided.required) {
    for (const key of provided.required) {
      if (!required.required?.includes(key)) {
        // Provided requires a property that required doesn't - check if required schema would accept objects without it
        // If the property is in required.properties but not required.required, it's optional in required
        // So provided making it required is more restrictive
        return false
      }
    }
  }

  // Properties: for each property in required, check if provided's schema for that property satisfies it
  if (required.properties) {
    for (const [key, requiredPropertySchema] of Object.entries(required.properties)) {
      if (provided.properties && key in provided.properties) {
        if (!jsonSchemaSatisfies(provided.properties[key], requiredPropertySchema)) return false
      } else if (provided.additionalProperties !== undefined) {
        // Property is covered by additionalProperties in provided
        if (provided.additionalProperties === true) continue // Accepts any value
        if (!jsonSchemaSatisfies(provided.additionalProperties, requiredPropertySchema)) return false
      }
      // If property not in provided.properties and no additionalProperties, provided accepts any value for it
    }
  }

  // Additional properties: if required allows additional properties, provided must also allow them
  if (required.additionalProperties !== undefined) {
    if (provided.additionalProperties === undefined) {
      // Provided has no additionalProperties constraint - implicitly accepts any
      return true
    }
    if (required.additionalProperties === true) {
      // Required accepts any additional properties
      return provided.additionalProperties === true
    }
    if (provided.additionalProperties === true) {
      // Provided accepts any additional properties - satisfies any schema
      return true
    }
    // Both have schema constraints - provided must satisfy required
    return jsonSchemaSatisfies(provided.additionalProperties, required.additionalProperties)
  }

  return true
}
