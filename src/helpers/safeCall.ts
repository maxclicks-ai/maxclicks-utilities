import { getErrorMessage } from './error-warning/getErrorMessage'

export function safeCall<C extends () => any>(call: C): SafeCallResult<ReturnType<C>> {
  try {
    return new SafeCallResult({ result: call() })
  } catch (error) {
    return new SafeCallResult({ error })
  }
}

export namespace safeCall {
  export async function async<C extends () => any>(call: C): Promise<SafeCallResult<Awaited<ReturnType<C>>>> {
    try {
      return new SafeCallResult({ result: await call() })
    } catch (error) {
      return new SafeCallResult({ error })
    }
  }
}

export class SafeCallResult<R> {
  public readonly errorMessage: string | undefined

  constructor(private readonly state: { result: R; error?: undefined } | { result?: undefined; error: unknown }) {
    this.errorMessage = state.error ? getErrorMessage(state.error) : undefined
  }

  get error(): unknown | undefined {
    return this.state.error
  }

  get resultSafe(): R | undefined {
    return this.state.result
  }

  get result(): R {
    if (this.state.error) throw this.state.error
    return this.state.result!
  }

  valueOf(): R {
    return this.result!
  }
}
