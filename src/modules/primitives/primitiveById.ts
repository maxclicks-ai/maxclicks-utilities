import { arrayHelpers } from '../../helpers/native/arrayHelpers'
import { primitives } from './primitives'

export const primitiveById = arrayHelpers.toDictionary(primitives, 'id')
