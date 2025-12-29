/** Extracts a message string from any error value. */
export function getErrorMessage(error: any, defaultMessage = 'Unknown error.'): string {
  return (
    (typeof error === 'string' ? error : String(error?.message || error?.toString?.() || defaultMessage)) ||
    defaultMessage
  )
}
