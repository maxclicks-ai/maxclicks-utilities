interface StringHelpers {
  /** Inserts content at a specific index. */
  insert(value: string, index: number, content: string): string
  /** Removes characters between two indices, optionally replacing with content. */
  remove(value: string, fromIndex: number, toIndex: number, replacement?: string): string
  /** Prepends indentation to each line. */
  indent(value: string, indentation: string): string
}

export const stringHelpers: StringHelpers = {
  insert(value, index, content) {
    return `${value.slice(0, index)}${content}${value.slice(index)}`
  },
  remove(value, fromIndex, toIndex, replacement) {
    return `${value.slice(0, fromIndex)}${replacement ?? ''}${value.slice(toIndex)}`
  },

  indent(value, indentation) {
    return `${indentation}${value.replace(/\n/g, `\n${indentation}`)}`
  },
}
