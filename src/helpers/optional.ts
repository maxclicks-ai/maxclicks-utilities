/** Identity function that adds `| undefined` to the type. Useful for type inference. */
export function optional<T>(value: T): T | undefined {
  return value
}

export namespace optional {
  /** Makes array elements optionally undefined. */
  export function array<T extends readonly any[]>(value: T): readonly (T[number] | undefined)[] {
    return value
  }

  /** Makes all object properties optional. */
  export function object<T extends { readonly [key: string]: any }>(value: T): { readonly [K in keyof T]?: T[K] } {
    return value
  }
}
