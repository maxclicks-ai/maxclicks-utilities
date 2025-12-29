/** Calculates percentage with optional rounding. Returns 0 for invalid inputs. */
export function percent(value: number, total = 1, fractionalDigits = 0): number {
  if (Number.isNaN(value) || Number.isNaN(total) || Number.isNaN(fractionalDigits)) return 0
  if (total <= 0) return 0

  const rawPercent = (100 * value) / total
  const roundingMultiplier = 10 ** fractionalDigits
  const roundedPercent = Math.round(rawPercent * roundingMultiplier) / roundingMultiplier
  return roundedPercent
}

export namespace percent {
  /** Returns percentage as a formatted string (e.g., `%50`). */
  export function formatted(...parameters: Parameters<typeof percent>): string {
    return `%${percent(...parameters)}`
  }
}
