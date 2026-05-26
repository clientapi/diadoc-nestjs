import { afterEach, describe, expect, it } from 'vitest';
import { MockAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici';
import { DiadocHttpError } from '../../src/core/diadoc-error';
import { UndiciDiadocHttpTransport } from '../../src/core/http-transport';

describe('UndiciDiadocHttpTransport', () => {
  const previousDispatcher = getGlobalDispatcher();

  afterEach(() => {
    setGlobalDispatcher(previousDispatcher);
  });

  it('sends JSON requests and parses JSON responses', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    const client = mockAgent.get('https://diadoc.test');
    client
      .intercept({
        method: 'POST',
        path: '/documents',
        headers: {
          authorization: 'DiadocAuth token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ documentId: 'doc-1' }),
      })
      .reply(201, { ok: true }, { headers: { 'X-Kontur-Trace-Id': 'trace-1' } });

    const transport = new UndiciDiadocHttpTransport();

    const response = await transport.request<{ ok: boolean }>({
      method: 'POST',
      url: 'https://diadoc.test/documents',
      headers: { authorization: 'DiadocAuth token' },
      body: { documentId: 'doc-1' },
    });

    expect(response.status).toBe(201);
    expect(response.headers['x-kontur-trace-id']).toBe('trace-1');
    expect(response.body).toEqual({ ok: true });
    await mockAgent.close();
  });

  it('returns binary responses as ArrayBuffer', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/print-form' })
      .reply(200, new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'application/octet-stream' } });

    const transport = new UndiciDiadocHttpTransport();

    const response = await transport.request<ArrayBuffer>({
      method: 'GET',
      url: 'https://diadoc.test/print-form',
      headers: {},
      responseType: 'arrayBuffer',
    });

    expect(response.body).toBeInstanceOf(ArrayBuffer);
    expect(Array.from(new Uint8Array(response.body))).toEqual([1, 2, 3]);
    await mockAgent.close();
  });

  it('infers text responses from content type when response type is omitted', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/ping' })
      .reply(200, 'pong', { headers: { 'content-type': 'text/plain' } });

    const transport = new UndiciDiadocHttpTransport();

    await expect(
      transport.request<string>({
        method: 'GET',
        url: 'https://diadoc.test/ping',
        headers: {},
      }),
    ).resolves.toMatchObject({ status: 200, body: 'pong' });

    await mockAgent.close();
  });

  it('infers XML responses from content type when response type is omitted', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/metadata' })
      .reply(200, '<root>ok</root>', { headers: { 'content-type': 'application/xml; charset=windows-1251' } });

    const transport = new UndiciDiadocHttpTransport();

    await expect(
      transport.request<string>({
        method: 'GET',
        url: 'https://diadoc.test/metadata',
        headers: {},
      }),
    ).resolves.toMatchObject({ status: 200, body: '<root>ok</root>' });

    await mockAgent.close();
  });

  it('decodes inferred XML responses using charset from content type', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/metadata-cp1251' })
      .reply(
        200,
        new Uint8Array([
          60, 114, 111, 111, 116, 62, 207, 240, 232, 226, 229, 242, 60, 47, 114, 111, 111, 116, 62,
        ]),
        { headers: { 'content-type': 'application/xml; charset=windows-1251' } },
      );

    const transport = new UndiciDiadocHttpTransport();

    await expect(
      transport.request<string>({
        method: 'GET',
        url: 'https://diadoc.test/metadata-cp1251',
        headers: {},
      }),
    ).resolves.toMatchObject({ status: 200, body: '<root>Привет</root>' });

    await mockAgent.close();
  });

  it('infers binary responses from content type when response type is omitted', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/print-form.pdf' })
      .reply(200, new Uint8Array([37, 80, 68, 70]), { headers: { 'content-type': 'application/pdf' } });

    const transport = new UndiciDiadocHttpTransport();

    const response = await transport.request<ArrayBuffer>({
      method: 'GET',
      url: 'https://diadoc.test/print-form.pdf',
      headers: {},
    });

    expect(response.body).toBeInstanceOf(ArrayBuffer);
    expect(Array.from(new Uint8Array(response.body))).toEqual([37, 80, 68, 70]);
    await mockAgent.close();
  });

  it('returns null for empty successful responses when JSON is the default response type', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'DELETE', path: '/documents/doc-1' })
      .reply(204, '');

    const transport = new UndiciDiadocHttpTransport();

    await expect(
      transport.request<null>({
        method: 'DELETE',
        url: 'https://diadoc.test/documents/doc-1',
        headers: {},
      }),
    ).resolves.toMatchObject({ status: 204, body: null });

    await mockAgent.close();
  });

  it('throws DiadocHttpError for non-2xx responses with parsed response details', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/documents/doc-1' })
      .reply(
        409,
        { error: 'conflict' },
        { headers: { 'content-type': 'application/json', 'X-Kontur-Trace-Id': 'trace-conflict' } },
      );

    const transport = new UndiciDiadocHttpTransport();

    const error = await transport
      .request({
        method: 'GET',
        url: 'https://diadoc.test/documents/doc-1',
        headers: {},
        operationId: 'GetDocumentV3',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DiadocHttpError);
    expect(error).toMatchObject({
      status: 409,
      operationId: 'GetDocumentV3',
      body: { error: 'conflict' },
      headers: { 'x-kontur-trace-id': 'trace-conflict' },
    });
    expect(error).toHaveProperty('url', 'https://diadoc.test/documents/doc-1');
    expect(error).toHaveProperty('message', 'Diadoc operation GetDocumentV3 failed with status 409');

    await mockAgent.close();
  });

  it('decodes explicit text responses using charset from content type', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/ping-cp1251' })
      .reply(200, new Uint8Array([207, 240, 232, 226, 229, 242]), {
        headers: { 'content-type': 'text/plain; charset=windows-1251' },
      });

    const transport = new UndiciDiadocHttpTransport();

    await expect(
      transport.request<string>({
        method: 'GET',
        url: 'https://diadoc.test/ping-cp1251',
        headers: {},
        responseType: 'text',
      }),
    ).resolves.toMatchObject({ status: 200, body: 'Привет' });

    await mockAgent.close();
  });

  it('throws DiadocHttpError for text non-2xx responses without JSON parser errors', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/documents/doc-1' })
      .reply(503, 'service unavailable', { headers: { 'content-type': 'text/plain' } });

    const transport = new UndiciDiadocHttpTransport();

    const error = await transport
      .request({
        method: 'GET',
        url: 'https://diadoc.test/documents/doc-1',
        headers: {},
        operationId: 'GetDocumentV3',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DiadocHttpError);
    expect(error).toMatchObject({
      status: 503,
      operationId: 'GetDocumentV3',
      body: 'service unavailable',
    });
    expect(error).toHaveProperty('url', 'https://diadoc.test/documents/doc-1');

    await mockAgent.close();
  });

  it('throws DiadocHttpError with text body decoded using charset from content type', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/documents/doc-1-cp1251' })
      .reply(503, new Uint8Array([207, 240, 232, 226, 229, 242]), {
        headers: { 'content-type': 'text/plain; charset=windows-1251' },
      });

    const transport = new UndiciDiadocHttpTransport();

    const error = await transport
      .request({
        method: 'GET',
        url: 'https://diadoc.test/documents/doc-1-cp1251',
        headers: {},
        operationId: 'GetDocumentV3',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DiadocHttpError);
    expect(error).toMatchObject({
      status: 503,
      operationId: 'GetDocumentV3',
      body: 'Привет',
    });

    await mockAgent.close();
  });

  it('parses JSON error bodies by content type when success response type is arrayBuffer', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/print-form/missing' })
      .reply(404, { error: 'not found' }, { headers: { 'content-type': 'application/json' } });

    const transport = new UndiciDiadocHttpTransport();

    const error = await transport
      .request({
        method: 'GET',
        url: 'https://diadoc.test/print-form/missing',
        headers: {},
        responseType: 'arrayBuffer',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DiadocHttpError);
    expect(error).toMatchObject({
      status: 404,
      body: { error: 'not found' },
    });

    await mockAgent.close();
  });

  it('parses text error bodies by content type when success response type is arrayBuffer', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/print-form' })
      .reply(503, 'service unavailable', { headers: { 'content-type': 'text/plain' } });

    const transport = new UndiciDiadocHttpTransport();

    const error = await transport
      .request({
        method: 'GET',
        url: 'https://diadoc.test/print-form',
        headers: {},
        responseType: 'arrayBuffer',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DiadocHttpError);
    expect(error).toMatchObject({
      status: 503,
      body: 'service unavailable',
    });

    await mockAgent.close();
  });

  it('throws DiadocHttpError with null body for empty non-2xx responses', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/documents/doc-1' })
      .reply(503, '');

    const transport = new UndiciDiadocHttpTransport();

    const error = await transport
      .request({
        method: 'GET',
        url: 'https://diadoc.test/documents/doc-1',
        headers: {},
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(DiadocHttpError);
    expect(error).toMatchObject({
      status: 503,
      body: null,
    });

    await mockAgent.close();
  });

  it('parses text responses without JSON decoding', async () => {
    const mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    setGlobalDispatcher(mockAgent);

    mockAgent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/ping' })
      .reply(200, 'pong', { headers: { 'content-type': 'text/plain' } });

    const transport = new UndiciDiadocHttpTransport();

    await expect(
      transport.request<string>({
        method: 'GET',
        url: 'https://diadoc.test/ping',
        headers: {},
        responseType: 'text',
      }),
    ).resolves.toMatchObject({ status: 200, body: 'pong' });

    await mockAgent.close();
  });
});
