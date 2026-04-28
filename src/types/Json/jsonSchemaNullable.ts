import { arrayHelpers } from '../../helpers/native/arrayHelpers'
import { objectHelpers } from '../../helpers/native/objectHelpers'
import { Json } from './Json'

export function jsonSchemaNullable(jsonSchema: Json.Schema): Json.Schema {
  if (!jsonSchema.type) {
    if ('const' in jsonSchema) {
      if (jsonSchema.const === null) return jsonSchema
      return {
        ...objectHelpers.omit(jsonSchema, 'const'),
        enum: [jsonSchema.const, null],
      }
    }

    if ('enum' in jsonSchema) {
      if (jsonSchema.enum.includes(null)) return jsonSchema
      return {
        ...jsonSchema,
        enum: [...jsonSchema.enum, null],
      }
    }

    return jsonSchema
  }

  if (arrayHelpers.isArray(jsonSchema.type)) return jsonSchema

  if (jsonSchema.type === 'any' || jsonSchema.type === 'null') return jsonSchema

  return {
    ...jsonSchema,
    type: [jsonSchema.type, 'null'],
  } as Json.Schema
}
