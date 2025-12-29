/**
 * Generates a random alphanumeric string.
 *
 * @param length - Key length (default: 16)
 * @param accept - Optional predicate to regenerate until accepted
 */
export const generateRandomKey: {
  (): string
  (length: number): string
  (accept: (key: string) => boolean): string
  (options: { length?: number; accept: (key: string) => boolean }): string
} = (arg?: number | ((key: string) => boolean) | { length?: number; accept: (key: string) => boolean }): string => {
  let length = 16
  let accept = (key: string) => true
  if (typeof arg === 'number') {
    length = arg
  } else if (typeof arg === 'function') {
    accept = arg
  } else if (typeof arg === 'object') {
    length = arg.length ?? length
    accept = arg.accept ?? accept
  }
  let key: string
  do {
    key = ''
    for (let i = 0; i < length; i++) {
      key += characters.charAt(Math.floor(Math.random() * characters.length))
    }
  } while (!accept(key))
  return key
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
