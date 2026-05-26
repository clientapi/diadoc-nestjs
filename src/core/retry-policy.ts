export interface DiadocRetryOptions {
  retries?: number;
  retryDelayMs?: number;
  retryableStatuses?: readonly number[];
  retryableMethods?: readonly string[];
  retryOnNetworkError?: boolean;
  signal?: AbortSignal;
}

export const DEFAULT_RETRY_OPTIONS = {
  retries: 2,
  retryDelayMs: 250,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableMethods: ['GET', 'HEAD', 'OPTIONS'],
  retryOnNetworkError: true,
} as const satisfies Required<Omit<DiadocRetryOptions, 'signal'>>;

export async function runWithRetry<T>(
  operation: () => Promise<T>,
  options?: DiadocRetryOptions & {
    method?: string;
    sleep?: (ms: number) => Promise<void>;
    isRetryableError?: (error: unknown) => boolean;
  },
): Promise<T> {
  const retries = options?.retries ?? DEFAULT_RETRY_OPTIONS.retries;
  const retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_OPTIONS.retryDelayMs;
  const retryableStatuses = options?.retryableStatuses ?? DEFAULT_RETRY_OPTIONS.retryableStatuses;
  const retryableMethods = options?.retryableMethods ?? DEFAULT_RETRY_OPTIONS.retryableMethods;
  const retryOnNetworkError = options?.retryOnNetworkError ?? DEFAULT_RETRY_OPTIONS.retryOnNetworkError;
  const sleep = options?.sleep ?? defaultSleep;
  const method = options?.method?.toUpperCase();
  const signal = options?.signal;

  for (let attempt = 0; ; attempt += 1) {
    throwIfAborted(signal);

    try {
      return await operation();
    } catch (error) {
      throwIfAborted(signal);

      if (attempt >= retries || !shouldRetry(error, { method, retryableStatuses, retryableMethods, retryOnNetworkError, options })) {
        throw error;
      }

      await sleepWithAbort(retryDelayMs, sleep, signal);
    }
  }
}

function shouldRetry(
  error: unknown,
  context: {
    method?: string;
    retryableStatuses: readonly number[];
    retryableMethods: readonly string[];
    retryOnNetworkError: boolean;
    options?: { isRetryableError?: (error: unknown) => boolean };
  },
): boolean {
  if (context.options?.isRetryableError?.(error)) {
    return true;
  }

  if (isRetryableStatusError(error, context.retryableStatuses)) {
    return isRetryableMethod(context.method, context.retryableMethods);
  }

  return context.retryOnNetworkError && isNetworkError(error) && isRetryableMethod(context.method, context.retryableMethods);
}

function isRetryableMethod(method: string | undefined, retryableMethods: readonly string[]): boolean {
  return method !== undefined && retryableMethods.map((retryableMethod) => retryableMethod.toUpperCase()).includes(method);
}

function isRetryableStatusError(error: unknown, retryableStatuses: readonly number[]): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && retryableStatuses.includes(Number(error.status));
}

function isNetworkError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || 'status' in error) {
    return false;
  }

  if (error instanceof TypeError) {
    return true;
  }

  if (!('code' in error) || typeof error.code !== 'string') {
    return false;
  }

  return isNetworkErrorCode(error.code);
}

function isNetworkErrorCode(code: string): boolean {
  return code.startsWith('UND_ERR_') || NODE_NETWORK_ERROR_CODES.has(code);
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sleepWithAbort(ms: number, sleep: (ms: number) => Promise<void>, signal: AbortSignal | undefined): Promise<void> {
  if (!signal) {
    return sleep(ms);
  }

  throwIfAborted(signal);

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(getAbortReason(signal));
    };

    signal.addEventListener('abort', onAbort, { once: true });

    sleep(ms).then(
      () => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw getAbortReason(signal);
  }
}

function getAbortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
}

const NODE_NETWORK_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'ENETDOWN',
  'ENETRESET',
  'ENETUNREACH',
  'ETIMEDOUT',
]);
