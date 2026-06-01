export function getEnumKeys(enumObject: any): string[] {
  const allKeys = Object.keys(enumObject)

  // Since only keys with number values are stored reversed too:
  const straightKeys = allKeys.filter(key => !/^\d+$/.test(key))

  return straightKeys
}
