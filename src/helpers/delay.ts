const MAXIMUM_VALID_DELAY_MILLISECONDS = 2147483647 // = 2 ** 31 - 1 ≈ 24.86 days, larger delay values cause the timeout function to be executed immediately.

function getSafeDelayMilliseconds(milliseconds: number): number {
  return Math.max(Math.min(milliseconds, MAXIMUM_VALID_DELAY_MILLISECONDS), 0)
}

export { delay }

/**
 * Creates a promise that resolves after the specified delay.
 *
 * Handles large delays (>24.86 days) safely and supports abortion via `AbortSignal`.
 *
 * @param abortHandling - `'resolve'` returns `'aborted'`, `'reject'` throws an error.
 */
async function delay(milliseconds?: number): Promise<void>
async function delay(milliseconds: number, abortSignal: AbortSignal, abortHandling: 'reject'): Promise<void>
async function delay(
  milliseconds: number,
  abortSignal: AbortSignal,
  abortHandling?: 'resolve' | 'reject'
): Promise<void | 'aborted'>
async function delay(
  milliseconds = 0,
  abortSignal?: AbortSignal,
  abortHandling: 'resolve' | 'reject' = 'resolve'
): Promise<void | 'aborted'> {
  return new Promise((resolve, reject) => {
    if (abortSignal?.aborted) {
      queueMicrotask(() => (abortHandling === 'resolve' ? resolve('aborted') : reject(new Error('Aborted'))))
      return
    }

    let timeout: ReturnType<typeof setTimeout> | null = null

    const handleAbort = (event: Event): void => {
      if (timeout !== null) {
        clearTimeout(timeout)
        timeout = null
        abortSignal?.removeEventListener('abort', handleAbort)
        abortHandling === 'resolve' ? resolve('aborted') : reject(new Error('Aborted'))
      }
    }

    abortSignal?.addEventListener('abort', handleAbort)

    void (function delayNextChunk(): void {
      const safeDelayMilliseconds = getSafeDelayMilliseconds(milliseconds)
      milliseconds -= safeDelayMilliseconds
      timeout = setTimeout(() => {
        if (abortSignal?.aborted) return
        if (milliseconds > 0) {
          delayNextChunk()
        } else {
          timeout = null
          abortSignal?.removeEventListener('abort', handleAbort)
          resolve()
        }
      }, safeDelayMilliseconds)
    })()
  })
}
