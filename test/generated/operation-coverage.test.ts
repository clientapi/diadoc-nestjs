import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { operations } from '../../src/generated/operations';

const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);

function countOpenApiOperations(): number {
  const document = JSON.parse(readFileSync('openapi/diadoc.openapi.json', 'utf8'));
  let count = 0;
  for (const pathItem of Object.values(document.paths ?? {}) as Array<Record<string, unknown>>) {
    for (const method of Object.keys(pathItem)) {
      if (METHODS.has(method)) {
        count += 1;
      }
    }
  }
  return count;
}

describe('generated operation coverage', () => {
  it('contains every operation from the local OpenAPI document', () => {
    expect(operations).toHaveLength(countOpenApiOperations());
  });

  it('keeps operation IDs unique', () => {
    const ids = operations.map((operation) => operation.operationId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
