export function getEnumValues<E extends { readonly [key: string]: string | number }>(enumObject: E): E[keyof E][] {
  const allKeys = Object.keys(enumObject)

  // Since only keys with number values are stored reversed too:
  const straightKeys = allKeys.filter(key => !/^\d+$/.test(key))

  const values = straightKeys.map(key => enumObject[key])

  return values as any
}
