import { describe, expect, it } from 'vitest';
import { runWithRetry } from '../../src/core/retry-policy';

describe('retry policy', () => {
  it('retries retryable failure status and succeeds', async () => {
    let attempts = 0;
    const sleeps: number[] = [];

    const result = await runWithRetry(
      async () => {
        attempts += 1;
        if (attempts === 1) {
          throw { status: 503 };
        }
        return 'ok';
      },
      { method: 'GET', sleep: async (ms) => void sleeps.push(ms) },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(2);
    expect(sleeps).toEqual([250]);
  });

  it('stops after retries are exhausted and rethrows the last error', async () => {
    let attempts = 0;
    const lastError = { status: 503, message: 'still unavailable' };

    await expect(
      runWithRetry(
        async () => {
          attempts += 1;
          throw lastError;
        },
        { retries: 2, method: 'GET', sleep: async () => undefined },
      ),
    ).rejects.toBe(lastError);

    expect(attempts).toBe(3);
  });

  it('does not retry status failures for non-retryable methods', async () => {
    let attempts = 0;

    await expect(
      runWithRetry(
        async () => {
          attempts += 1;
          throw { status: 503 };
        },
        { method: 'POST', sleep: async () => undefined },
      ),
    ).rejects.toEqual({ status: 503 });

    expect(attempts).toBe(1);
  });

  it('retries network errors when enabled', async () => {
    let attempts = 0;

    const result = await runWithRetry(
      async () => {
        attempts += 1;
        if (attempts === 1) {
          throw new TypeError('fetch failed');
        }
        return 'ok';
      },
      { method: 'GET', sleep: async () => undefined },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });

  it('retries plain network errors with retryable codes for retryable methods', async () => {
    let attempts = 0;
    const error = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' });

    const result = await runWithRetry(
      async () => {
        attempts += 1;
        if (attempts === 1) {
          throw error;
        }
        return 'ok';
      },
      { method: 'GET', sleep: async () => undefined },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });

  it('retries plain ENOTFOUND network errors for retryable methods', async () => {
    let attempts = 0;
    const error = Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' });

    const result = await runWithRetry(
      async () => {
        attempts += 1;
        if (attempts === 1) {
          throw error;
        }
        return 'ok';
      },
      { method: 'GET', sleep: async () => undefined },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });

  it('does not retry network errors for non-retryable methods', async () => {
    let attempts = 0;
    const error = new TypeError('fetch failed');

    await expect(
      runWithRetry(
        async () => {
          attempts += 1;
          throw error;
        },
        { method: 'POST', sleep: async () => undefined },
      ),
    ).rejects.toBe(error);

    expect(attempts).toBe(1);
  });

  it('does not retry plain network errors with retryable codes for non-retryable methods', async () => {
    let attempts = 0;
    const error = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' });

    await expect(
      runWithRetry(
        async () => {
          attempts += 1;
          throw error;
        },
        { method: 'POST', sleep: async () => undefined },
      ),
    ).rejects.toBe(error);

    expect(attempts).toBe(1);
  });

  it('does not retry plain ENOTFOUND network errors for non-retryable methods', async () => {
    let attempts = 0;
    const error = Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' });

    await expect(
      runWithRetry(
        async () => {
          attempts += 1;
          throw error;
        },
        { method: 'POST', sleep: async () => undefined },
      ),
    ).rejects.toBe(error);

    expect(attempts).toBe(1);
  });

  it('does not retry status failures when method is omitted', async () => {
    let attempts = 0;
    const error = { status: 503 };

    await expect(
      runWithRetry(
        async () => {
          attempts += 1;
          throw error;
        },
        { sleep: async () => undefined },
      ),
    ).rejects.toBe(error);

    expect(attempts).toBe(1);
  });

  it('does not retry network errors when network retries are disabled', async () => {
    let attempts = 0;
    const error = new TypeError('fetch failed');

    await expect(
      runWithRetry(
        async () => {
          attempts += 1;
          throw error;
        },
        { method: 'GET', retryOnNetworkError: false, sleep: async () => undefined },
      ),
    ).rejects.toBe(error);

    expect(attempts).toBe(1);
  });

  it('retries when custom retry predicate opts in', async () => {
    let attempts = 0;
    const error = { status: 400 };

    const result = await runWithRetry(
      async () => {
        attempts += 1;
        if (attempts === 1) {
          throw error;
        }
        return 'ok';
      },
      {
        method: 'POST',
        sleep: async () => undefined,
        isRetryableError: (candidate) => candidate === error,
      },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });

  it('does not start another attempt when aborted while waiting to retry', async () => {
    let attempts = 0;
    const abortController = new AbortController();
    const abortReason = new Error('client timeout');

    setTimeout(() => abortController.abort(abortReason), 5);

    await expect(
      runWithRetry(
        async () => {
          attempts += 1;
          if (attempts === 1) {
            throw { status: 503 };
          }
          return 'ok';
        },
        { method: 'GET', retryDelayMs: 25, signal: abortController.signal },
      ),
    ).rejects.toBe(abortReason);

    expect(attempts).toBe(1);
  });
});
