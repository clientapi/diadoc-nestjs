import { describe, expect, it } from 'vitest';
import { buildDiadocAuthHeader, resolveAuthToken } from '../../src/core/diadoc-auth';
import { DiadocAuthError } from '../../src/core/diadoc-error';

describe('diadoc-auth', () => {
  it('builds the official DiadocAuth header without an auth token', () => {
    expect(buildDiadocAuthHeader('client-1')).toBe('DiadocAuth ddauth_api_client_id=client-1');
  });

  it('builds the official DiadocAuth header', () => {
    expect(buildDiadocAuthHeader('client-1', 'token-1')).toBe(
      'DiadocAuth ddauth_api_client_id=client-1, ddauth_token=token-1',
    );
  });

  it('resolves a static token', async () => {
    await expect(resolveAuthToken('static-token')).resolves.toBe('static-token');
  });

  it('resolves an async token provider', async () => {
    await expect(resolveAuthToken(() => Promise.resolve('dynamic-token'))).resolves.toBe('dynamic-token');
  });

  it('resolves a null provider token as undefined when not required', async () => {
    await expect(resolveAuthToken(() => null)).resolves.toBeUndefined();
  });

  it('throws a clear auth error when a token is required but missing', async () => {
    await expect(resolveAuthToken(undefined, { required: true })).rejects.toBeInstanceOf(DiadocAuthError);
  });

  it('throws a clear auth error when a required provider token is undefined', async () => {
    await expect(resolveAuthToken(() => undefined, { required: true })).rejects.toBeInstanceOf(DiadocAuthError);
  });
});
