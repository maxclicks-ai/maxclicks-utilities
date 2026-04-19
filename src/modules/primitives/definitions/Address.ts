import { Json } from '../../../types/Json'
import { Normalizer } from '../../../types/Normalizer'
import { PrimitiveId } from '../PrimitiveId'

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
  export const id = 'address'

  export const name = 'Address'

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

  export const jsonSchema: Json.Schema = {
    type: 'object',
    properties: {
      lines: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 3,
      },
      city: { type: 'string' },
      state: { type: 'string' },
      postalCode: { type: 'string' },
      country: { type: 'string' },
      formatted: { type: 'string' },
      latitude: { type: 'number', minimum: -90, maximum: 90 },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
      timezone: { type: 'string' },
    },
    required: ['lines', 'city', 'country'],
  }

  export const typeScript: string = `/** A physical mailing address. */
interface Address {
  /** Line one (required): Street address, P.O. box, company name, c/o. Line two: Apartment, suite, unit, building, floor, etc. Line three: Additional address information, if needed. */
  lines: string[]
  /** City, town, village, or locality. */
  city: string
  /** State, province, or region. */
  state?: string
  /** Postal or ZIP code. */
  postalCode?: string
  /** Country name or code. */
  country: string
  /** Full formatted address as a single string with line breaks. */
  formatted?: string
  /** Latitude in decimal degrees (-90 to 90). */
  latitude?: number
  /** Longitude in decimal degrees (-180 to 180). */
  longitude?: number
  /** IANA Time Zone Database name, e.g., "America/New_York". */
  timezone?: string
}`

  export const dependencies: readonly PrimitiveId[] = []
}
