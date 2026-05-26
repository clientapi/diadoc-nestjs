import { describe, expect, it } from 'vitest';
import { buildUrl, mergeHeaders } from '../../src/core/request-options';

describe('request options helpers', () => {
  it('replaces path params and appends query params', () => {
    const url = buildUrl('https://example.test', '/boxes/{boxId}/documents', {
      path: { boxId: 'box-1' },
      query: { limit: 10, includeDrafts: false, empty: undefined },
    });

    expect(url).toBe('https://example.test/boxes/box-1/documents?limit=10&includeDrafts=false');
  });

  it('encodes path params, repeats array query params, and skips nullish query values', () => {
    const url = buildUrl('https://example.test/', 'boxes/{boxId}/documents/{documentId}', {
      path: { boxId: 'box 1', documentId: 'doc/1' },
      query: { status: ['draft', 'sent'], missing: null, enabled: true },
    });

    expect(url).toBe(
      'https://example.test/boxes/box%201/documents/doc%2F1?status=draft&status=sent&enabled=true',
    );
  });

  it('merges headers case-insensitively with later values winning', () => {
    expect(
      mergeHeaders(
        { Accept: 'application/json', Authorization: 'token-1' },
        { accept: 'text/plain', 'X-Trace-Id': undefined },
        { AUTHORIZATION: 'token-2' },
      ),
    ).toEqual({
      accept: 'text/plain',
      AUTHORIZATION: 'token-2',
    });
  });
});
