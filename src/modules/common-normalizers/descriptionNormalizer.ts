import { Normalizer } from '../../types/Normalizer'

/** Normalizer for description fields. */
export const descriptionNormalizer = Normalizer.stringTrimmed.chain(Normalizer.stringLimitLength(0, 1000))
