import { Json } from '../../../types/Json'
import { Normalizer } from '../../../types/Normalizer'
import { PrimitiveId } from '../PrimitiveId'
import { DateTime } from './DateTime'

/** Geographic coordinates with optional accuracy and motion data. */
export interface Geolocation {
  readonly latitude: number
  readonly longitude: number
  readonly altitude?: number
  readonly horizontalAccuracy?: number
  readonly verticalAccuracy?: number
  readonly heading?: number
  readonly speed?: number
  readonly timestamp?: DateTime
}

export namespace Geolocation {
  export const id = 'geolocation'

  export const name = 'Geolocation'

  export const normalizer = Normalizer.object
    .chain(Normalizer.objectRequireKeys('latitude', 'longitude'))
    .chain((value, warn): Geolocation | null => {
      if (!value) return null
      return Normalizer.Normalized.combine({
        latitude: Normalizer.number.chain(Normalizer.numberLimitRange(-90, 90)).required.normalize(value.latitude),
        longitude: Normalizer.number.chain(Normalizer.numberLimitRange(-180, 180)).required.normalize(value.longitude),
        altitude: Normalizer.number.required.normalizeIfExists(value.altitude),
        horizontalAccuracy: Normalizer.number.required.normalizeIfExists(value.horizontalAccuracy),
        verticalAccuracy: Normalizer.number.required.normalizeIfExists(value.verticalAccuracy),
        heading: Normalizer.number.chain(Normalizer.numberLimitRange(0, 359)).required.normalizeIfExists(value.heading),
        speed: Normalizer.number.required.normalizeIfExists(value.speed),
        timestamp: DateTime.normalizer.required.normalizeIfExists(value.timestamp),
      }).getValue(warn)
    })

  export const jsonSchema: Json.Schema = {
    type: 'object',
    properties: {
      latitude: { type: 'number', minimum: -90, maximum: 90 },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
      altitude: { type: 'number' },
      horizontalAccuracy: { type: 'number' },
      verticalAccuracy: { type: 'number' },
      heading: { type: 'number', minimum: 0, maximum: 359 },
      speed: { type: 'number' },
      timestamp: DateTime.jsonSchema,
    },
    required: ['latitude', 'longitude'],
  }

  export const typeScript: string = `/** A geographical location specified by latitude and longitude, with optional additional details. */
interface Geolocation {
  /** Latitude in decimal degrees (-90 to 90). */
  latitude: number
  /** Longitude in decimal degrees (-180 to 180). */
  longitude: number
  /** Elevation in meters above sea level. */
  altitude?: number
  /** Horizontal accuracy in meters. */
  horizontalAccuracy?: number
  /** Vertical accuracy in meters. */
  verticalAccuracy?: number
  /** Direction of travel in degrees (0 to 359, 0=North). */
  heading?: number
  /** Speed in meters per second. */
  speed?: number
  /** Timestamp when coordinates were captured. */
  timestamp?: DateTime
}`

  export const dependencies: readonly PrimitiveId[] = ['date time']
}
