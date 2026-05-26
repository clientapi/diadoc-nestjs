export interface OperationMetadata {
  operationId: string;
  method: string;
  path: string;
  tag: string;
  requiresAuth: boolean;
  requestBodyContentTypes: readonly string[];
  responseContentTypes: readonly string[];
}

export interface DiadocRequestOptions {
  path?: Record<string, string | number | boolean>;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: unknown;
  responseType?: 'json' | 'text' | 'arrayBuffer';
  authToken?: string;
}

export function buildUrl(
  baseUrl: string,
  operationPath: string,
  options?: Pick<DiadocRequestOptions, 'path' | 'query'>,
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const normalizedPath = operationPath.replace(/^\/+/, '');
  const path = normalizedPath.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = options?.path?.[key];
    return value === undefined ? `{${key}}` : encodeURIComponent(String(value));
  });
  const url = `${normalizedBaseUrl}/${path}`;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(options?.query ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          query.append(key, String(item));
        }
      }
      continue;
    }

    query.append(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
}

export function mergeHeaders(
  ...headers: Array<Record<string, string | undefined> | undefined>
): Record<string, string> {
  const merged = new Map<string, { key: string; value: string }>();

  for (const headerSet of headers) {
    for (const [key, value] of Object.entries(headerSet ?? {})) {
      if (value === undefined) {
        continue;
      }

      merged.set(key.toLowerCase(), { key, value });
    }
  }

  return Object.fromEntries([...merged.values()].map(({ key, value }) => [key, value]));
}
