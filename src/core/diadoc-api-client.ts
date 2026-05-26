import {
  buildDiadocAuthHeader,
  resolveAuthToken,
  type DiadocAuthTokenProvider,
} from './diadoc-auth';
import { DiadocTimeoutError, DiadocValidationError } from './diadoc-error';
import {
  UndiciDiadocHttpTransport,
  type DiadocHttpTransport,
} from './http-transport';
import {
  buildUrl,
  mergeHeaders,
  type DiadocRequestOptions,
  type OperationMetadata,
} from './request-options';
import { runWithRetry, type DiadocRetryOptions } from './retry-policy';

export interface DiadocApiClientOptions {
  apiClientId: string;
  authToken?: DiadocAuthTokenProvider;
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  retry?: DiadocRetryOptions;
  transport?: DiadocHttpTransport;
  operations: readonly OperationMetadata[];
}

export class DiadocApiClient {
  private readonly operationMap: ReadonlyMap<string, OperationMetadata>;
  private readonly apiClientId: string;
  private readonly authToken?: DiadocAuthTokenProvider;
  private readonly baseUrl: string;
  private readonly defaultHeaders?: Record<string, string>;
  private readonly timeoutMs?: number;
  private readonly retry?: DiadocRetryOptions;
  private readonly transport: DiadocHttpTransport;

  constructor(options: DiadocApiClientOptions) {
    this.apiClientId = options.apiClientId;
    this.authToken = options.authToken;
    this.baseUrl = options.baseUrl ?? 'https://diadoc-api.kontur.ru';
    this.defaultHeaders = options.defaultHeaders;
    this.timeoutMs = options.timeoutMs;
    this.retry = options.retry;
    this.transport = options.transport ?? new UndiciDiadocHttpTransport();
    this.operationMap = new Map(options.operations.map((operation) => [operation.operationId, operation]));
  }

  async request<T = unknown>(operationId: string, request: DiadocRequestOptions = {}): Promise<T> {
    const operation = this.operationMap.get(operationId);

    if (!operation) {
      throw new DiadocValidationError(`Unknown Diadoc operation: ${operationId}`);
    }

    const abortController = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const authToken = await resolveAuthToken(
        request.authToken ?? this.authToken,
        { required: operation.requiresAuth },
      );
      const authHeader = {
        Authorization: buildDiadocAuthHeader(this.apiClientId, authToken),
      };
      const headers = mergeHeaders(this.defaultHeaders, authHeader, request.headers);
      const url = buildUrl(this.baseUrl, operation.path, request);
      const transportRequest = {
        method: operation.method,
        url,
        headers,
        body: request.body,
        responseType: request.responseType,
        operationId,
        signal: abortController.signal,
      };
      const response = runWithRetry(
        () => this.transport.request<T>(transportRequest),
        { ...this.retry, method: operation.method, signal: abortController.signal },
      );

      if (this.timeoutMs === undefined) {
        return (await response).body;
      }

      const timeoutError = new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          const error = new DiadocTimeoutError(operationId, this.timeoutMs as number);
          reject(error);
          abortController.abort(error);
        }, this.timeoutMs);
      });

      return (await Promise.race([response, timeoutError])).body;
    } finally {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    }
  }
}
