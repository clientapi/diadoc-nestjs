import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIADOC_OPENAPI_URL = 'https://developer.kontur.ru/api/documentations/diadoc.api';

export type OpenApiFetcher = (url: string) => Promise<Response>;

export interface OpenApiSummary {
  version: string;
  paths: number;
  operations: number;
  schemas: number;
  tags: number;
}

export interface DownloadOpenApiOptions {
  destination: string;
  fetcher?: OpenApiFetcher;
}

const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

export function summarizeOpenApi(document: any): OpenApiSummary {
  const pathsObject = document.paths ?? {};
  const pathEntries = Object.entries(pathsObject);
  const tagNames = new Set<string>();
  let operations = 0;

  for (const [, pathItem] of pathEntries) {
    for (const [method, operation] of Object.entries(pathItem as Record<string, any>)) {
      if (!METHODS.has(method)) {
        continue;
      }
      operations += 1;
      for (const tag of (operation as any).tags ?? []) {
        tagNames.add(tag);
      }
    }
  }

  return {
    version: String(document.info?.version ?? ''),
    paths: pathEntries.length,
    operations,
    schemas: Object.keys(document.components?.schemas ?? {}).length,
    tags: tagNames.size,
  };
}

export async function downloadOpenApi(options: DownloadOpenApiOptions): Promise<OpenApiSummary> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(DIADOC_OPENAPI_URL);

  if (!response.ok) {
    throw new Error(`Failed to download Diadoc OpenAPI: ${response.status} ${response.statusText}`);
  }

  const document = await response.json();
  const normalized = `${JSON.stringify(document, null, 2)}\n`;
  await mkdir(dirname(options.destination), { recursive: true });
  await writeFile(options.destination, normalized, 'utf8');
  return summarizeOpenApi(document);
}

async function main(): Promise<void> {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const destination = resolve(root, 'openapi/diadoc.openapi.json');
  const summary = await downloadOpenApi({ destination });
  console.log(
    `Downloaded Diadoc OpenAPI ${summary.version}: ${summary.paths} paths, ${summary.operations} operations, ${summary.schemas} schemas, ${summary.tags} tags`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
