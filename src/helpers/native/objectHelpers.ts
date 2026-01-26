import type { DeepWritable } from '../../types'

interface ObjectHelpers {
  /** Object.keys reduces key type to string. */
  keys<T>(object: T): (keyof T)[]
  /** Object.values with respect to key type. */
  values<T>(object: T): T[keyof T][]
  /** Object.keys reduces key type to string. */
  entries<T>(object: T): { [Key in keyof T]: [key: Key, value: T[Key]] }[keyof T][]

  omit<T, K extends keyof T>(object: T, ...keys: readonly K[]): Omit<T, K>
  pick<T, K extends keyof T>(object: T, ...keys: readonly K[]): Pick<T, K>

  keyFor<T>(object: T, value: T[keyof T]): undefined | keyof T
  findKey<T>(object: T, predicate: (value: T[keyof T], key: keyof T) => any): undefined | keyof T

  onlyExisting<T>(object: T): { [P in keyof T]-?: Exclude<T[P], undefined> }
  diff<T>(object: T, reference: T): Partial<T>

  map<T, U>(opject: T, mapper: (key: keyof T, value: T[keyof T]) => U): Record<keyof T, U>

  mergeInto<E, T>(
    extension: E,
    objectFactory: (extension: E) => T
  ): Omit<T, keyof E> &
    (T extends (...args: infer Parameters) => infer Result ? (...args: Parameters) => Result : {}) &
    E
  extendBy<T, E>(
    object: T,
    extensionFactory: (object: T) => E
  ): Omit<T, keyof E> &
    (T extends (...args: infer Parameters) => infer Result ? (...args: Parameters) => Result : {}) &
    E
  modify<T>(object: T, modifier: (object: DeepWritable<T>) => void | T): T
}

const integerRegex = /^[0-9]+$/

export const objectHelpers: ObjectHelpers = {
  keys(object: any): any[] {
    return Object.keys(object)
  },
  values(object: any): any[] {
    return Object.values(object)
  },
  entries(object: any): any[] {
    return Object.entries(object)
  },

  omit(object: any, ...keys: readonly any[]): any {
    const result = { ...object }
    keys.forEach(key => delete result[key])
    return result
  },
  pick(object: any, ...keys: readonly any[]): any {
    const result: any = {}
    keys.forEach(key => key in object && (result[key] = object[key]))
    return result
  },

  keyFor(object: any, value: any): any {
    const result = Object.keys(object).find(key => object[key] === value)
    if (!result) return undefined
    const isNumericalKey = integerRegex.test(result)
    if (isNumericalKey) return Number(result)
    return result
  },
  findKey(object: any, predicate: (value: any, key: any) => any): any {
    const result = Object.keys(object).find(key => predicate(object[key], key))
    if (!result) return undefined
    const isNumericalKey = integerRegex.test(result)
    if (isNumericalKey) return Number(result)
    return result
  },

  onlyExisting(object: any): any {
    const result: any = {}
    Object.keys(object).forEach(key => {
      object[key] !== undefined && (result[key] = object[key])
    })
    return result
  },
  diff(object: any, reference: any): any {
    const result: any = {}
    Object.keys(object).forEach(objectKey => {
      if (object[objectKey] !== reference[objectKey]) {
        result[objectKey] = object[objectKey]
      }
    })
    Object.keys(reference).forEach(referenceKey => {
      if (!(referenceKey in object)) {
        result[referenceKey] = undefined
      }
    })
    return result
  },

  map(object: any, mapper: (key: any, value: any) => any): any {
    const result: any = {}
    const keys = Object.keys(object)
    keys.forEach(key => {
      result[key] = mapper(key, object[key])
    })
    return result
  },

  mergeInto(extension: any, objectFactory: (extension: any) => any): any {
    return Object.assign(objectFactory(extension), extension)
  },
  extendBy(object: any, extensionFactory: (object: any) => any): any {
    return Object.assign(object, extensionFactory(object))
  },
  modify(object: any, modifier: (object: any) => any): any {
    let modifiedObject = { ...object }
    modifiedObject = modifier(modifiedObject) ?? modifiedObject
    return modifiedObject
  },
}
