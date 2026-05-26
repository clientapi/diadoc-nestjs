# Diadoc NestJS Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete TypeScript NestJS library for Diadoc API with generated full OpenAPI coverage and ergonomic domain services.

**Architecture:** The package has a generated core from the official Diadoc OpenAPI document, a hand-written undici transport/auth/error layer, and a NestJS dynamic module that exports aggregate and domain services. The generator creates method wrappers for every OpenAPI operation and domain clients grouped by official tags.

**Tech Stack:** TypeScript, NestJS peer dependency, undici, openapi-typescript, tsup, vitest, eslint, prettier, npm.

---

## File Structure

Create this structure during implementation:

```text
package.json
package-lock.json
tsconfig.json
tsconfig.build.json
tsup.config.ts
vitest.config.ts
eslint.config.mjs
prettier.config.cjs
.gitignore
README.md
openapi/
  diadoc.openapi.json
src/
  index.ts
  generated/
    client.ts
    domain-clients.ts
    operations.ts
    types.ts
  core/
    diadoc-api-client.ts
    diadoc-auth.ts
    diadoc-error.ts
    http-transport.ts
    request-options.ts
    retry-policy.ts
  nest/
    diadoc.constants.ts
    diadoc.module-definition.ts
    diadoc.module.ts
    diadoc.service.ts
  services/
    authorization.service.ts
    counterparties.service.ts
    docflows.service.ts
    document-shelf.service.ts
    documents.service.ts
    employees.service.ts
    events.service.ts
    generation.service.ts
    messages.service.ts
    operators.service.ts
    organizations.service.ts
    power-of-attorney.service.ts
    print-forms.service.ts
    signatures.service.ts
scripts/
  download-openapi.ts
  generate-client.ts
test/
  core/
  generated/
  nest/
  scripts/
  services/
  fixtures/
```

Generated files are `src/generated/client.ts`, `src/generated/domain-clients.ts`, `src/generated/operations.ts`, and `src/generated/types.ts`. Do not edit them by hand after the generator is working.

The official OpenAPI source is `https://developer.kontur.ru/api/documentations/diadoc.api`. The observed 2026-05-22 document has `125` operations. The implementation must assert generated coverage from the local `openapi/diadoc.openapi.json`, not from a hard-coded operation count.

## Domain Mapping

The generator must map official Russian OpenAPI tags to stable English service names:

```ts
export const TAG_SERVICE_NAMES = {
  'Авторизация': 'authorization',
  'Генерация и парсинг': 'generation',
  'Документооборот': 'docflows',
  'Документы': 'documents',
  'Контрагенты и группы контрагентов': 'counterparties',
  'Машиночитаемые доверенности': 'powerOfAttorney',
  'Операторы ЭДО': 'operators',
  'Организации, подразделения и ящики': 'organizations',
  'Печатные формы': 'printForms',
  'Подписание документов': 'signing',
  'Полка документов': 'documentShelf',
  'События': 'events',
  'Сообщения': 'messages',
  'Сотрудники и пользователи': 'employees',
  'Цифровые подписи': 'signatures',
} as const;
```

Each domain client exposes:

- A camel-cased method for each operation in the domain, such as `getDocumentV3()`.
- A `raw` property with exact operation IDs, such as `raw.GetDocumentV3()`.

---

### Task 1: Project Scaffold And Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `tsup.config.ts`
- Create: `vitest.config.ts`
- Create: `eslint.config.mjs`
- Create: `prettier.config.cjs`
- Create: `.gitignore`
- Create: `src/index.ts`

- [ ] **Step 1: Create package metadata and scripts**

Create `package.json` with this content:

```json
{
  "name": "diadoc-nestjs",
  "version": "0.1.0",
  "description": "NestJS-ready TypeScript client for Diadoc API with full OpenAPI coverage.",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "openapi/diadoc.openapi.json",
    "README.md"
  ],
  "scripts": {
    "build": "tsup",
    "clean": "node -e \"require('node:fs').rmSync('dist', { recursive: true, force: true })\"",
    "download:openapi": "tsx scripts/download-openapi.ts",
    "generate": "tsx scripts/generate-client.ts",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "verify": "npm run lint && npm run typecheck && npm test && npm run build"
  },
  "peerDependencies": {
    "@nestjs/common": "^10.0.0 || ^11.0.0",
    "rxjs": "^7.8.0"
  },
  "dependencies": {
    "undici": "^6.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "openapi-typescript": "^7.0.0",
    "prettier": "^3.0.0",
    "reflect-metadata": "^0.2.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "typescript-eslint": "^8.0.0",
    "vitest": "^2.0.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: Create TypeScript and build configs**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "declaration": true,
    "sourceMap": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src", "scripts", "test", "*.config.ts", "*.config.mjs"]
}
```

Create `tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true
  },
  "exclude": ["test", "**/*.test.ts"]
}
```

Create `tsup.config.ts`:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node20',
  external: ['@nestjs/common', 'rxjs'],
});
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Create lint, format, ignore, and empty export files**

Create `eslint.config.mjs`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
```

Create `prettier.config.cjs`:

```js
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
};
```

Create `.gitignore`:

```text
node_modules/
dist/
coverage/
.env
.DS_Store
```

Create `src/index.ts`:

```ts
export {};
```

- [ ] **Step 4: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and install exits with code `0`.

- [ ] **Step 5: Verify empty scaffold**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: typecheck exits `0`, vitest reports no failing tests, and `dist/index.js`, `dist/index.cjs`, and `dist/index.d.ts` are emitted.

- [ ] **Step 6: Commit scaffold**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.build.json tsup.config.ts vitest.config.ts eslint.config.mjs prettier.config.cjs .gitignore src/index.ts
git commit -m "chore: scaffold typescript library"
```

---

### Task 2: OpenAPI Download Script

**Files:**
- Create: `scripts/download-openapi.ts`
- Create: `test/scripts/download-openapi.test.ts`
- Create: `test/fixtures/minimal-openapi.json`

- [ ] **Step 1: Write failing tests for OpenAPI summarization and persistence**

Create `test/fixtures/minimal-openapi.json`:

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "Fixture",
    "version": "1.0.0"
  },
  "paths": {
    "/Ping": {
      "get": {
        "tags": ["Документы"],
        "operationId": "Ping",
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "PingResponse": {
        "type": "object",
        "properties": {
          "ok": {
            "type": "boolean"
          }
        }
      }
    }
  }
}
```

Create `test/scripts/download-openapi.test.ts`:

```ts
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

    const saved = JSON.parse(await readFile(destination, 'utf8'));
    expect(saved.info.version).toBe('1.0.0');
    await rm(dir, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run tests to verify red**

Run:

```bash
npm test -- test/scripts/download-openapi.test.ts
```

Expected: FAIL because `scripts/download-openapi.ts` does not exist.

- [ ] **Step 3: Implement the download script**

Create `scripts/download-openapi.ts`:

```ts
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIADOC_OPENAPI_URL = 'https://developer.kontur.ru/api/documentations/diadoc.api';

type Fetcher = (url: string) => Promise<Response>;

export interface OpenApiSummary {
  version: string;
  paths: number;
  operations: number;
  schemas: number;
  tags: number;
}

export interface DownloadOpenApiOptions {
  destination: string;
  fetcher?: Fetcher;
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
```

- [ ] **Step 4: Run tests to verify green**

Run:

```bash
npm test -- test/scripts/download-openapi.test.ts
```

Expected: PASS with `2` tests.

- [ ] **Step 5: Download the official OpenAPI document**

Run:

```bash
npm run download:openapi
```

Expected output includes `Downloaded Diadoc OpenAPI` and the local file `openapi/diadoc.openapi.json` exists.

- [ ] **Step 6: Commit OpenAPI downloader and document**

```bash
git add scripts/download-openapi.ts test/scripts/download-openapi.test.ts test/fixtures/minimal-openapi.json openapi/diadoc.openapi.json package.json package-lock.json
git commit -m "feat: add diadoc openapi downloader"
```

---

### Task 3: Generated Operation Metadata And Client Generator

**Files:**
- Create: `scripts/generate-client.ts`
- Create: `test/scripts/generate-client.test.ts`
- Create: `test/generated/operation-coverage.test.ts`
- Create: `src/generated/client.ts`
- Create: `src/generated/domain-clients.ts`
- Create: `src/generated/operations.ts`
- Create: `src/generated/types.ts`
- Modify: `package.json`

- [ ] **Step 1: Write failing generator tests**

Create `test/scripts/generate-client.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import fixture from '../fixtures/minimal-openapi.json';
import {
  collectOperations,
  generateClientSource,
  generateDomainClientsSource,
  generateOperationsSource,
  toCamelMethodName,
} from '../../scripts/generate-client';

describe('generate-client', () => {
  it('collects operation metadata from OpenAPI paths', () => {
    expect(collectOperations(fixture)).toEqual([
      {
        operationId: 'Ping',
        method: 'GET',
        path: '/Ping',
        tag: 'Документы',
        requiresAuth: true,
        requestBodyContentTypes: [],
        responseContentTypes: [],
      },
    ]);
  });

  it('converts operation IDs to stable camel method names', () => {
    expect(toCamelMethodName('GetDocumentV3')).toBe('getDocumentV3');
    expect(toCamelMethodName('DssSign')).toBe('dssSign');
  });

  it('generates operation metadata source', () => {
    const source = generateOperationsSource(collectOperations(fixture));
    expect(source).toContain("operationId: 'Ping'");
    expect(source).toContain("path: '/Ping'");
  });

  it('generates a client method that delegates by operation ID', () => {
    const source = generateClientSource(collectOperations(fixture));
    expect(source).toContain('async Ping(');
    expect(source).toContain("return this.core.request('Ping', request);");
  });

  it('generates a domain client with camel alias and raw operation access', () => {
    const source = generateDomainClientsSource(collectOperations(fixture));
    expect(source).toContain('export class GeneratedDocumentsDomainClient');
    expect(source).toContain('async ping(');
    expect(source).toContain('readonly raw');
  });
});
```

- [ ] **Step 2: Run tests to verify red**

Run:

```bash
npm test -- test/scripts/generate-client.test.ts
```

Expected: FAIL because `scripts/generate-client.ts` does not exist.

- [ ] **Step 3: Implement the generator**

Create `scripts/generate-client.ts` with these exported functions and CLI behavior:

```ts
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);

export interface OperationMetadata {
  operationId: string;
  method: string;
  path: string;
  tag: string;
  requiresAuth: boolean;
  requestBodyContentTypes: string[];
  responseContentTypes: string[];
}

export const TAG_SERVICE_NAMES: Record<string, string> = {
  'Авторизация': 'authorization',
  'Генерация и парсинг': 'generation',
  'Документооборот': 'docflows',
  'Документы': 'documents',
  'Контрагенты и группы контрагентов': 'counterparties',
  'Машиночитаемые доверенности': 'powerOfAttorney',
  'Операторы ЭДО': 'operators',
  'Организации, подразделения и ящики': 'organizations',
  'Печатные формы': 'printForms',
  'Подписание документов': 'signing',
  'Полка документов': 'documentShelf',
  'События': 'events',
  'Сообщения': 'messages',
  'Сотрудники и пользователи': 'employees',
  'Цифровые подписи': 'signatures',
};

export function toCamelMethodName(operationId: string): string {
  return operationId.charAt(0).toLowerCase() + operationId.slice(1);
}

export function toPascalName(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function contentTypes(content: unknown): string[] {
  return Object.keys((content as Record<string, unknown> | undefined) ?? {});
}

export function collectOperations(document: any): OperationMetadata[] {
  const result: OperationMetadata[] = [];

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem as Record<string, any>)) {
      if (!METHODS.has(method)) {
        continue;
      }

      const op = operation as any;
      const operationId = String(op.operationId);
      const tag = String(op.tags?.[0] ?? 'default');
      const responseContentTypes = Object.values(op.responses ?? {}).flatMap((response: any) =>
        contentTypes(response?.content),
      );

      result.push({
        operationId,
        method: method.toUpperCase(),
        path,
        tag,
        requiresAuth: tag !== 'Авторизация',
        requestBodyContentTypes: contentTypes(op.requestBody?.content),
        responseContentTypes,
      });
    }
  }

  return result.sort((a, b) => a.operationId.localeCompare(b.operationId));
}

export function generateOperationsSource(operations: OperationMetadata[]): string {
  return `import type { OperationMetadata } from '../core/request-options';\n\nexport const operations = ${JSON.stringify(
    operations,
    null,
    2,
  )} as const satisfies readonly OperationMetadata[];\n\nexport type OperationId = typeof operations[number]['operationId'];\n`;
}

export function generateClientSource(operations: OperationMetadata[]): string {
  const methods = operations
    .map(
      (operation) => `  async ${operation.operationId}(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request('${operation.operationId}', request);
  }`,
    )
    .join('\n\n');

  return `import type { DiadocApiClient } from '../core/diadoc-api-client';\n\nexport interface GeneratedOperationRequest {
  path?: Record<string, string | number | boolean>;\n  query?: Record<string, unknown>;\n  headers?: Record<string, string>;\n  body?: unknown;\n  responseType?: 'json' | 'text' | 'arrayBuffer';\n  authToken?: string;\n}\n\nexport class GeneratedDiadocClient {
  constructor(private readonly core: DiadocApiClient) {}\n\n${methods}\n}\n`;
}

export function generateDomainClientsSource(operations: OperationMetadata[]): string {
  const byService = new Map<string, OperationMetadata[]>();
  for (const operation of operations) {
    const serviceName = TAG_SERVICE_NAMES[operation.tag] ?? toCamelMethodName(toPascalName(operation.tag));
    byService.set(serviceName, [...(byService.get(serviceName) ?? []), operation]);
  }

  const classes = [...byService.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([serviceName, serviceOperations]) => {
      const className = `Generated${toPascalName(serviceName)}DomainClient`;
      const rawEntries = serviceOperations
        .map(
          (operation) =>
            `    ${operation.operationId}: (request?: GeneratedOperationRequest) => this.generated.${operation.operationId}(request),`,
        )
        .join('\n');
      const aliases = serviceOperations
        .map(
          (operation) => `  async ${toCamelMethodName(operation.operationId)}(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated.${operation.operationId}(request);
  }`,
        )
        .join('\n\n');

      return `export class ${className} {
  readonly raw = {
${rawEntries}
  };\n\n  constructor(private readonly generated: GeneratedDiadocClient) {}\n\n${aliases}
}`;
    })
    .join('\n\n');

  return `import { GeneratedDiadocClient, type GeneratedOperationRequest } from './client';\n\n${classes}\n`;
}

async function writeGeneratedFile(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

export async function generateFromOpenApi(openApiPath: string, generatedDir: string): Promise<OperationMetadata[]> {
  const document = JSON.parse(await readFile(openApiPath, 'utf8'));
  const operations = collectOperations(document);
  const schemaAst = await openapiTS(document);
  const schemaSource = astToString(schemaAst);
  await mkdir(generatedDir, { recursive: true });
  await writeGeneratedFile(resolve(generatedDir, 'types.ts'), `${schemaSource}\n`);
  await writeGeneratedFile(resolve(generatedDir, 'operations.ts'), generateOperationsSource(operations));
  await writeGeneratedFile(resolve(generatedDir, 'client.ts'), generateClientSource(operations));
  await writeGeneratedFile(resolve(generatedDir, 'domain-clients.ts'), generateDomainClientsSource(operations));
  return operations;
}

async function main(): Promise<void> {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const openApiPath = resolve(root, 'openapi/diadoc.openapi.json');
  const generatedDir = resolve(root, 'src/generated');
  const operations = await generateFromOpenApi(openApiPath, generatedDir);
  console.log(`Generated ${operations.length} Diadoc operations`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
```

- [ ] **Step 4: Run generator tests to verify green**

Run:

```bash
npm test -- test/scripts/generate-client.test.ts
```

Expected: PASS with `5` tests.

- [ ] **Step 5: Generate client files from the official OpenAPI document**

Run:

```bash
npm run generate
```

Expected output: `Generated 125 Diadoc operations` for the observed 2026-05-22 document.

- [ ] **Step 6: Add generated coverage test**

Create `test/generated/operation-coverage.test.ts`:

```ts
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
```

- [ ] **Step 7: Run generated coverage tests**

Run:

```bash
npm test -- test/generated/operation-coverage.test.ts
```

Expected: PASS with `2` tests.

- [ ] **Step 8: Commit generator and generated files**

```bash
git add scripts/generate-client.ts test/scripts/generate-client.test.ts test/generated/operation-coverage.test.ts src/generated package.json package-lock.json
git commit -m "feat: generate diadoc openapi client"
```

---

### Task 4: Core Auth And Error Types

**Files:**
- Create: `src/core/diadoc-auth.ts`
- Create: `src/core/diadoc-error.ts`
- Create: `test/core/diadoc-auth.test.ts`
- Create: `test/core/diadoc-error.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing auth tests**

Create `test/core/diadoc-auth.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildDiadocAuthHeader, resolveAuthToken } from '../../src/core/diadoc-auth';
import { DiadocAuthError } from '../../src/core/diadoc-error';

describe('diadoc-auth', () => {
  it('builds the official DiadocAuth header', () => {
    expect(buildDiadocAuthHeader('client-1', 'token-1')).toBe(
      'DiadocAuth ddauth_api_client_id=client-1, ddauth_token=token-1',
    );
  });

  it('resolves an async token provider', async () => {
    await expect(resolveAuthToken(() => Promise.resolve('dynamic-token'))).resolves.toBe('dynamic-token');
  });

  it('throws a clear auth error when a token is required but missing', async () => {
    await expect(resolveAuthToken(undefined, { required: true })).rejects.toBeInstanceOf(DiadocAuthError);
  });
});
```

- [ ] **Step 2: Write failing error tests**

Create `test/core/diadoc-error.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { DiadocHttpError, DiadocTimeoutError } from '../../src/core/diadoc-error';

describe('diadoc errors', () => {
  it('preserves http status, url, operation, headers, and body', () => {
    const error = new DiadocHttpError({
      message: 'Diadoc request failed',
      status: 409,
      url: 'https://diadoc-api.kontur.ru/GetDocument',
      operationId: 'GetDocumentV3',
      headers: { 'x-kontur-trace-id': 'trace-1' },
      body: 'conflict',
    });

    expect(error.status).toBe(409);
    expect(error.operationId).toBe('GetDocumentV3');
    expect(error.body).toBe('conflict');
    expect(error.headers['x-kontur-trace-id']).toBe('trace-1');
  });

  it('marks timeout errors with timeoutMs', () => {
    const error = new DiadocTimeoutError('GetDocumentV3', 1000);
    expect(error.operationId).toBe('GetDocumentV3');
    expect(error.timeoutMs).toBe(1000);
  });
});
```

- [ ] **Step 3: Run tests to verify red**

Run:

```bash
npm test -- test/core/diadoc-auth.test.ts test/core/diadoc-error.test.ts
```

Expected: FAIL because auth and error modules do not exist.

- [ ] **Step 4: Implement error classes**

Create `src/core/diadoc-error.ts`:

```ts
export class DiadocError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class DiadocAuthError extends DiadocError {}

export class DiadocValidationError extends DiadocError {}

export interface DiadocHttpErrorInput {
  message: string;
  status: number;
  url: string;
  operationId?: string;
  headers: Record<string, string>;
  body: string | ArrayBuffer | Uint8Array | null;
}

export class DiadocHttpError extends DiadocError {
  readonly status: number;
  readonly url: string;
  readonly operationId?: string;
  readonly headers: Record<string, string>;
  readonly body: string | ArrayBuffer | Uint8Array | null;

  constructor(input: DiadocHttpErrorInput) {
    super(input.message);
    this.status = input.status;
    this.url = input.url;
    this.operationId = input.operationId;
    this.headers = input.headers;
    this.body = input.body;
  }
}

export class DiadocTimeoutError extends DiadocError {
  constructor(
    readonly operationId: string,
    readonly timeoutMs: number,
  ) {
    super(`Diadoc operation ${operationId} timed out after ${timeoutMs} ms`);
  }
}
```

- [ ] **Step 5: Implement auth helpers**

Create `src/core/diadoc-auth.ts`:

```ts
import { DiadocAuthError } from './diadoc-error';

export type DiadocAuthTokenProvider = string | (() => string | Promise<string>);

export interface ResolveAuthTokenOptions {
  required?: boolean;
}

export function buildDiadocAuthHeader(apiClientId: string, authToken?: string): string {
  if (!authToken) {
    return `DiadocAuth ddauth_api_client_id=${apiClientId}`;
  }

  return `DiadocAuth ddauth_api_client_id=${apiClientId}, ddauth_token=${authToken}`;
}

export async function resolveAuthToken(
  provider: DiadocAuthTokenProvider | undefined,
  options: ResolveAuthTokenOptions = {},
): Promise<string | undefined> {
  const token = typeof provider === 'function' ? await provider() : provider;

  if (!token && options.required) {
    throw new DiadocAuthError('Diadoc auth token is required for this operation');
  }

  return token;
}
```

- [ ] **Step 6: Export core auth and errors**

Modify `src/index.ts`:

```ts
export * from './core/diadoc-auth';
export * from './core/diadoc-error';
```

- [ ] **Step 7: Run tests to verify green**

Run:

```bash
npm test -- test/core/diadoc-auth.test.ts test/core/diadoc-error.test.ts
npm run typecheck
```

Expected: tests PASS and typecheck exits `0`.

- [ ] **Step 8: Commit auth and errors**

```bash
git add src/core/diadoc-auth.ts src/core/diadoc-error.ts test/core/diadoc-auth.test.ts test/core/diadoc-error.test.ts src/index.ts
git commit -m "feat: add diadoc auth and error primitives"
```

---

### Task 5: Request Options And Retry Policy

**Files:**
- Create: `src/core/request-options.ts`
- Create: `src/core/retry-policy.ts`
- Create: `test/core/request-options.test.ts`
- Create: `test/core/retry-policy.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing request option tests**

Create `test/core/request-options.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildUrl, mergeHeaders } from '../../src/core/request-options';

describe('request-options', () => {
  it('replaces path parameters and appends query parameters', () => {
    const url = buildUrl('https://example.test', '/boxes/{boxId}/documents', {
      path: { boxId: 'box-1' },
      query: { limit: 10, includeDrafts: false, empty: undefined },
    });

    expect(url).toBe('https://example.test/boxes/box-1/documents?limit=10&includeDrafts=false');
  });

  it('merges headers case-insensitively with later values winning', () => {
    expect(mergeHeaders({ Accept: 'application/json' }, { accept: 'text/plain' })).toEqual({
      accept: 'text/plain',
    });
  });
});
```

- [ ] **Step 2: Write failing retry tests**

Create `test/core/retry-policy.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { runWithRetry } from '../../src/core/retry-policy';

describe('retry-policy', () => {
  it('retries retryable failures and returns the successful value', async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(Object.assign(new Error('busy'), { status: 503 }))
      .mockResolvedValueOnce('ok');

    await expect(
      runWithRetry(fn, {
        attempts: 2,
        baseDelayMs: 0,
        retryableStatuses: [503],
      }),
    ).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 3: Run tests to verify red**

Run:

```bash
npm test -- test/core/request-options.test.ts test/core/retry-policy.test.ts
```

Expected: FAIL because request option and retry modules do not exist.

- [ ] **Step 4: Implement request options**

Create `src/core/request-options.ts`:

```ts
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

export function mergeHeaders(...headerSets: Array<Record<string, string> | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const headers of headerSets) {
    for (const [key, value] of Object.entries(headers ?? {})) {
      result[key.toLowerCase()] = value;
    }
  }
  return result;
}

export function buildUrl(
  baseUrl: string,
  template: string,
  options: Pick<DiadocRequestOptions, 'path' | 'query'> = {},
): string {
  let path = template;
  for (const [name, value] of Object.entries(options.path ?? {})) {
    path = path.replace(`{${name}}`, encodeURIComponent(String(value)));
  }

  const url = new URL(path.replace(/^\//, ''), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}
```

- [ ] **Step 5: Implement retry policy**

Create `src/core/retry-policy.ts`:

```ts
export interface DiadocRetryOptions {
  attempts: number;
  baseDelayMs: number;
  retryableStatuses: number[];
}

export const DEFAULT_RETRY_OPTIONS: DiadocRetryOptions = {
  attempts: 1,
  baseDelayMs: 250,
  retryableStatuses: [429, 500, 502, 503, 504],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown, statuses: number[]): boolean {
  const status = typeof error === 'object' && error !== null ? (error as { status?: number }).status : undefined;
  return typeof status === 'number' && statuses.includes(status);
}

export async function runWithRetry<T>(
  operation: () => Promise<T>,
  options: DiadocRetryOptions = DEFAULT_RETRY_OPTIONS,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt >= options.attempts || !isRetryable(error, options.retryableStatuses)) {
        throw error;
      }
      await sleep(options.baseDelayMs * attempt);
    }
  }

  throw lastError;
}
```

- [ ] **Step 6: Export request and retry primitives**

Modify `src/index.ts`:

```ts
export * from './core/diadoc-auth';
export * from './core/diadoc-error';
export * from './core/request-options';
export * from './core/retry-policy';
```

- [ ] **Step 7: Run tests to verify green**

Run:

```bash
npm test -- test/core/request-options.test.ts test/core/retry-policy.test.ts
npm run typecheck
```

Expected: tests PASS and typecheck exits `0`.

- [ ] **Step 8: Commit request and retry primitives**

```bash
git add src/core/request-options.ts src/core/retry-policy.ts test/core/request-options.test.ts test/core/retry-policy.test.ts src/index.ts
git commit -m "feat: add request options and retry policy"
```

---

### Task 6: Undici HTTP Transport

**Files:**
- Create: `src/core/http-transport.ts`
- Create: `test/core/http-transport.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing transport tests**

Create `test/core/http-transport.test.ts`:

```ts
import { MockAgent, setGlobalDispatcher } from 'undici';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UndiciDiadocHttpTransport } from '../../src/core/http-transport';
import { DiadocHttpError } from '../../src/core/diadoc-error';

describe('UndiciDiadocHttpTransport', () => {
  let agent: MockAgent;

  beforeEach(() => {
    agent = new MockAgent();
    agent.disableNetConnect();
    setGlobalDispatcher(agent);
  });

  afterEach(async () => {
    await agent.close();
  });

  it('sends JSON requests and parses JSON responses', async () => {
    agent
      .get('https://diadoc.test')
      .intercept({
        method: 'POST',
        path: '/V3/PostMessage',
        headers: { authorization: 'DiadocAuth ddauth_api_client_id=client, ddauth_token=token' },
      })
      .reply(200, { ok: true }, { headers: { 'content-type': 'application/json' } });

    const transport = new UndiciDiadocHttpTransport();
    const response = await transport.request<{ ok: boolean }>({
      method: 'POST',
      url: 'https://diadoc.test/V3/PostMessage',
      headers: {
        authorization: 'DiadocAuth ddauth_api_client_id=client, ddauth_token=token',
        'content-type': 'application/json',
      },
      body: { message: true },
      responseType: 'json',
      operationId: 'PostMessageV3',
    });

    expect(response.body).toEqual({ ok: true });
    expect(response.status).toBe(200);
  });

  it('returns binary responses as ArrayBuffer', async () => {
    agent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/GetContent' })
      .reply(200, Buffer.from('file'));

    const transport = new UndiciDiadocHttpTransport();
    const response = await transport.request<ArrayBuffer>({
      method: 'GET',
      url: 'https://diadoc.test/GetContent',
      headers: {},
      responseType: 'arrayBuffer',
      operationId: 'GetContent',
    });

    expect(Buffer.from(response.body).toString('utf8')).toBe('file');
  });

  it('throws DiadocHttpError for non-2xx responses', async () => {
    agent
      .get('https://diadoc.test')
      .intercept({ method: 'GET', path: '/GetDocument' })
      .reply(404, 'missing', { headers: { 'x-kontur-trace-id': 'trace-1' } });

    const transport = new UndiciDiadocHttpTransport();

    await expect(
      transport.request({
        method: 'GET',
        url: 'https://diadoc.test/GetDocument',
        headers: {},
        responseType: 'text',
        operationId: 'GetDocumentV3',
      }),
    ).rejects.toMatchObject({
      status: 404,
      operationId: 'GetDocumentV3',
      body: 'missing',
    } satisfies Partial<DiadocHttpError>);
  });
});
```

- [ ] **Step 2: Run tests to verify red**

Run:

```bash
npm test -- test/core/http-transport.test.ts
```

Expected: FAIL because `src/core/http-transport.ts` does not exist.

- [ ] **Step 3: Implement undici transport**

Create `src/core/http-transport.ts`:

```ts
import { request as undiciRequest } from 'undici';
import { DiadocHttpError } from './diadoc-error';

export interface DiadocHttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  responseType?: 'json' | 'text' | 'arrayBuffer';
  operationId?: string;
  signal?: AbortSignal;
}

export interface DiadocHttpResponse<T> {
  status: number;
  headers: Record<string, string>;
  body: T;
}

export interface DiadocHttpTransport {
  request<T>(request: DiadocHttpRequest): Promise<DiadocHttpResponse<T>>;
}

function serializeBody(body: unknown, headers: Record<string, string>): unknown {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (
    typeof body === 'string' ||
    body instanceof Uint8Array ||
    body instanceof ArrayBuffer ||
    body instanceof FormData ||
    body instanceof Blob
  ) {
    return body;
  }

  if (!headers['content-type']) {
    headers['content-type'] = 'application/json';
  }

  return JSON.stringify(body);
}

function normalizeHeaders(headers: Record<string, string | string[] | undefined>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      normalized[key.toLowerCase()] = value.join(', ');
    } else if (value !== undefined) {
      normalized[key.toLowerCase()] = value;
    }
  }
  return normalized;
}

async function readBody(responseBody: { json(): Promise<unknown>; text(): Promise<string>; arrayBuffer(): Promise<ArrayBuffer> }, responseType: DiadocHttpRequest['responseType']): Promise<unknown> {
  if (responseType === 'arrayBuffer') {
    return responseBody.arrayBuffer();
  }

  if (responseType === 'text') {
    return responseBody.text();
  }

  return responseBody.json();
}

export class UndiciDiadocHttpTransport implements DiadocHttpTransport {
  async request<T>(input: DiadocHttpRequest): Promise<DiadocHttpResponse<T>> {
    const headers = { ...input.headers };
    const response = await undiciRequest(input.url, {
      method: input.method,
      headers,
      body: serializeBody(input.body, headers) as any,
      signal: input.signal,
    });
    const responseHeaders = normalizeHeaders(response.headers);
    const responseType = input.responseType ?? 'json';
    const body = await readBody(response.body, responseType);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new DiadocHttpError({
        message: `Diadoc operation ${input.operationId ?? input.method} failed with status ${response.statusCode}`,
        status: response.statusCode,
        url: input.url,
        operationId: input.operationId,
        headers: responseHeaders,
        body: body as string | ArrayBuffer | Uint8Array | null,
      });
    }

    return {
      status: response.statusCode,
      headers: responseHeaders,
      body: body as T,
    };
  }
}
```

- [ ] **Step 4: Export transport**

Modify `src/index.ts`:

```ts
export * from './core/diadoc-auth';
export * from './core/diadoc-error';
export * from './core/http-transport';
export * from './core/request-options';
export * from './core/retry-policy';
```

- [ ] **Step 5: Run tests to verify green**

Run:

```bash
npm test -- test/core/http-transport.test.ts
npm run typecheck
```

Expected: tests PASS and typecheck exits `0`.

- [ ] **Step 6: Commit transport**

```bash
git add src/core/http-transport.ts test/core/http-transport.test.ts src/index.ts
git commit -m "feat: add undici http transport"
```

---

### Task 7: DiadocApiClient Core

**Files:**
- Create: `src/core/diadoc-api-client.ts`
- Create: `test/core/diadoc-api-client.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing client tests**

Create `test/core/diadoc-api-client.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { DiadocApiClient } from '../../src/core/diadoc-api-client';
import type { DiadocHttpTransport } from '../../src/core/http-transport';
import { DiadocAuthError } from '../../src/core/diadoc-error';

describe('DiadocApiClient', () => {
  it('uses operation metadata to build an authorized request', async () => {
    const transport: DiadocHttpTransport = {
      request: vi.fn().mockResolvedValue({ status: 200, headers: {}, body: { ok: true } }),
    };
    const client = new DiadocApiClient({
      apiClientId: 'client',
      authToken: 'token',
      baseUrl: 'https://diadoc.test',
      transport,
      operations: [
        {
          operationId: 'GetDocumentV3',
          method: 'GET',
          path: '/V3/GetDocument',
          tag: 'Документы',
          requiresAuth: true,
          requestBodyContentTypes: [],
          responseContentTypes: ['application/json'],
        },
      ],
    });

    await client.request('GetDocumentV3', {
      query: { boxId: 'box-1' },
    });

    expect(transport.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://diadoc.test/V3/GetDocument?boxId=box-1',
        headers: expect.objectContaining({
          authorization: 'DiadocAuth ddauth_api_client_id=client, ddauth_token=token',
        }),
        operationId: 'GetDocumentV3',
      }),
    );
  });

  it('allows auth operations without a token', async () => {
    const transport: DiadocHttpTransport = {
      request: vi.fn().mockResolvedValue({ status: 200, headers: {}, body: 'encrypted' }),
    };
    const client = new DiadocApiClient({
      apiClientId: 'client',
      baseUrl: 'https://diadoc.test',
      transport,
      operations: [
        {
          operationId: 'AuthenticateV3',
          method: 'POST',
          path: '/V3/Authenticate',
          tag: 'Авторизация',
          requiresAuth: false,
          requestBodyContentTypes: ['application/json'],
          responseContentTypes: ['text/plain'],
        },
      ],
    });

    await expect(client.request('AuthenticateV3', { body: { login: 'user' } })).resolves.toBe('encrypted');
  });

  it('throws when a protected operation has no token', async () => {
    const client = new DiadocApiClient({
      apiClientId: 'client',
      baseUrl: 'https://diadoc.test',
      transport: { request: vi.fn() },
      operations: [
        {
          operationId: 'GetDocumentV3',
          method: 'GET',
          path: '/V3/GetDocument',
          tag: 'Документы',
          requiresAuth: true,
          requestBodyContentTypes: [],
          responseContentTypes: ['application/json'],
        },
      ],
    });

    await expect(client.request('GetDocumentV3')).rejects.toBeInstanceOf(DiadocAuthError);
  });
});
```

- [ ] **Step 2: Run tests to verify red**

Run:

```bash
npm test -- test/core/diadoc-api-client.test.ts
```

Expected: FAIL because `src/core/diadoc-api-client.ts` does not exist.

- [ ] **Step 3: Implement DiadocApiClient**

Create `src/core/diadoc-api-client.ts`:

```ts
import { buildDiadocAuthHeader, type DiadocAuthTokenProvider, resolveAuthToken } from './diadoc-auth';
import type { DiadocHttpTransport } from './http-transport';
import { UndiciDiadocHttpTransport } from './http-transport';
import { buildUrl, mergeHeaders, type DiadocRequestOptions, type OperationMetadata } from './request-options';
import { DEFAULT_RETRY_OPTIONS, runWithRetry, type DiadocRetryOptions } from './retry-policy';
import { DiadocValidationError, DiadocTimeoutError } from './diadoc-error';

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
  private readonly baseUrl: string;
  private readonly transport: DiadocHttpTransport;
  private readonly operationMap: Map<string, OperationMetadata>;

  constructor(private readonly options: DiadocApiClientOptions) {
    this.baseUrl = options.baseUrl ?? 'https://diadoc-api.kontur.ru';
    this.transport = options.transport ?? new UndiciDiadocHttpTransport();
    this.operationMap = new Map(options.operations.map((operation) => [operation.operationId, operation]));
  }

  async request<T = unknown>(operationId: string, request: DiadocRequestOptions = {}): Promise<T> {
    const operation = this.operationMap.get(operationId);
    if (!operation) {
      throw new DiadocValidationError(`Unknown Diadoc operation: ${operationId}`);
    }

    const token = request.authToken ?? (await resolveAuthToken(this.options.authToken, { required: operation.requiresAuth }));
    const url = buildUrl(this.baseUrl, operation.path, request);
    const abort = new AbortController();
    const timeoutMs = this.options.timeoutMs ?? 30000;
    const timeout = setTimeout(() => abort.abort(), timeoutMs);

    const headers = mergeHeaders(
      this.options.defaultHeaders,
      token || !operation.requiresAuth
        ? { authorization: buildDiadocAuthHeader(this.options.apiClientId, token) }
        : undefined,
      request.headers,
    );

    try {
      const response = await runWithRetry(
        () =>
          this.transport.request<T>({
            method: operation.method,
            url,
            headers,
            body: request.body,
            responseType: request.responseType,
            operationId,
            signal: abort.signal,
          }),
        this.options.retry ?? DEFAULT_RETRY_OPTIONS,
      );

      return response.body;
    } catch (error) {
      if (abort.signal.aborted) {
        throw new DiadocTimeoutError(operationId, timeoutMs);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
```

- [ ] **Step 4: Export core client**

Modify `src/index.ts`:

```ts
export * from './core/diadoc-api-client';
export * from './core/diadoc-auth';
export * from './core/diadoc-error';
export * from './core/http-transport';
export * from './core/request-options';
export * from './core/retry-policy';
```

- [ ] **Step 5: Run tests to verify green**

Run:

```bash
npm test -- test/core/diadoc-api-client.test.ts
npm run typecheck
```

Expected: tests PASS and typecheck exits `0`.

- [ ] **Step 6: Commit core API client**

```bash
git add src/core/diadoc-api-client.ts test/core/diadoc-api-client.test.ts src/index.ts
git commit -m "feat: add diadoc api client core"
```

---

### Task 8: Generated Client Integration

**Files:**
- Create: `test/generated/generated-client.test.ts`
- Modify: `src/generated/client.ts`
- Modify: `src/generated/domain-clients.ts`

- [ ] **Step 1: Write failing integration tests for generated wrappers**

Create `test/generated/generated-client.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { GeneratedDiadocClient } from '../../src/generated/client';
import { GeneratedDocumentsDomainClient } from '../../src/generated/domain-clients';

describe('generated clients', () => {
  it('delegates exact operation ID calls to the core client', async () => {
    const core = { request: vi.fn().mockResolvedValue({ ok: true }) };
    const client = new GeneratedDiadocClient(core as any);

    await expect(client.GetDocumentV3({ query: { boxId: 'box-1' } })).resolves.toEqual({ ok: true });
    expect(core.request).toHaveBeenCalledWith('GetDocumentV3', { query: { boxId: 'box-1' } });
  });

  it('delegates domain camel aliases and raw calls to the generated client', async () => {
    const generated = {
      GetDocumentV3: vi.fn().mockResolvedValue({ document: true }),
    };
    const documents = new GeneratedDocumentsDomainClient(generated as any);

    await expect(documents.getDocumentV3({ query: { boxId: 'box-1' } })).resolves.toEqual({
      document: true,
    });
    await documents.raw.GetDocumentV3({ query: { boxId: 'box-2' } });

    expect(generated.GetDocumentV3).toHaveBeenCalledWith({ query: { boxId: 'box-1' } });
    expect(generated.GetDocumentV3).toHaveBeenCalledWith({ query: { boxId: 'box-2' } });
  });
});
```

- [ ] **Step 2: Run tests to verify generated code behavior**

Run:

```bash
npm test -- test/generated/generated-client.test.ts
```

Expected: PASS with `2` tests.

- [ ] **Step 3: Commit generated integration**

```bash
git add scripts/generate-client.ts src/generated test/generated/generated-client.test.ts
git commit -m "test: verify generated diadoc client wrappers"
```

---

### Task 9: NestJS Dynamic Module

**Files:**
- Create: `src/nest/diadoc.constants.ts`
- Create: `src/nest/diadoc.module-definition.ts`
- Create: `src/nest/diadoc.module.ts`
- Create: `test/nest/diadoc.module.test.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing Nest module tests**

Create `test/nest/diadoc.module.test.ts`:

```ts
import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { DiadocApiClient } from '../../src/core/diadoc-api-client';
import { DiadocModule } from '../../src/nest/diadoc.module';
import { DIADOC_MODULE_OPTIONS } from '../../src/nest/diadoc.constants';

@Injectable()
class ConfigFixture {
  getClientId(): string {
    return 'async-client';
  }
}

describe('DiadocModule', () => {
  it('registers DiadocApiClient with static options', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        DiadocModule.register({
          apiClientId: 'client',
          authToken: 'token',
          baseUrl: 'https://diadoc.test',
        }),
      ],
    }).compile();

    expect(moduleRef.get(DiadocApiClient)).toBeInstanceOf(DiadocApiClient);
    expect(moduleRef.get(DIADOC_MODULE_OPTIONS).apiClientId).toBe('client');
  });

  it('registers DiadocApiClient with async options', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ConfigFixture],
      imports: [
        DiadocModule.registerAsync({
          inject: [ConfigFixture],
          useFactory: (config: ConfigFixture) => ({
            apiClientId: config.getClientId(),
            baseUrl: 'https://diadoc.test',
          }),
        }),
      ],
    }).compile();

    expect(moduleRef.get(DIADOC_MODULE_OPTIONS).apiClientId).toBe('async-client');
    expect(moduleRef.get(DiadocApiClient)).toBeInstanceOf(DiadocApiClient);
  });
});
```

- [ ] **Step 2: Run tests to verify red**

Run:

```bash
npm test -- test/nest/diadoc.module.test.ts
```

Expected: FAIL because Nest module files do not exist.

- [ ] **Step 3: Implement Nest module constants and module definition**

Create `src/nest/diadoc.constants.ts`:

```ts
export const DIADOC_MODULE_OPTIONS = Symbol('DIADOC_MODULE_OPTIONS');
```

Create `src/nest/diadoc.module-definition.ts`:

```ts
import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { DiadocAuthTokenProvider } from '../core/diadoc-auth';
import type { DiadocRetryOptions } from '../core/retry-policy';

export interface DiadocModuleOptions {
  apiClientId: string;
  authToken?: DiadocAuthTokenProvider;
  baseUrl?: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
  retry?: DiadocRetryOptions;
}

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<DiadocModuleOptions>({
  moduleName: 'Diadoc',
})
  .setClassMethodName('register')
  .build();
```

- [ ] **Step 4: Implement DiadocModule providers**

Create `src/nest/diadoc.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { operations } from '../generated/operations';
import { DIADOC_MODULE_OPTIONS } from './diadoc.constants';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  type DiadocModuleOptions,
} from './diadoc.module-definition';

@Module({
  providers: [
    {
      provide: DIADOC_MODULE_OPTIONS,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (options: DiadocModuleOptions) => options,
    },
    {
      provide: DiadocApiClient,
      inject: [DIADOC_MODULE_OPTIONS],
      useFactory: (options: DiadocModuleOptions) =>
        new DiadocApiClient({
          ...options,
          operations,
        }),
    },
  ],
  exports: [DIADOC_MODULE_OPTIONS, DiadocApiClient],
})
export class DiadocModule extends ConfigurableModuleClass {}
```

- [ ] **Step 5: Export Nest module files**

Modify `src/index.ts`:

```ts
export * from './core/diadoc-api-client';
export * from './core/diadoc-auth';
export * from './core/diadoc-error';
export * from './core/http-transport';
export * from './core/request-options';
export * from './core/retry-policy';
export * from './nest/diadoc.constants';
export * from './nest/diadoc.module';
export * from './nest/diadoc.module-definition';
```

- [ ] **Step 6: Run tests to verify green**

Run:

```bash
npm test -- test/nest/diadoc.module.test.ts
npm run typecheck
```

Expected: tests PASS and typecheck exits `0`.

- [ ] **Step 7: Commit Nest module**

```bash
git add src/nest test/nest/diadoc.module.test.ts src/index.ts
git commit -m "feat: add nestjs diadoc module"
```

---

### Task 10: Domain Services And Aggregate DiadocService

**Files:**
- Create: `src/nest/diadoc.service.ts`
- Create: all files under `src/services/`
- Create: `test/services/diadoc.service.test.ts`
- Modify: `src/nest/diadoc.module.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing aggregate service tests**

Create `test/services/diadoc.service.test.ts`:

```ts
import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { DiadocApiClient } from '../../src/core/diadoc-api-client';
import { DiadocService } from '../../src/nest/diadoc.service';
import { DocumentsService } from '../../src/services/documents.service';
import { MessagesService } from '../../src/services/messages.service';
import { EventsService } from '../../src/services/events.service';

describe('DiadocService', () => {
  it('exposes domain services and delegates generated calls', async () => {
    const apiClient = {
      request: vi.fn().mockResolvedValue({ document: true }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DiadocService,
        DocumentsService,
        MessagesService,
        EventsService,
        { provide: DiadocApiClient, useValue: apiClient },
      ],
    }).compile();

    const service = moduleRef.get(DiadocService);
    expect(service.documents).toBeInstanceOf(DocumentsService);
    expect(service.messages).toBeInstanceOf(MessagesService);
    expect(service.events).toBeInstanceOf(EventsService);

    await expect(service.documents.getDocumentV3({ query: { boxId: 'box-1' } })).resolves.toEqual({
      document: true,
    });
    expect(apiClient.request).toHaveBeenCalledWith('GetDocumentV3', { query: { boxId: 'box-1' } });
  });
});
```

- [ ] **Step 2: Run tests to verify red**

Run:

```bash
npm test -- test/services/diadoc.service.test.ts
```

Expected: FAIL because service files do not exist.

- [ ] **Step 3: Implement domain services as generated-domain wrappers**

Create `src/services/documents.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedDocumentsDomainClient } from '../generated/domain-clients';

@Injectable()
export class DocumentsService extends GeneratedDocumentsDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/messages.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedMessagesDomainClient } from '../generated/domain-clients';

@Injectable()
export class MessagesService extends GeneratedMessagesDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/events.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedEventsDomainClient } from '../generated/domain-clients';

@Injectable()
export class EventsService extends GeneratedEventsDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/authorization.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedAuthorizationDomainClient } from '../generated/domain-clients';

@Injectable()
export class AuthorizationService extends GeneratedAuthorizationDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/counterparties.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedCounterpartiesDomainClient } from '../generated/domain-clients';

@Injectable()
export class CounterpartiesService extends GeneratedCounterpartiesDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/docflows.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedDocflowsDomainClient } from '../generated/domain-clients';

@Injectable()
export class DocflowsService extends GeneratedDocflowsDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/document-shelf.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedDocumentShelfDomainClient } from '../generated/domain-clients';

@Injectable()
export class DocumentShelfService extends GeneratedDocumentShelfDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/employees.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedEmployeesDomainClient } from '../generated/domain-clients';

@Injectable()
export class EmployeesService extends GeneratedEmployeesDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/generation.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedGenerationDomainClient } from '../generated/domain-clients';

@Injectable()
export class GenerationService extends GeneratedGenerationDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/operators.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedOperatorsDomainClient } from '../generated/domain-clients';

@Injectable()
export class OperatorsService extends GeneratedOperatorsDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/organizations.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedOrganizationsDomainClient } from '../generated/domain-clients';

@Injectable()
export class OrganizationsService extends GeneratedOrganizationsDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/power-of-attorney.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedPowerOfAttorneyDomainClient } from '../generated/domain-clients';

@Injectable()
export class PowerOfAttorneyService extends GeneratedPowerOfAttorneyDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/print-forms.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedPrintFormsDomainClient } from '../generated/domain-clients';

@Injectable()
export class PrintFormsService extends GeneratedPrintFormsDomainClient {
  constructor(apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
```

Create `src/services/signatures.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import {
  GeneratedSignaturesDomainClient,
  GeneratedSigningDomainClient,
} from '../generated/domain-clients';

@Injectable()
export class SignaturesService extends GeneratedSigningDomainClient {
  readonly digitalSignatures: GeneratedSignaturesDomainClient;

  constructor(apiClient: DiadocApiClient) {
    const generated = new GeneratedDiadocClient(apiClient);
    super(generated);
    this.digitalSignatures = new GeneratedSignaturesDomainClient(generated);
  }
}
```

- [ ] **Step 4: Implement aggregate service**

Create `src/nest/diadoc.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { AuthorizationService } from '../services/authorization.service';
import { CounterpartiesService } from '../services/counterparties.service';
import { DocflowsService } from '../services/docflows.service';
import { DocumentShelfService } from '../services/document-shelf.service';
import { DocumentsService } from '../services/documents.service';
import { EmployeesService } from '../services/employees.service';
import { EventsService } from '../services/events.service';
import { GenerationService } from '../services/generation.service';
import { MessagesService } from '../services/messages.service';
import { OperatorsService } from '../services/operators.service';
import { OrganizationsService } from '../services/organizations.service';
import { PowerOfAttorneyService } from '../services/power-of-attorney.service';
import { PrintFormsService } from '../services/print-forms.service';
import { SignaturesService } from '../services/signatures.service';

@Injectable()
export class DiadocService {
  constructor(
    readonly authorization: AuthorizationService,
    readonly counterparties: CounterpartiesService,
    readonly docflows: DocflowsService,
    readonly documentShelf: DocumentShelfService,
    readonly documents: DocumentsService,
    readonly employees: EmployeesService,
    readonly events: EventsService,
    readonly generation: GenerationService,
    readonly messages: MessagesService,
    readonly operators: OperatorsService,
    readonly organizations: OrganizationsService,
    readonly powerOfAttorney: PowerOfAttorneyService,
    readonly printForms: PrintFormsService,
    readonly signatures: SignaturesService,
  ) {}
}
```

- [ ] **Step 5: Register and export services from DiadocModule**

Modify `src/nest/diadoc.module.ts` to include all domain services and `DiadocService` in `providers` and `exports`:

```ts
const DOMAIN_SERVICES = [
  AuthorizationService,
  CounterpartiesService,
  DocflowsService,
  DocumentShelfService,
  DocumentsService,
  EmployeesService,
  EventsService,
  GenerationService,
  MessagesService,
  OperatorsService,
  OrganizationsService,
  PowerOfAttorneyService,
  PrintFormsService,
  SignaturesService,
  DiadocService,
];
```

Then spread `...DOMAIN_SERVICES` into the module providers and exports arrays.

- [ ] **Step 6: Export services**

Modify `src/index.ts`:

```ts
export * from './nest/diadoc.service';
export * from './services/authorization.service';
export * from './services/counterparties.service';
export * from './services/docflows.service';
export * from './services/document-shelf.service';
export * from './services/documents.service';
export * from './services/employees.service';
export * from './services/events.service';
export * from './services/generation.service';
export * from './services/messages.service';
export * from './services/operators.service';
export * from './services/organizations.service';
export * from './services/power-of-attorney.service';
export * from './services/print-forms.service';
export * from './services/signatures.service';
```

Keep the core and module exports from previous tasks.

- [ ] **Step 7: Run tests to verify green**

Run:

```bash
npm test -- test/services/diadoc.service.test.ts
npm run typecheck
```

Expected: tests PASS and typecheck exits `0`.

- [ ] **Step 8: Commit domain services**

```bash
git add src/services src/nest/diadoc.service.ts src/nest/diadoc.module.ts test/services/diadoc.service.test.ts src/index.ts
git commit -m "feat: add diadoc domain services"
```

---

### Task 11: Domain Coverage Tests

**Files:**
- Create: `test/services/domain-coverage.test.ts`
- Modify: `scripts/generate-client.ts`
- Modify: `src/generated/domain-clients.ts`

- [ ] **Step 1: Write failing or coverage-enforcing domain tests**

Create `test/services/domain-coverage.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { operations } from '../../src/generated/operations';
import * as domainClients from '../../src/generated/domain-clients';

const expectedDomainClasses = [
  'GeneratedAuthorizationDomainClient',
  'GeneratedCounterpartiesDomainClient',
  'GeneratedDocflowsDomainClient',
  'GeneratedDocumentShelfDomainClient',
  'GeneratedDocumentsDomainClient',
  'GeneratedEmployeesDomainClient',
  'GeneratedEventsDomainClient',
  'GeneratedGenerationDomainClient',
  'GeneratedMessagesDomainClient',
  'GeneratedOperatorsDomainClient',
  'GeneratedOrganizationsDomainClient',
  'GeneratedPowerOfAttorneyDomainClient',
  'GeneratedPrintFormsDomainClient',
  'GeneratedSignaturesDomainClient',
  'GeneratedSigningDomainClient',
] as const;

describe('domain coverage', () => {
  it('generates all expected domain client classes', () => {
    for (const className of expectedDomainClasses) {
      expect(domainClients[className]).toBeTypeOf('function');
    }
  });

  it('assigns every operation to a tagged domain', () => {
    const missingTag = operations.filter((operation) => !operation.tag);
    expect(missingTag).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests**

Run:

```bash
npm test -- test/services/domain-coverage.test.ts
```

Expected: PASS. If a generated class name differs, adjust `TAG_SERVICE_NAMES` in `scripts/generate-client.ts`, run `npm run generate`, and rerun this test.

- [ ] **Step 3: Commit coverage test**

```bash
git add test/services/domain-coverage.test.ts scripts/generate-client.ts src/generated
git commit -m "test: enforce generated domain coverage"
```

---

### Task 12: README And Usage Documentation

**Files:**
- Create: `README.md`
- Create: `test/readme.test.ts`

- [ ] **Step 1: Write failing README smoke test**

Create `test/readme.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('README', () => {
  it('documents install, module setup, auth, raw access, and domain services', () => {
    const readme = readFileSync('README.md', 'utf8');
    expect(readme).toContain('npm install diadoc-nestjs');
    expect(readme).toContain('DiadocModule.register');
    expect(readme).toContain('DiadocAuth');
    expect(readme).toContain('diadoc.documents.getDocumentV3');
    expect(readme).toContain('diadoc.messages.raw.PostMessageV3');
  });
});
```

- [ ] **Step 2: Run README test to verify red**

Run:

```bash
npm test -- test/readme.test.ts
```

Expected: FAIL because `README.md` does not exist.

- [ ] **Step 3: Create README**

Create `README.md`:

````md
# diadoc-nestjs

NestJS-ready TypeScript client for Diadoc API with full generated OpenAPI coverage and ergonomic domain services.

## Install

```bash
npm install diadoc-nestjs
```

## Register

```ts
import { Module } from '@nestjs/common';
import { DiadocModule } from 'diadoc-nestjs';

@Module({
  imports: [
    DiadocModule.register({
      apiClientId: process.env.DIADOC_API_CLIENT_ID!,
      authToken: process.env.DIADOC_AUTH_TOKEN,
      baseUrl: 'https://diadoc-api.kontur.ru',
      timeoutMs: 30000,
    }),
  ],
})
export class AppModule {}
```

## Async Register

```ts
DiadocModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    apiClientId: config.getOrThrow('DIADOC_API_CLIENT_ID'),
    authToken: () => config.getOrThrow('DIADOC_AUTH_TOKEN'),
  }),
});
```

## Auth

The library sends the official DiadocAuth header:

```text
Authorization: DiadocAuth ddauth_api_client_id=<clientId>, ddauth_token=<authToken>
```

Authentication endpoints can be called before an auth token is configured.

## Use Domain Services

```ts
import { Injectable } from '@nestjs/common';
import { DiadocService } from 'diadoc-nestjs';

@Injectable()
export class DocumentsFacade {
  constructor(private readonly diadoc: DiadocService) {}

  async getDocument(boxId: string, messageId: string, entityId: string) {
    return this.diadoc.documents.getDocumentV3({
      query: { boxId, messageId, entityId },
    });
  }

  async sendMessage(body: unknown) {
    return this.diadoc.messages.raw.PostMessageV3({ body });
  }
}
```

## Binary Content

```ts
const content = await diadoc.documents.getContent({
  query: { boxId, messageId, entityId },
  responseType: 'arrayBuffer',
});
```

## Full API Coverage

All operations from the local official OpenAPI document are generated into `GeneratedDiadocClient` and domain clients. Use exact operation IDs through `.raw` when you need a one-to-one Diadoc API call:

```ts
await diadoc.messages.raw.PostMessageV3({ body });
await diadoc.events.raw.GetNewEventsV8({ query: { boxId } });
```
````

- [ ] **Step 4: Run README test to verify green**

Run:

```bash
npm test -- test/readme.test.ts
```

Expected: PASS with `1` test.

- [ ] **Step 5: Commit README**

```bash
git add README.md test/readme.test.ts
git commit -m "docs: add usage documentation"
```

---

### Task 13: Public Exports And Package Verification

**Files:**
- Create: `test/public-api.test.ts`
- Modify: `src/index.ts`
- Modify: `package.json`

- [ ] **Step 1: Write public API test**

Create `test/public-api.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import * as api from '../src';

describe('public api', () => {
  it('exports core, Nest module, aggregate service, and domain services', () => {
    expect(api.DiadocApiClient).toBeTypeOf('function');
    expect(api.DiadocModule).toBeTypeOf('function');
    expect(api.DiadocService).toBeTypeOf('function');
    expect(api.DocumentsService).toBeTypeOf('function');
    expect(api.MessagesService).toBeTypeOf('function');
    expect(api.EventsService).toBeTypeOf('function');
    expect(api.DiadocHttpError).toBeTypeOf('function');
  });
});
```

- [ ] **Step 2: Run public API test**

Run:

```bash
npm test -- test/public-api.test.ts
```

Expected: PASS. If an export is missing, add it to `src/index.ts` and rerun.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run verify
```

Expected: lint, typecheck, tests, and build all exit `0`.

- [ ] **Step 4: Inspect package contents**

Run:

```bash
npm pack --dry-run
```

Expected package listing includes `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, `openapi/diadoc.openapi.json`, and `README.md`.

- [ ] **Step 5: Commit verification fixes**

```bash
git add src/index.ts package.json test/public-api.test.ts
git commit -m "chore: verify public package api"
```

---

### Task 14: Final Review

**Files:**
- Review all changed files.

- [ ] **Step 1: Check git status**

Run:

```bash
git status --short
```

Expected: no uncommitted changes after all previous task commits. If generated files changed during verification, commit them with the closest relevant task message.

- [ ] **Step 2: Run final verification**

Run:

```bash
npm run verify
```

Expected: all checks pass.

- [ ] **Step 3: Confirm OpenAPI coverage**

Run:

```bash
npm test -- test/generated/operation-coverage.test.ts test/services/domain-coverage.test.ts
```

Expected: all coverage tests pass.

- [ ] **Step 4: Prepare completion summary**

Summarize:

- Generated operation count from `openapi/diadoc.openapi.json`.
- Domain services exported by `DiadocService`.
- Verification commands and outcomes.
- Any real-Diadoc integration tests that were not run because credentials are not configured.
