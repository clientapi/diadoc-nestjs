import { describe, expect, it } from 'vitest';
import { DiadocApiClient } from '../../src/core/diadoc-api-client';
import { DiadocAuthError, DiadocTimeoutError, DiadocValidationError } from '../../src/core/diadoc-error';
import type { DiadocHttpRequest, DiadocHttpResponse, DiadocHttpTransport } from '../../src/core/http-transport';
import type { OperationMetadata } from '../../src/core/request-options';

describe('DiadocApiClient', () => {
  it('uses operation metadata to build an authorized request', async () => {
    const transport = new RecordingTransport({ body: { ok: true } });
    const client = createClient({ transport, authToken: 'token' });

    const result = await client.request('GetDocument', {
      query: { boxId: 'box 1', entityId: 'entity', include: ['a', 'b'] },
      body: { request: true },
      responseType: 'text',
    });

    expect(result).toEqual({ ok: true });
    expect(transport.requests).toHaveLength(1);
    expect(transport.requests[0]).toMatchObject({
      method: 'GET',
      url: 'https://diadoc-api.kontur.ru/V3/GetDocument?boxId=box+1&entityId=entity&include=a&include=b',
      headers: {
        Authorization: 'DiadocAuth ddauth_api_client_id=client-id, ddauth_token=token',
      },
      body: { request: true },
      responseType: 'text',
      operationId: 'GetDocument',
    });
    expect(transport.requests[0]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('allows auth operations without a token and returns transport body', async () => {
    const transport = new RecordingTransport({ body: { token: 'issued' } });
    const client = createClient({ transport });

    await expect(client.request('Authenticate', { body: { login: 'user' } })).resolves.toEqual({ token: 'issued' });

    expect(transport.requests[0]?.headers).toEqual({
      Authorization: 'DiadocAuth ddauth_api_client_id=client-id',
    });
  });

  it('throws DiadocAuthError when protected operation has no token', async () => {
    const transport = new RecordingTransport({ body: null });
    const client = createClient({ transport });

    await expect(client.request('GetDocument')).rejects.toBeInstanceOf(DiadocAuthError);
    expect(transport.requests).toHaveLength(0);
  });

  it('throws DiadocValidationError for an unknown operation', async () => {
    const transport = new RecordingTransport({ body: null });
    const client = createClient({ transport, authToken: 'token' });

    await expect(client.request('MissingOperation')).rejects.toBeInstanceOf(DiadocValidationError);
    expect(transport.requests).toHaveLength(0);
  });

  it('lets request headers override default and auth headers case-insensitively', async () => {
    const transport = new RecordingTransport({ body: null });
    const client = createClient({
      transport,
      authToken: 'token',
      defaultHeaders: {
        Accept: 'application/json',
        authorization: 'default-auth',
      },
    });

    await client.request('GetDocument', {
      headers: {
        accept: 'text/plain',
        AUTHORIZATION: 'request-auth',
      },
    });

    expect(transport.requests[0]?.headers).toEqual({
      accept: 'text/plain',
      AUTHORIZATION: 'request-auth',
    });
  });

  it('passes operation method into retry so retryable GET failures are retried', async () => {
    const transport = new SequenceTransport([
      { error: { status: 503 } },
      { response: { status: 200, headers: {}, body: { ok: true } } },
    ]);
    const client = createClient({
      transport,
      authToken: 'token',
      retry: { retries: 1, retryDelayMs: 0 },
    });

    await expect(client.request('GetDocument')).resolves.toEqual({ ok: true });
    expect(transport.requests).toHaveLength(2);
    expect(transport.requests.map((request) => request.method)).toEqual(['GET', 'GET']);
  });

  it('does not start another retry after the client timeout fires', async () => {
    const transport = new SequenceTransport([
      { error: { status: 503 } },
      { response: { status: 200, headers: {}, body: { ok: true } } },
    ]);
    const client = createClient({
      transport,
      authToken: 'token',
      timeoutMs: 5,
      retry: { retries: 1, retryDelayMs: 25 },
    });

    await expect(client.request('GetDocument')).rejects.toBeInstanceOf(DiadocTimeoutError);
    await new Promise((resolve) => setTimeout(resolve, 40));

    expect(transport.requests).toHaveLength(1);
  });
});

function createClient(
  options: Partial<ConstructorParameters<typeof DiadocApiClient>[0]> = {},
): DiadocApiClient {
  return new DiadocApiClient({
    apiClientId: 'client-id',
    operations,
    ...options,
  });
}

class RecordingTransport implements DiadocHttpTransport {
  readonly requests: DiadocHttpRequest[] = [];

  constructor(private readonly response: Pick<DiadocHttpResponse<unknown>, 'body'> & Partial<DiadocHttpResponse<unknown>>) {}

  async request<T>(request: DiadocHttpRequest): Promise<DiadocHttpResponse<T>> {
    this.requests.push(request);
    return {
      status: this.response.status ?? 200,
      headers: this.response.headers ?? {},
      body: this.response.body as T,
    };
  }
}

type SequenceStep =
  | { response: DiadocHttpResponse<unknown>; error?: never }
  | { error: unknown; response?: never };

class SequenceTransport implements DiadocHttpTransport {
  readonly requests: DiadocHttpRequest[] = [];
  private nextStep = 0;

  constructor(private readonly steps: readonly SequenceStep[]) {}

  async request<T>(request: DiadocHttpRequest): Promise<DiadocHttpResponse<T>> {
    this.requests.push(request);
    const step = this.steps[this.nextStep];
    this.nextStep += 1;

    if (!step) {
      throw new Error('Unexpected transport request');
    }

    if (step.error) {
      throw step.error;
    }

    return step.response as DiadocHttpResponse<T>;
  }
}

const operations = [
  operation({
    operationId: 'GetDocument',
    method: 'GET',
    path: '/V3/GetDocument',
    requiresAuth: true,
  }),
  operation({
    operationId: 'Authenticate',
    method: 'POST',
    path: '/V3/Authenticate',
    requiresAuth: false,
  }),
];

function operation(overrides: Pick<OperationMetadata, 'operationId' | 'method' | 'path' | 'requiresAuth'>): OperationMetadata {
  return {
    tag: 'Test',
    requestBodyContentTypes: [],
    responseContentTypes: [],
    ...overrides,
  };
}
