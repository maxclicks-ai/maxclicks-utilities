import { AbortError } from '../types/AbortError'
import { Falsy } from '../types/base'

export function assertNotAbortedSignal(abortSignal: AbortSignal | Falsy): void {
  if (abortSignal && abortSignal.aborted) throw new AbortError()
}
