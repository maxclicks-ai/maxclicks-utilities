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
        altitude: Normalizer.number.required.normalize(value.altitude ?? null),
        horizontalAccuracy: Normalizer.number.required.normalize(value.horizontalAccuracy ?? null),
        verticalAccuracy: Normalizer.number.required.normalize(value.verticalAccuracy ?? null),
        heading: Normalizer.number.chain(Normalizer.numberLimitRange(0, 359)).required.normalize(value.heading ?? null),
        speed: Normalizer.number.required.normalize(value.speed ?? null),
        timestamp: DateTime.normalizer.required.normalize(value.timestamp ?? null),
      }).getValue(warn)
    })
}
