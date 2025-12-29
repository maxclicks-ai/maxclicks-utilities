import { Normalizer } from '../../types/Normalizer'

/** Normalizer for label fields. */
export const labelNormalizer = Normalizer.stringTrimmed.chain(Normalizer.stringLimitLength(1, 255))
