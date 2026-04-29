import { arrayHelpers } from '../../../helpers/native/arrayHelpers'
import { Json } from '../Json'
import { isJsonSchemaNullable } from './isJsonSchemaNullable'
import { isJsonSchemaWiderThan } from './isJsonSchemaWiderThan'
import { jsonSchemaNormalizer } from './jsonSchemaNormalizer'
import { jsonSchemaNullable } from './jsonSchemaNullable'

export type JsonSchema =
  | JsonSchema.Any
  | JsonSchema.Const
  | JsonSchema.Enum
  | JsonSchema.Null
  | JsonSchema.String
  | JsonSchema.Number
  | JsonSchema.Integer
  | JsonSchema.Boolean
  | JsonSchema.Array
  | JsonSchema.Object

export namespace JsonSchema {
  export interface Base {
    readonly $comment?: string
    readonly title?: string
    readonly description?: string
    readonly default?: Json
    readonly examples?: readonly Json[]
  }

  export interface Any extends Base {
    readonly type?: undefined
    readonly const?: undefined
    readonly enum?: undefined
  }

  export namespace Any {
    export function check(schema: JsonSchema): schema is Any {
      return schema.type === undefined && !('const' in schema) && !('enum' in schema)
    }
  }

  export interface Const extends Base {
    readonly type?: undefined
    readonly const: Json
  }

  export namespace Const {
    export function check(schema: JsonSchema): schema is Const {
      return 'const' in schema
    }
  }

  export interface Enum extends Base {
    readonly type?: undefined
    readonly enum: readonly Json[]
  }

  export namespace Enum {
    export function check(schema: JsonSchema): schema is Enum {
      return 'enum' in schema
    }
  }

  export interface Null extends Base {
    readonly type: 'null'
  }

  export namespace Null {
    export function check(schema: JsonSchema): schema is Null {
      return schema.type === 'null'
    }
  }

  export interface String extends Base {
    readonly type: 'string' | readonly ['string', 'null']
    readonly minLength?: number
    readonly maxLength?: number
    readonly format?:
      | 'date-time'
      | 'email'
      | 'uri'
      | 'date'
      | 'time'
      | 'hostname'
      | 'ipv4'
      | 'ipv6'
      | 'uuid'
      | (string & {})
  }

  export namespace String {
    export function check(schema: JsonSchema): schema is String {
      return (
        schema.type === 'string' ||
        (arrayHelpers.isArray(schema.type) &&
          (schema.type as readonly (typeof schema.type)[number][]).includes('string'))
      )
    }
  }

  export interface Number extends Base {
    readonly type: 'number' | readonly ['number', 'null']
    readonly minimum?: number
    readonly maximum?: number
    readonly exclusiveMinimum?: number
    readonly exclusiveMaximum?: number
    readonly multipleOf?: number
  }

  export namespace Number {
    export function check(schema: JsonSchema): schema is Number {
      return (
        schema.type === 'number' ||
        (arrayHelpers.isArray(schema.type) &&
          (schema.type as readonly (typeof schema.type)[number][]).includes('number'))
      )
    }
  }

  export interface Integer extends Base {
    readonly type: 'integer' | readonly ['integer', 'null']
    readonly minimum?: number
    readonly maximum?: number
    readonly exclusiveMinimum?: number
    readonly exclusiveMaximum?: number
    readonly multipleOf?: number
  }

  export namespace Integer {
    export function check(schema: JsonSchema): schema is Integer {
      return (
        schema.type === 'integer' ||
        (arrayHelpers.isArray(schema.type) &&
          (schema.type as readonly (typeof schema.type)[number][]).includes('integer'))
      )
    }
  }

  export interface Boolean extends Base {
    readonly type: 'boolean' | readonly ['boolean', 'null']
  }

  export namespace Boolean {
    export function check(schema: JsonSchema): schema is Boolean {
      return (
        schema.type === 'boolean' ||
        (arrayHelpers.isArray(schema.type) &&
          (schema.type as readonly (typeof schema.type)[number][]).includes('boolean'))
      )
    }
  }

  export interface Array extends Base {
    readonly type: 'array' | readonly ['array', 'null']
    readonly items?: JsonSchema
    readonly minItems?: number
    readonly maxItems?: number
  }

  export namespace Array {
    export function check(schema: JsonSchema): schema is Array {
      return (
        schema.type === 'array' ||
        (arrayHelpers.isArray(schema.type) &&
          (schema.type as readonly (typeof schema.type)[number][]).includes('array'))
      )
    }
  }

  export interface Object extends Base {
    readonly type: 'object' | readonly ['object', 'null']
    readonly properties?: Readonly<Record<string, JsonSchema>>
    readonly required?: readonly string[]
    readonly additionalProperties?: JsonSchema | true
  }

  export namespace Object {
    export function check(schema: JsonSchema): schema is Object {
      return (
        schema.type === 'object' ||
        (arrayHelpers.isArray(schema.type) &&
          (schema.type as readonly (typeof schema.type)[number][]).includes('object'))
      )
    }
  }

  export import normalizer = jsonSchemaNormalizer

  export import isWiderThan = isJsonSchemaWiderThan

  export import nullable = jsonSchemaNullable

  export import isNullable = isJsonSchemaNullable
}
