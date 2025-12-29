const numberFormat = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/** Formats a number as US currency (e.g., `$1,234.56`). */
export function formatCurrencyUsd(value: number): string {
  return numberFormat.format(value)
}
