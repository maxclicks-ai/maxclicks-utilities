import { objectHelpers } from '../helpers/native/objectHelpers'

/**
 * Extend to build lazy accessors to values that have to be evaluated but are rarely needed.
 *
 * @example
 * ```ts
 * const rawItems = [{ id: 'one', name: 'One', value: 1 }, ... ]
 *
 * // Use `createByInitialValues` to put direct values on the first level, or `create` to start by getters right away.
 * // You may extend the lazy properties by more getters as many levels as you need:
 * const items = Lazily.createByInitialValues({
 *   array: rawItems,
 * })({
 *   sum() {
 *     return rawItems.reduce((current, item) => current + item.value, 0)
 *   },
 * })({
 *   // Getters in each level have access to the previous properties via the `values` or `this` arguments:
 *   average(values) {
 *     return this.sum / values.array.length
 *   },
 *   extendedArray() {
 *     return this.array.map(item => ({ ...item, image: getImage(item.id), ... }))
 *   }
 * })({
 *   sortedExtendedArray(values) {
 *     return [...values.extendedArray].sort( ... )
 *   },
 * })({
 *   sortedExtendedById() {
 *     return this.sortedExtendedArray.reduce( ... )
 *   }
 * })() // An extra empty call at the end to finish extending your lazy accessors.
 *
 * // Later in the code:
 * console.log(items.sortedExtendedById) // Only when accessed (for the first time) the values are evaluated (in this case `extendedArray` and `sortedExtendedById`).
 * ```
 */
export interface Lazily<Values extends { readonly [key: string]: any }> {
  <
    NewGetters extends {
      readonly [key: string]: (
        this: { readonly [Key in keyof Values]: Values[Key] },
        values: { readonly [Key in keyof Values]: Values[Key] }
      ) => any
    },
  >(
    getters: NewGetters
  ): Lazily<Values & { readonly [Key in keyof NewGetters]: ReturnType<NewGetters[Key]> }>
  (): { readonly [Key in keyof Values]: Values[Key] }
}

export namespace Lazily {
  /** Creates a lazy object from getter functions. Getters starting with `$` are excluded. */
  export function create<Getters extends { readonly [key: string]: () => any }>(
    getters: Getters
  ): Lazily<{ readonly [Key in keyof Getters as Key extends `$${string}` ? never : Key]: ReturnType<Getters[Key]> }> {
    return createByGetters(getters)
  }

  /** Creates a lazy object from initial values, allowing extension with lazy getters. */
  export function createByInitialValues<InitialValues extends { readonly [key: string]: any }>(
    initialValues: InitialValues
  ): Lazily<InitialValues> {
    return createByGetters(
      objectHelpers.map(initialValues, (key, value) => (typeof value === 'function' ? () => value : value))
    )
  }
}

function createByGetters<Values extends { readonly [key: string]: any }>(getters: {
  readonly [key: string]: (this: Values, values: Values) => any
}): Lazily<any> {
  const values = new Proxy({} as any, {
    get(target, propertyKey, receiver) {
      if (typeof propertyKey !== 'string' || !(propertyKey in getters)) return undefined
      if (!(propertyKey in target)) {
        const getter = getters[propertyKey]
        target[propertyKey] = typeof getter === 'function' ? (getter as any).call(values, values) : getter
      }
      return Reflect.get(target, propertyKey, receiver)
    },
  })

  return function (newGetters?: any): Lazily<any> {
    if (!newGetters) return values
    return createByGetters({ ...getters, ...newGetters })
  }
}
