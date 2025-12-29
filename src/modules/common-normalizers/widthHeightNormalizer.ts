import { Normalizer } from '../../types/Normalizer'

/** Normalizer for dimension values. */
export const widthHeightNormalizer = Normalizer.number.chain(Normalizer.numberLimitRange(0, Number.POSITIVE_INFINITY))
