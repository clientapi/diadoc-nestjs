import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('README', () => {
  it('documents required installation and usage examples', async () => {
    const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');

    expect(readme).toContain('npm install diadoc-nestjs');
    expect(readme).toContain('DiadocModule.register');
    expect(readme).toContain('DiadocAuth');
    expect(readme).toContain('diadoc.documents.getDocumentV3');
    expect(readme).toContain('diadoc.messages.raw.PostMessageV3');
    expect(readme).toContain('DiadocApiClient, GeneratedDiadocClient, operations');
    expect(readme).toContain('operations,');
    expect(readme).not.toContain('query: { boxId }');
  });
});
