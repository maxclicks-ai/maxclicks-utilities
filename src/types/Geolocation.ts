import { DateTime } from './DateTime'
import { Normalizer } from './Normalizer'

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
}
