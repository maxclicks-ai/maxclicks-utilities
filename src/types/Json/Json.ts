import json5 from 'json5'
import { getErrorMessage } from '../../helpers/error-warning/getErrorMessage'
import { jsonNormalizer } from './jsonNormalizer'
import { jsonNormalizerWithSchemaFactory } from './jsonNormalizerWithSchemaFactory'
import { jsonSchemaNormalizer } from './jsonSchemaNormalizer'
import { jsonSchemaSatisfies } from './jsonSchemaSatisfies'

// For more details about JSON schema, see: https://json-schema.org/draft/2020-12

/** Recursive type representing any valid JSON value. */
export type Json = null | string | number | boolean | readonly Json[] | { readonly [key: string]: Json | undefined }

export namespace Json {
  /** Parses a JSON5 string. Throws on invalid input. */
  export function parse<T = any>(value: string, reviver?: ((this: any, key: string, value: any) => any) | null): T {
    return json5.parse(value, reviver)
  }

  /** Parses a JSON5 string. Returns `{ errorMessage }` on failure instead of throwing. */
  export function parseSafe<T = any>(
    value: string,
    reviver?: ((this: any, key: string, value: any) => any) | null
  ): { value: T; errorMessage?: undefined } | { value?: undefined; errorMessage: string } {
    try {
      return { value: json5.parse(value, reviver) }
    } catch (error) {
      return { errorMessage: getErrorMessage(error) }
    }
  }

  /** Converts a JSON value to a JSON5 string. */
  export function stringify(
    value: any,
    replacer?: ((this: any, key: string, value: any) => any) | (string | number)[] | null,
    space?: string | number | null,
    quote?: string | null
  ): string {
    return json5.stringify(value, { replacer, space, quote })
  }

  /** Converts a JSON value to a JSON5 string. Returns `{ errorMessage }` on failure. */
  export function stringifySafe(
    value: any,
    replacer?: ((this: any, key: string, value: any) => any) | (string | number)[] | null,
    space?: string | number | null,
    quote?: string | null
  ): { value: string; errorMessage?: undefined } | { value?: undefined; errorMessage: string } {
    try {
      return { value: json5.stringify(value, { replacer, space, quote }) }
    } catch (error) {
      return { errorMessage: getErrorMessage(error) }
    }
  }

  export const normalizer = jsonNormalizer

  export const normalizerWithSchemaFactory = jsonNormalizerWithSchemaFactory

  export type Schema = Schema.Annotations &
    (
      | Schema.ConstValidation
      | Schema.EnumValidation
      | Schema.AnyValidation
      | Schema.NullValidation
      | Schema.StringValidation
      | Schema.NumberIntegerValidation
      | Schema.BooleanValidation
      | Schema.ArrayValidation
      | Schema.ObjectValidation
    )

  export namespace Schema {
    export interface Annotations {
      readonly $comment?: string
      readonly title?: string
      readonly description?: string
      readonly default?: Json
      readonly examples?: readonly Json[]
    }

    export interface ConstValidation {
      readonly type?: undefined
      readonly const: Json
    }

    export interface EnumValidation {
      readonly type?: undefined
      readonly enum: readonly Json[]
    }

    export interface AnyValidation {
      readonly type?: 'any'
    }

    export interface NullValidation {
      readonly type: 'null'
    }

    export interface StringValidation {
      readonly type: 'string' | readonly ['string', 'null']
      readonly minLength?: number
      readonly maxLength?: number
      readonly format?: 'date-time' | 'email' | 'uuid' | 'uri' | (string & {})
    }

    export interface NumberIntegerValidation {
      readonly type: 'number' | 'integer' | readonly ['number' | 'integer', 'null']
      readonly minimum?: number
      readonly maximum?: number
      readonly exclusiveMinimum?: number
      readonly exclusiveMaximum?: number
      readonly multipleOf?: number
    }

    export interface BooleanValidation {
      readonly type: 'boolean' | readonly ['boolean', 'null']
    }

    export interface ArrayValidation {
      readonly type: 'array' | readonly ['array', 'null']
      readonly items?: Schema
      readonly minItems?: number
      readonly maxItems?: number
    }

    export interface ObjectValidation {
      readonly type: 'object' | readonly ['object', 'null']
      readonly properties?: Readonly<Record<string, Schema>>
      readonly additionalProperties?: Schema | true
      readonly required?: readonly string[]
    }

    /** Normalizer for JSON Schema objects. */
    export const normalizer = jsonSchemaNormalizer

    /** Checks if one schema satisfies (is compatible with) another. */
    export const satisfies = jsonSchemaSatisfies
  }
}
