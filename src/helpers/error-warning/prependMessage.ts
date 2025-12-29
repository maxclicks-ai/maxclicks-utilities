import { stringHelpers } from '../native/stringHelpers'

/**
 * Prepends a prefix to a message, handling multi-line messages by indenting.
 *
 * - Single-line: `"prefix: message"`
 * - Multi-line: prefix on its own line, message indented below
 */
export function prependMessage<E extends string | undefined>(prefix: string | undefined, message: E): E {
  if (!message || !prefix) return message

  if (message.includes('\n')) return `${prefix}:\n${stringHelpers.indent(message, '  ')}` as E

  return `${prefix}: ${message}` as E
}
