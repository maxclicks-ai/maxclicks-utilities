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

export type PrimitiveId =
  | typeof Address.id
  | typeof Color.id
  | typeof DateOnly.id
  | typeof DateTime.id
  | typeof Decimal.id
  | typeof Email.id
  | typeof Geolocation.id
  | typeof Phone.id
  | typeof Slug.id
  | typeof TimeOnly.id
  | typeof Url.id
  | typeof Uuid.id
