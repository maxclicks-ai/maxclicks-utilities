import json5 from 'json5'
import { getErrorMessage } from '../../helpers/error-warning/getErrorMessage'
import { jsonNormalizer } from './jsonNormalizer'
import { jsonNormalizerWithSchemaFactory } from './jsonNormalizerWithSchemaFactory'
import { JsonSchema } from './JsonSchema'

// For more details about JSON schema, see: https://json-schema.org/draft/2020-12

/** Recursive type representing any valid JSON value. */
export type Json = null | string | number | boolean | readonly Json[] | { readonly [key: string]: Json | undefined }

export namespace Json {
  /** Parses a JSON5 string. Throws on invalid input. */
  export function parse<T = any>(value: string, reviver?: ((this: any, key: string, value: any) => any) | null): T {
    return json5.parse(value, reviver)
  }

  /** @deprecated Use `parse` along with `callSafe` utility function instead. */
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

  /** @deprecated Use `stringify` along with `callSafe` utility function instead. */
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

  export import normalizer = jsonNormalizer

  export import normalizerWithSchemaFactory = jsonNormalizerWithSchemaFactory

  export import Schema = JsonSchema
}
