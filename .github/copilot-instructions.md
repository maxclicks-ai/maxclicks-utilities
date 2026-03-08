# LLM/Copilot Guidelines

Coding conventions and guidelines for AI assistants on this project. Keep it simple, cut to the chase.

## Code Style

### No Braces for Single-Statement Control Flow

If `if`, `else`, `else if`, etc. is followed by a **single** `return`, `throw`, `yield`, `delete`, or tiny one-liner call like `warn(...)`, skip the braces:

```typescript
if (value === null) return null
if (!isValid) throw new Error('Invalid.')
if (condition) warn('Something happened.')
```

For long conditions/statements, put action on next line (still no braces):

```typescript
if (someVeryLongCondition && anotherCondition) throw new Error('Longer error message.')
```

Use braces when: multiple statements, complex nested logic, or readability benefits.

### Avoid `'key' in obj` for Type Checking

Don't use `'key' in obj` to detect properties — it bypasses TypeScript's type system and won't break if types change.

Instead:

- Use **type guard functions** to narrow discriminated unions (encapsulate the `in` check in one place).
- **Cast** to the expected type and check properties with `!== undefined`.

```typescript
// Bad — not type-safe:
if ('minLength' in schema) parts.push(`minLength=${schema.minLength}`)

// Good — cast and check:
const string = schema as StringValidation
if (string.minLength !== undefined) parts.push(`minLength=${string.minLength}`)

// Good — type guard for discriminated union members:
function isConstSchema(schema: Schema): schema is ConstValidation {
  return 'const' in schema
}
if (isConstSchema(schema)) return schema.const
```

### Naming: Fully Spelled Names

Use fully spelled names, not abbreviations:

- `property` not `prop`
- `index` not `i` (in most cases)
- `value` not `val`
- `number` not `num`

### Self-Documenting Code

Code should talk for itself. Don't comment every line. Use comments only for:

- JSDoc on public APIs
- Non-obvious business logic or edge cases
- TODOs or temporary workarounds

## Reuse Existing Utilities

### Error/Warning Helpers (`helpers/error-warning/`)

- `getErrorMessage(error)` — extract message from unknown error
- `prependMessage(prefix, message)` — prepend context to error/warning (handles multi-line)
- `combineMessages(messagesByKey)` — combine object/array of messages for detailed output
- `throwError(message)` — throw inline in expressions (use `throw new Error()` when possible)

### Primitive Type Normalizers (`types/`)

Reuse existing normalizers: `Email`, `Uuid`, `Url`, `DateTime`, `DateOnly`, `TimeOnly`, `Phone`, `Slug`, `Decimal`, `Color`, etc.

### Comparison

- `haveSameContents(a, b)` — deep equality for JSON-like values

## Meta

Keep this file updated with new conventions as they emerge.
