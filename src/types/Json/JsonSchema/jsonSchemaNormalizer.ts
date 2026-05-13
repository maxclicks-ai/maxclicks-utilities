import { objectHelpers } from '../../../helpers/native/objectHelpers'
import { normalizeArrayInline } from '../../../helpers/normalizeArrayInline'
import { normalizeObjectInline } from '../../../helpers/normalizeObjectInline'
import { descriptionNormalizer } from '../../../modules/common-normalizers/descriptionNormalizer'
import { Normalizer } from '../../Normalizer'
import { Json } from '../Json'
import { jsonNormalizer } from '../jsonNormalizer'
import { JsonSchema } from './JsonSchema'

export const jsonSchemaNormalizer = Normalizer.object.required.chain((value, warn): JsonSchema | null => {
  const schema = value as JsonSchema

  const baseNormalizedItems: Normalizer.Normalized.Items<JsonSchema.Base> = {
    $comment: Normalizer.string.required.normalizeIfExists(schema.$comment),
    title: Normalizer.stringTrimmed.required.normalizeIfExists(schema.title),
    description: descriptionNormalizer.required.normalizeIfExists(schema.description),
    default: jsonNormalizer.normalizeIfExists(schema.default),
    examples: Normalizer.array.chain(Normalizer.arrayItems(jsonNormalizer)).required.normalizeIfExists(schema.examples),
  }

  if (Json.Schema.Any.check(schema))
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
    } satisfies Normalizer.Normalized.Items<JsonSchema.Any>).getValue(warn) as JsonSchema.Any

  if (Json.Schema.Const.check(schema))
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
      const: jsonNormalizer.normalize(schema.const),
    } satisfies Normalizer.Normalized.Items<JsonSchema.Const>).getValue(warn) as JsonSchema.Const

  if (Json.Schema.Enum.check(schema))
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
      enum: Normalizer.array.chain(Normalizer.arrayItems(jsonNormalizer)).required.normalize(schema.enum),
    } satisfies Normalizer.Normalized.Items<JsonSchema.Enum>).getValue(warn) as JsonSchema.Enum

  if (Json.Schema.Null.check(schema))
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
      type: 'null',
    } satisfies Normalizer.Normalized.Items<JsonSchema.Null>).getValue(warn) as JsonSchema.Null

  if (Json.Schema.String.check(schema)) {
    const stringSchema = schema as JsonSchema.String
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
      type: stringSchema.type === 'string' ? 'string' : ['string', 'null'],
      minLength: Normalizer.number.required.normalizeIfExists(stringSchema.minLength),
      maxLength: Normalizer.number.required.normalizeIfExists(stringSchema.maxLength),
      format: Normalizer.string.required.normalizeIfExists(stringSchema.format),
    } satisfies Normalizer.Normalized.Items<JsonSchema.String>).getValue(warn) as JsonSchema.String
  }

  if (Json.Schema.Number.check(schema)) {
    const numberSchema = schema as JsonSchema.Number
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
      type: numberSchema.type === 'number' ? 'number' : ['number', 'null'],
      minimum: Normalizer.number.required.normalizeIfExists(numberSchema.minimum),
      maximum: Normalizer.number.required.normalizeIfExists(numberSchema.maximum),
      exclusiveMinimum: Normalizer.number.required.normalizeIfExists(numberSchema.exclusiveMinimum),
      exclusiveMaximum: Normalizer.number.required.normalizeIfExists(numberSchema.exclusiveMaximum),
      multipleOf: Normalizer.number.required.normalizeIfExists(numberSchema.multipleOf),
    } satisfies Normalizer.Normalized.Items<JsonSchema.Number>).getValue(warn) as JsonSchema.Number
  }

  if (Json.Schema.Integer.check(schema)) {
    const integerSchema = schema as JsonSchema.Integer
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
      type: integerSchema.type === 'integer' ? 'integer' : ['integer', 'null'],
      minimum: Normalizer.number.required.normalizeIfExists(integerSchema.minimum),
      maximum: Normalizer.number.required.normalizeIfExists(integerSchema.maximum),
      exclusiveMinimum: Normalizer.number.required.normalizeIfExists(integerSchema.exclusiveMinimum),
      exclusiveMaximum: Normalizer.number.required.normalizeIfExists(integerSchema.exclusiveMaximum),
      multipleOf: Normalizer.number.required.normalizeIfExists(integerSchema.multipleOf),
    } satisfies Normalizer.Normalized.Items<JsonSchema.Integer>).getValue(warn) as JsonSchema.Integer
  }

  if (Json.Schema.Boolean.check(schema)) {
    const booleanSchema = schema as JsonSchema.Boolean
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
      type: booleanSchema.type === 'boolean' ? 'boolean' : ['boolean', 'null'],
    } satisfies Normalizer.Normalized.Items<JsonSchema.Boolean>).getValue(warn) as JsonSchema.Boolean
  }

  if (Json.Schema.Array.check(schema)) {
    const arraySchema = schema as JsonSchema.Array
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
      type: arraySchema.type === 'array' ? 'array' : ['array', 'null'],
      items: jsonSchemaNormalizer.required.normalizeIfExists(arraySchema.items),
      minItems: Normalizer.number.required.normalizeIfExists(arraySchema.minItems),
      maxItems: Normalizer.number.required.normalizeIfExists(arraySchema.maxItems),
    } satisfies Normalizer.Normalized.Items<JsonSchema.Array>).getValue(warn) as JsonSchema.Array
  }

  if (Json.Schema.Object.check(schema)) {
    const objectSchema = schema as JsonSchema.Object
    const propertiesNormalized = normalizeObjectInline(objectSchema.properties, properties =>
      objectHelpers.map(objectHelpers.onlyExisting(properties), (key, value) =>
        jsonSchemaNormalizer.required.normalize(value)
      )
    )
    if (objectSchema.additionalProperties === false)
      warn('We recommend "additionalProperties" not to be false for maximum schema expandability in the future.')
    return Normalizer.Normalized.combine({
      ...baseNormalizedItems,
      type: objectSchema.type === 'object' ? 'object' : ['object', 'null'],
      properties: propertiesNormalized,
      required: propertiesNormalized.errorMessage
        ? undefined
        : normalizeArrayInline(objectSchema.required, item =>
            Normalizer.string.required
              .chain((value, warn) => {
                if (!(value in (propertiesNormalized.value ?? {})))
                  throw new Error(`Invalid required property "${value}". It must be a key in "properties".`)
                return value
              })
              .normalize(item)
          ),
      additionalProperties:
        typeof objectSchema.additionalProperties === 'boolean'
          ? objectSchema.additionalProperties
          : jsonSchemaNormalizer.required.normalizeIfExists(objectSchema.additionalProperties),
    } satisfies Normalizer.Normalized.Items<JsonSchema.Object>).getValue(warn) as JsonSchema.Object
  }

  throw new Error(`Unsupported type ${JSON.stringify((schema as any).type)}.`)
})

export namespace jsonSchemaNormalizer {}
