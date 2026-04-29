import { arrayHelpers } from '../../../helpers/native/arrayHelpers'
import { JsonSchema } from './JsonSchema'

/** Checks if a JSON Schema is nullable (i.e., allows null values). */
export function isJsonSchemaNullable(jsonSchema: JsonSchema): boolean {
  if (JsonSchema.Any.check(jsonSchema) || JsonSchema.Null.check(jsonSchema)) return true
  if (JsonSchema.Const.check(jsonSchema)) return jsonSchema.const === null
  if (JsonSchema.Enum.check(jsonSchema)) return jsonSchema.enum.includes(null)
  if (arrayHelpers.isArray(jsonSchema.type)) return jsonSchema.type.includes('null')
  return false
}

export namespace isJsonSchemaNullable {}
