export type AdvancedPromise<T> = Promise<T> & {
  readonly resolve: (value: T) => void;
  readonly reject: (error: Error) => void;
  readonly cancel: () => void;
  readonly resolved: boolean;
  readonly rejected: boolean;
  readonly cancelled: boolean;
  readonly timedOut: boolean;
  readonly timeout: number;
}

type InternalState<T> = {
  timeout: number,
  resolved: boolean,
  rejected: boolean,
  cancelled: boolean,
  timedOut: boolean,
  resolve: (value: T) => void,
  reject: (error: Error) => void,
}

const internalResolve = <T>(promiseState: InternalState<T>, value: T) => {
  if (!promiseState.resolved &&!promiseState.rejected) {
    promiseState.resolved = true;
    promiseState.resolve(value);
  }
}
const internalReject = <T>(promiseState: InternalState<T>, error: Error) => {
  if (!promiseState.resolved &&!promiseState.rejected) {
    promiseState.rejected = true;
    promiseState.reject(error);
  }
}
const internalCancel = <T>(promiseState: InternalState<T>, reason: string = "") => {
  if (!promiseState.resolved &&!promiseState.rejected) {
    const error = new Error(
      `Promise cancelled ${reason ? `due to  '${reason}'` : 'with no reason'}`
    );
    promiseState.cancelled = true;
    promiseState.rejected = true;
    promiseState.reject(error);
  }
}
const internalTimeout = <T>(promiseState: InternalState<T>) => {
  if (!promiseState.resolved &&!promiseState.rejected) {
    const error = new Error(
      `Promise timed out after ${promiseState.timeout}ms`
    );
    promiseState.timedOut = true;
    promiseState.rejected = true;
    promiseState.reject(error);
  }
}

export const createAdvancedPromise = <T>(_timeout: number = 0): AdvancedPromise<T> => {
  const state: Partial<InternalState<T>> & { timeout: number } = {
    timeout: ~~_timeout || 0,
    resolved: false,
    rejected: false,
    cancelled: false,
    timedOut: false,
  }
  const promise = new Promise<T>((resolve, reject) => {
    state.resolve = resolve;
    state.reject = reject;
    if (state.timeout > 0) {
      setTimeout(internalTimeout, state.timeout, state);
    }
  })
  Object.defineProperties(promise, {
    resolved: { get: () => state.resolved, enumerable: true },
    rejected: { get: () => state.rejected, enumerable: true },
    cancelled: { get: () => state.cancelled, enumerable: true },
    timedOut: { get: () => state.timedOut, enumerable: true },
    timeout: { get: () => state.timeout, enumerable: true },
    
    resolve: { value: (value: T) => internalResolve(state as InternalState<T>, value), enumerable: true },
    reject: { value: (error: Error) => internalReject(state as InternalState<T>, error), enumerable: true },
    cancel: { value: (reason?: string) => internalCancel(state as InternalState<T>, reason), enumerable: true },
  });
  return promise as AdvancedPromise<T>;
}
// IT WOULDN'T WORK OK IF YOU EXTEND PROMISE, PROMISE IS SPECIAL.
// We create a normal promise and define properties on it, instead.