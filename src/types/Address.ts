import { Normalizer } from './Normalizer'

/** Structured postal address with optional geolocation. */
export interface Address {
  readonly lines: readonly string[]
  readonly city: string
  readonly state?: string
  readonly postalCode?: string
  readonly country: string
  readonly formatted?: string
  readonly latitude?: number
  readonly longitude?: number
  readonly timezone?: string
}

export namespace Address {
  export const normalizer = Normalizer.object
    .chain(Normalizer.objectRequireKeys('lines', 'city', 'country'))
    .chain((value, warn): Address | null => {
      if (!value) return null
      return Normalizer.Normalized.combine({
        lines: Normalizer.array
          .chain((value, warn): string[] => {
            if (value.length === 0) throw new Error('At least one address line is required.')
            if (value.length > 3) throw new Error('At most three address lines are allowed.')
            return Normalizer.Normalized.combine(
              value.map(line => Normalizer.string.required.normalize(line)),
              value.map((line, lineIndex) => `line${lineIndex + 1}`)
            ).getValue(warn)
          })
          .normalize(value.lines),
        city: Normalizer.string.required.normalize(value.city),
        state: Normalizer.string.required.normalizeIfExists(value.state),
        postalCode: Normalizer.string.required.normalizeIfExists(value.postalCode),
        country: Normalizer.string.required.normalize(value.country),
        formatted: Normalizer.string.required.normalizeIfExists(value.formatted),
        latitude: Normalizer.number
          .chain(Normalizer.numberLimitRange(-90, 90))
          .required.normalizeIfExists(value.latitude),
        longitude: Normalizer.number
          .chain(Normalizer.numberLimitRange(-180, 180))
          .required.normalizeIfExists(value.longitude),
        timezone: Normalizer.string.required.normalizeIfExists(value.timezone),
      }).getValue(warn)
    })
}
