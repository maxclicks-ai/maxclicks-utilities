let count = BigInt(0)

/** Generates a unique sequential ID within the current runtime (not persistent). */
export function generateRuntimeId(): string {
  count += BigInt(1)
  return String(count)
}
