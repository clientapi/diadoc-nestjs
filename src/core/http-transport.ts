import { request as undiciRequest } from 'undici';
import type { Dispatcher } from 'undici';
import { DiadocHttpError } from './diadoc-error';

export interface DiadocHttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  responseType?: 'json' | 'text' | 'arrayBuffer';
  operationId?: string;
  signal?: AbortSignal;
}

export interface DiadocHttpResponse<T> {
  status: number;
  headers: Record<string, string>;
  body: T;
}

export interface DiadocHttpTransport {
  request<T>(request: DiadocHttpRequest): Promise<DiadocHttpResponse<T>>;
}

export class UndiciDiadocHttpTransport implements DiadocHttpTransport {
  async request<T>(request: DiadocHttpRequest): Promise<DiadocHttpResponse<T>> {
    const { body, headers } = prepareRequestBody(request.body, request.headers);
    const response = await undiciRequest(request.url, {
      method: request.method as Dispatcher.HttpMethod,
      headers,
      body,
      signal: request.signal,
    });
    const responseHeaders = normalizeHeaders(response.headers);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const responseBody = await parseErrorResponseBody(response.body, responseHeaders);

      throw new DiadocHttpError({
        message: `Diadoc operation ${request.operationId ?? request.method} failed with status ${response.statusCode}`,
        status: response.statusCode,
        url: request.url,
        operationId: request.operationId,
        headers: responseHeaders,
        body: responseBody,
      });
    }

    const responseBody = (await parseSuccessResponseBody(response.body, responseHeaders, request.responseType)) as T;

    return {
      status: response.statusCode,
      headers: responseHeaders,
      body: responseBody,
    };
  }
}

function prepareRequestBody(
  body: unknown,
  headers: Record<string, string>,
): { body: Dispatcher.RequestOptions['body']; headers: Record<string, string> } {
  if (!isPlainObject(body)) {
    return { body: body as Dispatcher.RequestOptions['body'], headers };
  }

  const nextHeaders = hasHeader(headers, 'content-type')
    ? headers
    : { ...headers, 'content-type': 'application/json' };

  return {
    body: JSON.stringify(body),
    headers: nextHeaders,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasHeader(headers: Record<string, string>, headerName: string): boolean {
  const normalizedHeaderName = headerName.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === normalizedHeaderName);
}

async function parseSuccessResponseBody(
  body: Awaited<ReturnType<typeof undiciRequest>>['body'],
  headers: Record<string, string>,
  responseType?: DiadocHttpRequest['responseType'],
): Promise<unknown> {
  const resolvedResponseType = responseType ?? inferSuccessResponseType(headers['content-type']);

  if (resolvedResponseType === 'text') {
    return decodeBodyText(body, headers);
  }

  if (resolvedResponseType === 'arrayBuffer') {
    return body.arrayBuffer();
  }

  const text = await decodeBodyText(body, headers);
  if (text.length === 0) {
    return null;
  }

  return JSON.parse(text);
}

async function parseErrorResponseBody(
  body: Awaited<ReturnType<typeof undiciRequest>>['body'],
  headers: Record<string, string>,
): Promise<unknown> {
  const text = await decodeBodyText(body, headers);
  if (text.length === 0) {
    return null;
  }

  if (isJsonContentType(headers['content-type'])) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

async function decodeBodyText(
  body: Awaited<ReturnType<typeof undiciRequest>>['body'],
  headers: Record<string, string>,
): Promise<string> {
  const buffer = await body.arrayBuffer();
  return createTextDecoder(headers['content-type']).decode(buffer);
}

function createTextDecoder(contentType: string | undefined): TextDecoder {
  try {
    return new TextDecoder(parseCharset(contentType) ?? 'utf-8');
  } catch {
    return new TextDecoder('utf-8');
  }
}

function parseCharset(contentType: string | undefined): string | undefined {
  if (contentType === undefined) {
    return undefined;
  }

  const match = /(?:^|;)\s*charset\s*=\s*("[^"]*"|[^;]*)/i.exec(contentType);
  return match?.[1]?.trim().replace(/^"|"$/g, '') || undefined;
}

function isJsonContentType(contentType: string | undefined): boolean {
  return contentType !== undefined && /(^|[/+])json($|[;\s])/i.test(contentType);
}

function inferSuccessResponseType(contentType: string | undefined): NonNullable<DiadocHttpRequest['responseType']> {
  if (contentType === undefined || isJsonContentType(contentType)) {
    return 'json';
  }

  if (isTextContentType(contentType) || isXmlContentType(contentType)) {
    return 'text';
  }

  return 'arrayBuffer';
}

function isTextContentType(contentType: string): boolean {
  return /^text\//i.test(contentType);
}

function isXmlContentType(contentType: string): boolean {
  return /(^|[/+])xml($|[;\s])/i.test(contentType);
}

function normalizeHeaders(headers: Record<string, string | string[] | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers)
      .filter((entry): entry is [string, string | string[]] => entry[1] !== undefined)
      .map(([key, value]) => [key.toLowerCase(), Array.isArray(value) ? value.join(', ') : value]),
  );
}
