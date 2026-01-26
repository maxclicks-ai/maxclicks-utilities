import { Falsy, Trucy } from '../../types'

interface ArrayHelpers {
  /** Array.isArray only works correctly on writable arrays not readonly ones. */
  isArray(value: any): value is readonly any[]

  equals<T>(
    firstArray: readonly T[],
    secondArray: readonly T[],
    itemsEqual?: (firstItem: T, secondItem: T) => any
  ): boolean

  /** Since `Array.prototype.at(0)` is not widely supported yet, we use this helper method instead. */
  first<T>(array: readonly T[]): T | undefined
  /** Since `Array.prototype.at(-1)` is not widely supported yet, we use this helper method instead. */
  last<T>(array: readonly T[]): T | undefined

  sortBy<T>(array: T[], ...propertySelectors: (keyof T | ((item: T) => any))[]): T[]
  sortByDescending<T>(array: T[], ...propertySelectors: (keyof T | ((item: T) => any))[]): T[]

  orderBy<T>(array: readonly T[], ...propertySelectors: (keyof T | ((item: T) => any))[]): T[]
  orderByDescending<T>(array: readonly T[], ...propertySelectors: (keyof T | ((item: T) => any))[]): T[]

  distinct<T>(array: readonly T[], equalityFunction?: (a: T, b: T) => boolean): T[]
  distinctString<T extends string>(array: readonly T[]): T[]

  groupBy<T extends Record<any, any>, K extends keyof T>(array: readonly T[], key: K): Record<T[K], T[]>
  groupBy<T, K extends string | number | symbol>(
    array: readonly T[],
    key: (item: T, itemIndex: number, items: readonly T[]) => K
  ): Record<K, T[]>
  groupBy<T extends Record<any, any>, K extends keyof T, V>(
    array: readonly T[],
    key: K,
    mapper: (group: T[], groupKey: T[K]) => V
  ): Record<T[K], V>
  groupBy<T, K extends string | number | symbol, V>(
    array: readonly T[],
    key: (item: T, itemIndex: number, items: readonly T[]) => K,
    mapper: (group: T[], groupKey: K) => V
  ): Record<K, V>

  toDictionary<T extends Record<any, any>, K extends keyof T>(array: readonly T[], key: K): Record<T[K], T>
  toDictionary<T, K extends string | number | symbol>(
    array: readonly T[],
    key: (item: T, itemIndex: number, items: readonly T[]) => K
  ): Record<K, T>
  toDictionary<T extends Record<any, any>, K extends keyof T, V extends keyof T>(
    array: readonly T[],
    key: K,
    value: V
  ): Record<T[K], T[V]>
  toDictionary<T, U extends string | number | symbol, V extends keyof T>(
    array: readonly T[],
    key: (item: T, itemIndex: number, items: readonly T[]) => U,
    value: V
  ): Record<U, T[V]>
  toDictionary<T extends Record<any, any>, K extends keyof T, V>(
    array: readonly T[],
    key: K,
    value: (item: T, itemKey: T[K], itemIndex: number, items: readonly T[]) => V
  ): Record<T[K], V>
  toDictionary<T, K extends string | number | symbol, V>(
    array: readonly T[],
    key: (item: T, itemIndex: number, items: readonly T[]) => K,
    value: (item: T, itemKey: K, itemIndex: number, items: readonly T[]) => V
  ): Record<K, V>

  remove<T>(array: readonly T[], oldItem: T | ((item: T) => any), count?: number): T[]
  removeIndex<T>(array: readonly T[], index: number, count?: number): T[]

  replace<T>(array: readonly T[], oldItem: T | ((item: T) => any), ...newItems: readonly T[]): T[]
  replaceIndex<T>(array: readonly T[], index: number, ...newItems: readonly T[]): T[]

  mapFind<T, U>(
    array: readonly T[],
    mapper: (item: T, itemIndex: number, items: readonly T[]) => U
  ): Trucy<U> | undefined
  mapFind<T, U>(
    array: readonly T[],
    mapper: (item: T, itemIndex: number, items: readonly T[]) => U,
    predicate?: (mappedItem: U, item: T, itemIndex: number, items: readonly T[]) => any
  ): U | undefined
  mapFindLast<T, U>(
    array: readonly T[],
    mapper: (item: T, itemIndex: number, items: readonly T[]) => U
  ): Trucy<U> | undefined
  mapFindLast<T, U>(
    array: readonly T[],
    mapper: (item: T, itemIndex: number, items: readonly T[]) => U,
    predicate?: (mappedItem: U, item: T, itemIndex: number, items: readonly T[]) => any
  ): U | undefined
  mapFilter<T, U>(array: readonly T[], mapper: (item: T, itemIndex: number, items: readonly T[]) => U): Trucy<U>[]
  mapFilter<T, U>(
    array: readonly T[],
    mapper: (item: T, itemIndex: number, items: readonly T[]) => U,
    predicate?: (mappedItem: U, item: T, itemIndex: number, items: readonly T[]) => any
  ): U[]

  /** Almost the same as array.filter(Boolean) but with a better typing. */
  filterFalsy<T>(array: readonly (T | Falsy)[]): T[]
  buildTruthy<T>(...items: readonly (T | Falsy)[]): T[]
}

export const arrayHelpers: ArrayHelpers = {
  isArray: Array.isArray,

  equals(
    firstArray: readonly any[],
    secondArray: readonly any[],
    itemsEqual: (firstItem: any, secondItem: any) => any = (firstItem, secondItem) => firstItem === secondItem
  ): boolean {
    if (firstArray.length !== secondArray.length) return false
    return firstArray.every((firstItem, index) => itemsEqual(firstItem, secondArray[index]))
  },

  first(array: readonly any[]): any {
    return array[0]
  },
  last(array: readonly any[]): any {
    return array[array.length - 1]
  },

  sortBy(array: any[], ...propertySelectors: (any | ((item: any) => any))[]): any[] {
    return array.sort((a, b) => {
      for (let index = 0; index < propertySelectors.length; index += 1) {
        const propertySelector = propertySelectors[index]
        const generalPropertySelector =
          typeof propertySelector === 'function' ? propertySelector : (item: any) => item[propertySelector]
        const aValue = generalPropertySelector(a)
        const bValue = generalPropertySelector(b)
        if (aValue > bValue) return +1
        if (aValue < bValue) return -1
      }
      return 0
    })
  },
  sortByDescending(array: any[], ...propertySelectors: (any | ((item: any) => any))[]): any[] {
    return array.sort((a, b) => {
      for (let index = 0; index < propertySelectors.length; index += 1) {
        const propertySelector = propertySelectors[index]
        const generalPropertySelector =
          typeof propertySelector === 'function' ? propertySelector : (item: any) => item[propertySelector]
        const aValue = generalPropertySelector(a)
        const bValue = generalPropertySelector(b)
        if (aValue > bValue) return -1
        if (aValue < bValue) return +1
      }
      return 0
    })
  },

  orderBy(array: readonly any[], ...propertySelectors: (any | ((item: any) => any))[]): any[] {
    return arrayHelpers.sortBy([...array], ...propertySelectors)
  },
  orderByDescending(array: readonly any[], ...propertySelectors: (any | ((item: any) => any))[]): any[] {
    return arrayHelpers.sortByDescending([...array], ...propertySelectors)
  },

  distinct(array: readonly any[], equalityFunction?: (a: any, b: any) => boolean): any[] {
    if (!equalityFunction) return array.filter(isNotDuplicatedBefore)
    const result: any[] = []
    array.forEach(newItem => result.some(item => equalityFunction(item, newItem)) || result.push(newItem))
    return result

    function isNotDuplicatedBefore(item: any, index: number): boolean {
      return array.indexOf(item) === index
    }
  },

  distinctString(array: readonly string[]): any[] {
    const object: any = {}
    array.forEach(item => {
      object[item] = object
    })
    return Object.keys(object)
  },

  groupBy(
    array: readonly any[],
    key: keyof any | ((item: any, itemIndex: number, items: readonly any[]) => any),
    mapper?: (group: any[], groupKey: any) => any
  ): Record<any, any> {
    const result: Record<any, any> = {}
    array.forEach((item, itemIndex, items) => {
      const selector = (typeof key === 'function' ? key(item, itemIndex, items) : item[key]) ?? ''
      result[selector] = result[selector] || []
      result[selector].push(item)
    })
    if (mapper) {
      Object.keys(result).forEach(selector => {
        result[selector] = mapper(result[selector], selector)
      })
    }
    return result
  },

  toDictionary(
    array: readonly any[],
    key: keyof any | ((item: any, itemIndex: number, items: readonly any[]) => any),
    value?: keyof any | ((item: any, itemKey: any, itemIndex: number, items: readonly any[]) => any)
  ): Record<any, any> {
    const result: Record<any, any> = {}
    array.forEach((item, itemIndex, items) => {
      const selector = (typeof key === 'function' ? key(item, itemIndex, items) : item[key]) ?? ''
      result[selector] = !value
        ? item
        : typeof value === 'function'
          ? value(item, selector, itemIndex, items)
          : item[value]
    })
    return result
  },

  remove(array: readonly any[], oldItem: any, count = 1): any[] {
    const index = typeof oldItem === 'function' ? array.findIndex(oldItem) : array.indexOf(oldItem)
    return arrayHelpers.removeIndex(array, index, count)
  },
  removeIndex(array: readonly any[], index: number, count = 1): any[] {
    if (index === -1) return [...array]
    const result = [...array]
    result.splice(index, count)
    return result
  },

  replace(array: readonly any[], oldItem: any, ...newItems: readonly any[]): any[] {
    const index = typeof oldItem === 'function' ? array.findIndex(oldItem) : array.indexOf(oldItem)
    return arrayHelpers.replaceIndex(array, index, ...newItems)
  },
  replaceIndex(array: readonly any[], index: number, ...newItems: readonly any[]): any[] {
    if (index === -1) return [...array]
    const result = [...array]
    result.splice(index, 1, ...newItems) // TODO: This doesn't work for indexes out of bound. We may do it the old manual way!
    return result
  },

  mapFind(
    array: readonly any[],
    mapper: (item: any, itemIndex: number, items: readonly any[]) => any,
    predicate?: (mappedItem: any, item: any, itemIndex: number, items: readonly any[]) => any
  ): any | undefined {
    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      const mappedItem = mapper(item, i, array)
      if (predicate ? predicate(mappedItem, item, i, array) : mappedItem) return mappedItem
    }
    return undefined
  },
  mapFindLast(
    array: readonly any[],
    mapper: (item: any, itemIndex: number, items: readonly any[]) => any,
    predicate?: (mappedItem: any, item: any, itemIndex: number, items: readonly any[]) => any
  ): any | undefined {
    for (let i = array.length - 1; i >= 0; i--) {
      const item = array[i]
      const mappedItem = mapper(item, i, array)
      if (predicate ? predicate(mappedItem, item, i, array) : mappedItem) return mappedItem
    }
    return undefined
  },
  mapFilter(
    array: readonly any[],
    mapper: (item: any, itemIndex: number, items: readonly any[]) => any,
    predicate?: (mappedItem: any, item: any, itemIndex: number, items: readonly any[]) => any
  ): any[] {
    const results: any[] = []
    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      const mappedItem = mapper(item, i, array)
      if (predicate ? predicate(mappedItem, item, i, array) : mappedItem) {
        results.push(mappedItem)
      }
    }
    return results
  },

  filterFalsy(array: readonly any[]): any[] {
    return array.filter(Boolean)
  },
  buildTruthy(...items: readonly any[]): any[] {
    return items.filter(Boolean)
  },
}
