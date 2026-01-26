import { Normalizer } from '../types/Normalizer'

export function normalizeArrayInline<T extends readonly any[] | null | undefined>(
  value: T,
  normalizeItem: (
    item: Exclude<T, null | undefined>[number],
    index: number,
    array: Exclude<T, null | undefined>
  ) => Exclude<T, null | undefined>[number] | Normalizer.Normalized<Exclude<T, null | undefined>[number]>
): Normalizer.Normalized<T> {
  if (value === null || value === undefined) return new Normalizer.Normalized({ value })
  return Normalizer.array
    .chain((value, warn) =>
      Normalizer.Normalized.combine(
        (value as any[]).map(
          normalizeItem as any as (item: any, index: number, array: any[]) => Normalizer.Normalized<any>
        )
      ).getValue(warn)
    )
    .normalize(value) as Normalizer.Normalized<any>
}

export namespace normalizeArrayInline {
  export async function async<T extends readonly any[] | null | undefined>(
    value: T,
    normalizeItem: (
      item: Exclude<T, null | undefined>[number],
      index: number,
      array: Exclude<T, null | undefined>
    ) =>
      | Exclude<T, null | undefined>[number]
      | Normalizer.Normalized<Exclude<T, null | undefined>[number]>
      | Promise<Exclude<T, null | undefined>[number] | Normalizer.Normalized<Exclude<T, null | undefined>[number]>>
  ): Promise<Normalizer.Normalized<T>> {
    if (value === null || value === undefined) return new Normalizer.Normalized({ value })
    return (await Normalizer.array
      .chainAsync(async (value, warn) =>
        Normalizer.Normalized.combine(
          await Promise.all(
            (value as any[]).map(
              normalizeItem as any as (
                item: any,
                index: number,
                array: any[]
              ) => Normalizer.Normalized<any> | Promise<Normalizer.Normalized<any>>
            )
          )
        ).getValue(warn)
      )
      .normalize(value)) as Normalizer.Normalized<any>
  }
}
