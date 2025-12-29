/**
 * Type guard that checks if `target` equals any of the provided items.
 *
 * Narrows the type to the union of matching items.
 */
export const isOneOf = ((target: any, ...items: any[]): boolean => items.includes(target)) as {
  <T, T1 extends T>(target: T, item1: T1): target is T1
  <T, T1 extends T, T2 extends Exclude<T, T1>>(target: T, item1: T1, item2: T2): target is T1 | T2
  <T, T1 extends T, T2 extends Exclude<T, T1>, T3 extends Exclude<T, T1 | T2>>(
    target: T,
    item1: T1,
    item2: T2,
    item3: T3
  ): target is T1 | T2 | T3
  <T, T1 extends T, T2 extends Exclude<T, T1>, T3 extends Exclude<T, T1 | T2>, T4 extends Exclude<T, T1 | T2 | T3>>(
    target: T,
    item1: T1,
    item2: T2,
    item3: T3,
    item4: T4
  ): target is T1 | T2 | T3 | T4
  <
    T,
    T1 extends T,
    T2 extends Exclude<T, T1>,
    T3 extends Exclude<T, T1 | T2>,
    T4 extends Exclude<T, T1 | T2 | T3>,
    T5 extends Exclude<T, T1 | T2 | T3 | T4>,
  >(
    target: T,
    item1: T1,
    item2: T2,
    item3: T3,
    item4: T4,
    item5: T5
  ): target is T1 | T2 | T3 | T4 | T5
  <
    T,
    T1 extends T,
    T2 extends Exclude<T, T1>,
    T3 extends Exclude<T, T1 | T2>,
    T4 extends Exclude<T, T1 | T2 | T3>,
    T5 extends Exclude<T, T1 | T2 | T3 | T4>,
    T6 extends Exclude<T, T1 | T2 | T3 | T4 | T5>,
  >(
    target: T,
    item1: T1,
    item2: T2,
    item3: T3,
    item4: T4,
    item5: T5,
    item6: T6
  ): target is T1 | T2 | T3 | T4 | T5 | T6
  <
    T,
    T1 extends T,
    T2 extends Exclude<T, T1>,
    T3 extends Exclude<T, T1 | T2>,
    T4 extends Exclude<T, T1 | T2 | T3>,
    T5 extends Exclude<T, T1 | T2 | T3 | T4>,
    T6 extends Exclude<T, T1 | T2 | T3 | T4 | T5>,
    T7 extends Exclude<T, T1 | T2 | T3 | T4 | T5 | T6>,
  >(
    target: T,
    item1: T1,
    item2: T2,
    item3: T3,
    item4: T4,
    item5: T5,
    item6: T6,
    item7: T7
  ): target is T1 | T2 | T3 | T4 | T5 | T6 | T7
  <
    T,
    T1 extends T,
    T2 extends Exclude<T, T1>,
    T3 extends Exclude<T, T1 | T2>,
    T4 extends Exclude<T, T1 | T2 | T3>,
    T5 extends Exclude<T, T1 | T2 | T3 | T4>,
    T6 extends Exclude<T, T1 | T2 | T3 | T4 | T5>,
    T7 extends Exclude<T, T1 | T2 | T3 | T4 | T5 | T6>,
    T8 extends Exclude<T, T1 | T2 | T3 | T4 | T5 | T6 | T7>,
  >(
    target: T,
    item1: T1,
    item2: T2,
    item3: T3,
    item4: T4,
    item5: T5,
    item6: T6,
    item7: T7,
    item8: T8
  ): target is T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8
  <
    T,
    T1 extends T,
    T2 extends Exclude<T, T1>,
    T3 extends Exclude<T, T1 | T2>,
    T4 extends Exclude<T, T1 | T2 | T3>,
    T5 extends Exclude<T, T1 | T2 | T3 | T4>,
    T6 extends Exclude<T, T1 | T2 | T3 | T4 | T5>,
    T7 extends Exclude<T, T1 | T2 | T3 | T4 | T5 | T6>,
    T8 extends Exclude<T, T1 | T2 | T3 | T4 | T5 | T6 | T7>,
    T9 extends Exclude<T, T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>,
  >(
    target: T,
    item1: T1,
    item2: T2,
    item3: T3,
    item4: T4,
    item5: T5,
    item6: T6,
    item7: T7,
    item8: T8,
    item9: T9
  ): target is T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9
  <T, TT extends T>(target: T, ...items: TT[]): boolean
}
