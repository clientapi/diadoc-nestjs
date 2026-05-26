import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DiadocApiClient } from '../src/core/diadoc-api-client';
import { DiadocHttpError } from '../src/core/diadoc-error';
import type { DiadocRequestOptions } from '../src/core/request-options';
import { operations } from '../src/generated/operations';

const playgroundRoot = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(playgroundRoot, '..');

export interface PlaygroundConfigInput {
  apiClientId?: string;
  authToken?: string;
  authScheme?: 'diadocAuth' | 'bearer';
  baseUrl?: string;
  timeoutMs?: number;
}

export interface PlaygroundCredentials {
  apiClientId: string;
  authToken?: string;
  authScheme: 'diadocAuth' | 'bearer';
  baseUrl: string;
}

export interface PlaygroundCallInput {
  config?: PlaygroundConfigInput;
  operationId?: string;
  path?: Record<string, string | number | boolean>;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: unknown;
  responseType?: DiadocRequestOptions['responseType'];
}

export interface PlaygroundAuthenticateInput {
  config?: PlaygroundConfigInput;
  login?: string;
  password?: string;
}

export interface PlaygroundOidcStartInput {
  config?: PlaygroundConfigInput;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  redirectUri?: string;
}

export interface OidcAuthorizationUrlInput {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  nonce: string;
  identityBaseUrl?: string;
}

interface PendingOidcRequest {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  createdAt: number;
}

type PlaygroundEnv = Record<string, string | undefined>;

const pendingOidcRequests = new Map<string, PendingOidcRequest>();

export function parseDotEnv(content: string): Record<string, string> {
  const values: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (key.length === 0) {
      continue;
    }

    values[key] = stripEnvQuotes(rawValue);
  }

  return values;
}

export function resolveCredentials(
  config: PlaygroundConfigInput | undefined,
  env: PlaygroundEnv,
): PlaygroundCredentials {
  return {
    apiClientId: firstPresent(config?.apiClientId, env.DIADOC_API_CLIENT_ID),
    authToken: optionalPresent(config?.authToken, env.DIADOC_AUTH_TOKEN),
    authScheme: config?.authScheme === 'bearer' ? 'bearer' : 'diadocAuth',
    baseUrl: firstPresent(
      config?.baseUrl,
      env.DIADOC_BASE_URL,
      'https://diadoc-api.kontur.ru',
    ),
  };
}

export function formatPlaygroundResult(value: unknown): unknown {
  if (value instanceof ArrayBuffer) {
    return {
      kind: 'arrayBuffer',
      byteLength: value.byteLength,
      base64: Buffer.from(value).toString('base64'),
    };
  }

  return {
    kind: 'json',
    value,
  };
}

export function formatPlaygroundError(error: unknown): Record<string, unknown> {
  if (error instanceof DiadocHttpError) {
    return {
      name: error.name,
      message: error.message,
      status: error.status,
      url: error.url,
      operationId: error.operationId,
      headers: error.headers,
      body: error.body,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}

export function buildPasswordAuthenticationRequest(login: string, password: string) {
  return {
    operationId: 'AuthenticateV3',
    request: {
      query: { type: 'password' },
      headers: { 'content-type': 'application/json' },
      body: {
        login,
        password,
      },
      responseType: 'text' as const,
    },
  };
}

export function createOidcAuthorizationUrl(input: OidcAuthorizationUrlInput): string {
  const url = new URL('/connect/authorize', input.identityBaseUrl ?? 'https://identity.kontur.ru');
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: input.clientId,
    scope: input.scope,
    redirect_uri: input.redirectUri,
    nonce: input.nonce,
    state: input.state,
  }).toString();
  return url.toString();
}

export function buildPlaygroundRequestHeaders(
  config: Pick<PlaygroundConfigInput, 'authScheme' | 'authToken'>,
  headers: Record<string, string> | undefined,
): Record<string, string> | undefined {
  const defaultHeaders = {
    accept: 'application/json',
  };

  if (config.authScheme !== 'bearer' || !config.authToken?.trim()) {
    return {
      ...defaultHeaders,
      ...headers,
    };
  }

  return {
    ...defaultHeaders,
    Authorization: `Bearer ${config.authToken.trim()}`,
    ...headers,
  };
}

export function createPlaygroundServer(root = projectRoot) {
  return createServer(async (request, response) => {
    try {
      await routeRequest(request, response, root);
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: formatPlaygroundError(error),
      });
    }
  });
}

async function routeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  root: string,
): Promise<void> {
  const url = new URL(request.url ?? '/', 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/api/config') {
    const env = await loadPlaygroundEnv(root);
    sendJson(response, 200, {
      ok: true,
      config: {
        baseUrl: env.DIADOC_BASE_URL ?? 'https://diadoc-api.kontur.ru',
        hasApiClientId: Boolean(env.DIADOC_API_CLIENT_ID),
        hasAuthToken: Boolean(env.DIADOC_AUTH_TOKEN),
        oidcClientId: env.DIADOC_OIDC_CLIENT_ID ?? '',
        hasOidcClientSecret: Boolean(env.DIADOC_OIDC_CLIENT_SECRET),
      },
      operations,
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/authenticate') {
    const body = assertAuthenticateInput(await readJsonBody(request));
    const env = await loadPlaygroundEnv(root);
    const credentials = resolveCredentials(body.config, env);
    const login = body.login?.trim();
    const password = body.password?.trim();

    if (credentials.apiClientId.length === 0) {
      throw new Error('DIADOC_API_CLIENT_ID is required in the form or local .env');
    }

    if (!login) {
      throw new Error('Login is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    const client = new DiadocApiClient({
      apiClientId: credentials.apiClientId,
      baseUrl: credentials.baseUrl,
      timeoutMs: body.config?.timeoutMs ?? 30000,
      operations,
    });
    const auth = buildPasswordAuthenticationRequest(login, password);
    const startedAt = performance.now();
    const token = await client.request<string>(auth.operationId, auth.request);

    sendJson(response, 200, {
      ok: true,
      operationId: auth.operationId,
      elapsedMs: Math.round(performance.now() - startedAt),
      authToken: token,
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/oidc/start') {
    const body = assertOidcStartInput(await readJsonBody(request));
    const env = await loadPlaygroundEnv(root);
    const clientId = firstPresent(body.clientId, env.DIADOC_OIDC_CLIENT_ID);
    const clientSecret = firstPresent(body.clientSecret, env.DIADOC_OIDC_CLIENT_SECRET);
    const scope = firstPresent(
      body.scope,
      body.config?.baseUrl?.includes('testkontur')
        ? 'openid profile email offline_access Diadoc.PublicAPI.Staging'
        : 'openid profile email offline_access Diadoc.PublicAPI',
    );
    const redirectUri = firstPresent(
      body.redirectUri,
      `http://${request.headers.host ?? 'localhost:4173'}/api/oidc/callback`,
    );

    if (!clientId) {
      throw new Error('OpenID clientId is required');
    }

    if (!clientSecret) {
      throw new Error('OpenID clientSecret is required');
    }

    const state = randomUUID();
    const nonce = randomUUID();
    pendingOidcRequests.set(state, {
      clientId,
      clientSecret,
      redirectUri,
      createdAt: Date.now(),
    });

    sendJson(response, 200, {
      ok: true,
      authorizeUrl: createOidcAuthorizationUrl({
        clientId,
        redirectUri,
        scope,
        state,
        nonce,
      }),
      redirectUri,
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/oidc/callback') {
    await handleOidcCallback(url, response);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/call') {
    const body = assertCallInput(await readJsonBody(request));
    const env = await loadPlaygroundEnv(root);
    const credentials = resolveCredentials(body.config, env);

    if (credentials.authScheme !== 'bearer' && credentials.apiClientId.length === 0) {
      throw new Error('DIADOC_API_CLIENT_ID is required in the form or local .env');
    }

    if (credentials.authScheme === 'bearer' && !credentials.authToken) {
      throw new Error('Bearer access token is required');
    }

    if (!body.operationId) {
      throw new Error('operationId is required');
    }

    const client = new DiadocApiClient({
      apiClientId: credentials.apiClientId || 'oidc-playground',
      authToken: credentials.authToken,
      baseUrl: credentials.baseUrl,
      timeoutMs: body.config?.timeoutMs ?? 30000,
      operations,
    });
    const startedAt = performance.now();
    const result = await client.request(body.operationId, {
      path: body.path,
      query: body.query,
      headers: buildPlaygroundRequestHeaders(credentials, body.headers),
      body: body.body,
      responseType: body.responseType,
    });

    sendJson(response, 200, {
      ok: true,
      operationId: body.operationId,
      elapsedMs: Math.round(performance.now() - startedAt),
      result: formatPlaygroundResult(result),
    });
    return;
  }

  if (request.method === 'GET') {
    await serveStatic(url.pathname, response);
    return;
  }

  sendJson(response, 405, {
    ok: false,
    error: { message: 'Method not allowed' },
  });
}

async function serveStatic(pathname: string, response: ServerResponse): Promise<void> {
  const staticPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = resolve(playgroundRoot, `.${staticPath}`);

  if (!filePath.startsWith(playgroundRoot) || !existsSync(filePath)) {
    sendJson(response, 404, {
      ok: false,
      error: { message: 'Not found' },
    });
    return;
  }

  response.writeHead(200, {
    'content-type': contentTypeFor(filePath),
    'cache-control': 'no-store',
  });
  response.end(await readFile(filePath));
}

async function loadPlaygroundEnv(root: string): Promise<PlaygroundEnv> {
  const fileValues: Record<string, string> = {};

  for (const name of ['.env', '.env.playground']) {
    const filePath = join(root, name);
    if (existsSync(filePath)) {
      Object.assign(fileValues, parseDotEnv(await readFile(filePath, 'utf8')));
    }
  }

  return {
    ...fileValues,
    ...process.env,
  };
}

function stripEnvQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function firstPresent(...values: Array<string | undefined>): string {
  return optionalPresent(...values) ?? '';
}

function optionalPresent(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
}

function assertCallInput(value: unknown): PlaygroundCallInput {
  if (!isPlainObject(value)) {
    throw new Error('Request body must be a JSON object');
  }

  return value as PlaygroundCallInput;
}

function assertAuthenticateInput(value: unknown): PlaygroundAuthenticateInput {
  if (!isPlainObject(value)) {
    throw new Error('Request body must be a JSON object');
  }

  return value as PlaygroundAuthenticateInput;
}

function assertOidcStartInput(value: unknown): PlaygroundOidcStartInput {
  if (!isPlainObject(value)) {
    throw new Error('Request body must be a JSON object');
  }

  return value as PlaygroundOidcStartInput;
}

async function handleOidcCallback(url: URL, response: ServerResponse): Promise<void> {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error) {
    sendOidcCallbackPage(response, {
      ok: false,
      error: `${error}${errorDescription ? `: ${errorDescription}` : ''}`,
    });
    return;
  }

  if (!code || !state) {
    sendOidcCallbackPage(response, {
      ok: false,
      error: 'OpenID callback must include code and state',
    });
    return;
  }

  const pending = pendingOidcRequests.get(state);
  pendingOidcRequests.delete(state);

  if (!pending || Date.now() - pending.createdAt > 5 * 60 * 1000) {
    sendOidcCallbackPage(response, {
      ok: false,
      error: 'OpenID state is missing or expired. Start authorization again.',
    });
    return;
  }

  try {
    const token = await exchangeOidcCode({
      code,
      clientId: pending.clientId,
      clientSecret: pending.clientSecret,
      redirectUri: pending.redirectUri,
    });

    sendOidcCallbackPage(response, {
      ok: true,
      token,
    });
  } catch (caught) {
    sendOidcCallbackPage(response, {
      ok: false,
      error: caught instanceof Error ? caught.message : String(caught),
    });
  }
}

async function exchangeOidcCode(input: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<unknown> {
  const response = await fetch('https://identity.kontur.ru/connect/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: input.code,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      redirect_uri: input.redirectUri,
    }),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`OpenID token exchange failed with ${response.status}: ${text}`);
  }

  return text.length === 0 ? {} : JSON.parse(text);
}

function sendOidcCallbackPage(
  response: ServerResponse,
  payload: { ok: boolean; token?: unknown; error?: string },
): void {
  const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Diadoc Playground Auth</title>
</head>
<body>
  <script>
    localStorage.setItem('diadocPlaygroundOidcResult', ${JSON.stringify(JSON.stringify(payload))});
    window.location.href = '/?auth=openid';
  </script>
  Возвращаюсь в playground...
</body>
</html>`;

  response.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(html);
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const text = Buffer.concat(chunks).toString('utf8');
  return text.length === 0 ? {} : JSON.parse(text);
}

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(value, null, 2));
}

function contentTypeFor(filePath: string): string {
  switch (extname(filePath)) {
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.html':
      return 'text/html; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4173);
  const server = createPlaygroundServer();

  server.listen(port, () => {
    console.log(`Diadoc playground: http://localhost:${port}`);
  });
}
