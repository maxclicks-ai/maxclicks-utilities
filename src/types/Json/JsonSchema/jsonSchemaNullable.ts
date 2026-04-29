import { arrayHelpers } from '../../../helpers/native/arrayHelpers'
import { objectHelpers } from '../../../helpers/native/objectHelpers'
import { JsonSchema } from './JsonSchema'

/** Returns the nullable version of the given JSON Schema. */
export function jsonSchemaNullable(jsonSchema: JsonSchema): JsonSchema {
  if (JsonSchema.Any.check(jsonSchema) || JsonSchema.Null.check(jsonSchema)) return jsonSchema

  if (JsonSchema.Const.check(jsonSchema)) {
    if (jsonSchema.const === null) return jsonSchema
    return {
      ...objectHelpers.omit(jsonSchema, 'const'),
      enum: [jsonSchema.const, null],
    }
  }

  if (JsonSchema.Enum.check(jsonSchema)) {
    if (jsonSchema.enum.includes(null)) return jsonSchema
    return {
      ...jsonSchema,
      enum: [...jsonSchema.enum, null],
    }
  }

  if (arrayHelpers.isArray(jsonSchema.type)) return jsonSchema

  return {
    ...jsonSchema,
    type: [jsonSchema.type, 'null'],
  } as JsonSchema
}

export namespace jsonSchemaNullable {}
