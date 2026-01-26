import { Normalizer } from '../types/Normalizer'

export function normalizeObjectInline<T extends {} | null | undefined>(
  value: T,
  normalizeProperties: (
    value: Exclude<T, null | undefined>
  ) => Normalizer.Normalized.Items<Exclude<T, null | undefined>>
): Normalizer.Normalized<T> {
  if (value === null || value === undefined) return new Normalizer.Normalized({ value })
  return Normalizer.object.required
    .chain((value, warn) =>
      Normalizer.Normalized.combine(normalizeProperties(value as Exclude<T, null | undefined>)).getValue(warn)
    )
    .normalize(value) as Normalizer.Normalized<T>
}

export namespace normalizeObjectInline {
  export async function async<T extends {} | null | undefined>(
    value: T,
    normalizeProperties: (
      value: Exclude<T, null | undefined>
    ) =>
      | Normalizer.Normalized.Items<Exclude<T, null | undefined>>
      | Promise<Normalizer.Normalized.Items<Exclude<T, null | undefined>>>
  ): Promise<Normalizer.Normalized<T>> {
    if (value === null || value === undefined) return new Normalizer.Normalized({ value })
    return (await Normalizer.object.required
      .chainAsync(async (value, warn) =>
        Normalizer.Normalized.combine(await normalizeProperties(value as Exclude<T, null | undefined>)).getValue(warn)
      )
      .normalize(value)) as Normalizer.Normalized<T>
  }
}
