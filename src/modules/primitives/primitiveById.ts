import { Json } from '../../types/Json'
import { Normalizer } from '../../types/Normalizer'
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
import { PrimitiveId } from './PrimitiveId'

export const primitiveById = {
  [Address.id]: Address,
  [Color.id]: Color,
  [DateOnly.id]: DateOnly,
  [DateTime.id]: DateTime,
  [Decimal.id]: Decimal,
  [Email.id]: Email,
  [Geolocation.id]: Geolocation,
  [Phone.id]: Phone,
  [Slug.id]: Slug,
  [TimeOnly.id]: TimeOnly,
  [Url.id]: Url,
  [Uuid.id]: Uuid,
} as const satisfies Record<
  PrimitiveId,
  {
    id: PrimitiveId
    name: string
    normalizer: Normalizer<any>
    jsonSchema: Json.Schema
    typeScript: string
    dependencies: readonly PrimitiveId[]
  }
>
