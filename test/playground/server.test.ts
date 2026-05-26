import { describe, expect, it } from 'vitest';
import { DiadocHttpError } from '../../src/core/diadoc-error';
import {
  buildPasswordAuthenticationRequest,
  buildPlaygroundRequestHeaders,
  createOidcAuthorizationUrl,
  formatPlaygroundError,
  formatPlaygroundResult,
  parseDotEnv,
  resolveCredentials,
} from '../../playground/server';

describe('playground server helpers', () => {
  it('parses simple dotenv content without exposing comments or quotes', () => {
    expect(
      parseDotEnv(`
DIADOC_API_CLIENT_ID=client-id
DIADOC_AUTH_TOKEN="token value"
# ignored
DIADOC_BASE_URL='https://diadoc-api.testkontur.ru'
`),
    ).toEqual({
      DIADOC_API_CLIENT_ID: 'client-id',
      DIADOC_AUTH_TOKEN: 'token value',
      DIADOC_BASE_URL: 'https://diadoc-api.testkontur.ru',
    });
  });

  it('prefers submitted credentials and falls back to dotenv values', () => {
    expect(
      resolveCredentials(
        {
          apiClientId: '',
          authToken: undefined,
          baseUrl: undefined,
        },
        {
          DIADOC_API_CLIENT_ID: 'env-client',
          DIADOC_AUTH_TOKEN: 'env-token',
          DIADOC_BASE_URL: 'https://env.test',
        },
      ),
    ).toEqual({
      apiClientId: 'env-client',
      authToken: 'env-token',
      authScheme: 'diadocAuth',
      baseUrl: 'https://env.test',
    });

    expect(
      resolveCredentials(
        {
          apiClientId: 'form-client',
          authToken: 'form-token',
          baseUrl: 'https://form.test',
        },
        {
          DIADOC_API_CLIENT_ID: 'env-client',
          DIADOC_AUTH_TOKEN: 'env-token',
          DIADOC_BASE_URL: 'https://env.test',
        },
      ),
    ).toEqual({
      apiClientId: 'form-client',
      authToken: 'form-token',
      authScheme: 'diadocAuth',
      baseUrl: 'https://form.test',
    });
  });

  it('formats ArrayBuffer results as base64 metadata for JSON transport', () => {
    expect(formatPlaygroundResult(Uint8Array.from([1, 2, 3]).buffer)).toEqual({
      kind: 'arrayBuffer',
      byteLength: 3,
      base64: 'AQID',
    });
  });

  it('formats Diadoc HTTP errors with response details', () => {
    const error = new DiadocHttpError({
      message: 'failed',
      status: 409,
      url: 'https://diadoc.test/V3/PostMessage',
      operationId: 'PostMessageV3',
      headers: { 'x-kontur-trace-id': 'trace-1' },
      body: { error: 'conflict' },
    });

    expect(formatPlaygroundError(error)).toEqual({
      name: 'DiadocHttpError',
      message: 'failed',
      status: 409,
      url: 'https://diadoc.test/V3/PostMessage',
      operationId: 'PostMessageV3',
      headers: { 'x-kontur-trace-id': 'trace-1' },
      body: { error: 'conflict' },
    });
  });

  it('builds password authentication request for AuthenticateV3', () => {
    expect(buildPasswordAuthenticationRequest('user@example.com', 'secret')).toEqual({
      operationId: 'AuthenticateV3',
      request: {
        query: { type: 'password' },
        headers: { 'content-type': 'application/json' },
        body: {
          login: 'user@example.com',
          password: 'secret',
        },
        responseType: 'text',
      },
    });
  });

  it('builds OpenID authorization URL for AuthorizationCode flow', () => {
    const url = createOidcAuthorizationUrl({
      clientId: 'ci_alpha-dev',
      redirectUri: 'http://localhost:4173/api/oidc/callback',
      scope: 'openid profile email offline_access Diadoc.PublicAPI',
      state: 'state-1',
      nonce: 'nonce-1',
    });

    expect(url).toBe(
      'https://identity.kontur.ru/connect/authorize?response_type=code&client_id=ci_alpha-dev&scope=openid+profile+email+offline_access+Diadoc.PublicAPI&redirect_uri=http%3A%2F%2Flocalhost%3A4173%2Fapi%2Foidc%2Fcallback&nonce=nonce-1&state=state-1',
    );
  });

  it('uses Bearer authorization header when requested by playground config', () => {
    expect(
      buildPlaygroundRequestHeaders(
        {
          authScheme: 'bearer',
          authToken: 'access-token',
        },
        { 'x-test': '1' },
      ),
    ).toEqual({
      accept: 'application/json',
      Authorization: 'Bearer access-token',
      'x-test': '1',
    });
  });

  it('requests JSON responses by default for playground calls', () => {
    expect(buildPlaygroundRequestHeaders({}, undefined)).toEqual({
      accept: 'application/json',
    });
  });
});
