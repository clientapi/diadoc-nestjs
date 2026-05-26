import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { downloadOpenApi, summarizeOpenApi } from '../../scripts/download-openapi';
import fixture from '../fixtures/minimal-openapi.json';

describe('download-openapi', () => {
  it('summarizes paths, operations, schemas, and tags', () => {
    expect(summarizeOpenApi(fixture)).toEqual({
      version: '1.0.0',
      paths: 1,
      operations: 1,
      schemas: 1,
      tags: 1,
    });
  });

  it('downloads and writes normalized JSON', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'diadoc-openapi-'));
    const destination = join(dir, 'diadoc.openapi.json');
    const fetcher = async () =>
      new Response(JSON.stringify(fixture), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });

    await downloadOpenApi({ destination, fetcher });

    const savedText = await readFile(destination, 'utf8');
    expect(savedText).toBe(`${JSON.stringify(fixture, null, 2)}\n`);

    const saved = JSON.parse(savedText);
    expect(saved.info.version).toBe('1.0.0');
    await rm(dir, { recursive: true, force: true });
  });
});
