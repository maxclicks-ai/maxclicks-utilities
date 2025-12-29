/** Extracts `{ key, value }` pairs from a TypeScript enum. */
export function getEnumKeyValues<E>(enumObject: any): { key: string; value: E }[] {
  const allKeys = Object.keys(enumObject)

  // Since only keys with number values are stored reversed too:
  const straightKeys = allKeys.filter(key => !/^\d+$/.test(key))

  const keyValues = straightKeys.map(key => ({ key, value: enumObject[key] }))

  return keyValues as any
}
