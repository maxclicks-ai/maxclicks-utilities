import { Json } from '../../types/Json'
import { Normalizer } from '../../types/Normalizer'
import { PrimitiveId } from './PrimitiveId'
import { Address } from './definitions/Address'
import { Color } from './definitions/Color'
import { DateOnly } from './definitions/DateOnly'
import { DateTime } from './definitions/DateTime'
import { Decimal } from './definitions/Decimal'
import { Email } from './definitions/Email'
import { Geolocation } from './definitions/Geolocation'
import { Phone } from './definitions/Phone'
import { Slug } from './definitions/Slug'
import { TimeOnly } from './definitions/TimeOnly'
import { Url } from './definitions/Url'
import { Uuid } from './definitions/Uuid'

export const primitives = [
  Address,
  Color,
  DateOnly,
  DateTime,
  Decimal,
  Email,
  Geolocation,
  Phone,
  Slug,
  TimeOnly,
  Url,
  Uuid,
] as const satisfies {
  id: PrimitiveId
  name: string
  normalizer: Normalizer<any>
  jsonSchema: Json.Schema
  typeScript: string
  dependencies: readonly PrimitiveId[]
}[]
