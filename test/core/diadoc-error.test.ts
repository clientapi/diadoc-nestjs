import { describe, expect, it } from 'vitest';
import { DiadocHttpError, DiadocTimeoutError } from '../../src/core/diadoc-error';

describe('diadoc errors', () => {
  it('preserves http status, url, operation, headers, and body', () => {
    const error = new DiadocHttpError({
      message: 'Diadoc request failed',
      status: 409,
      url: 'https://diadoc-api.kontur.ru/GetDocument',
      operationId: 'GetDocumentV3',
      headers: { 'x-kontur-trace-id': 'trace-1' },
      body: 'conflict',
    });

    expect(error.status).toBe(409);
    expect(error.url).toBe('https://diadoc-api.kontur.ru/GetDocument');
    expect(error.operationId).toBe('GetDocumentV3');
    expect(error.body).toBe('conflict');
    expect(error.headers['x-kontur-trace-id']).toBe('trace-1');
  });

  it('marks timeout errors with timeoutMs', () => {
    const error = new DiadocTimeoutError('GetDocumentV3', 1000);
    expect(error.operationId).toBe('GetDocumentV3');
    expect(error.timeoutMs).toBe(1000);
  });
});
