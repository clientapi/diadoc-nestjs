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
  Авторизация: 'authorization',
  'Генерация и парсинг': 'generation',
  Документооборот: 'docflows',
  Документы: 'documents',
  'Контрагенты и группы контрагентов': 'counterparties',
  'Машиночитаемые доверенности': 'powerOfAttorney',
  'Операторы ЭДО': 'operators',
  'Организации, подразделения и ящики': 'organizations',
  'Печатные формы': 'printForms',
  'Подписание документов': 'signing',
  'Полка документов': 'documentShelf',
  События: 'events',
  Сообщения: 'messages',
  'Сотрудники и пользователи': 'employees',
  'Цифровые подписи': 'signatures',
};

export function toCamelMethodName(operationId: string): string {
  const pascalName = toPascalName(operationId);
  const camelName = pascalName ? pascalName.charAt(0).toLowerCase() + pascalName.slice(1) : '_';
  const identifier = /^[a-zA-Z_$]/.test(camelName) ? camelName : `_${camelName}`;
  return identifier === 'constructor' ? '_constructor' : identifier;
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

function stringLiteral(value: string): string {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function stringArrayLiteral(values: string[]): string {
  return `[${values.map(stringLiteral).join(', ')}]`;
}

function versionSuffixForPath(path: string): string | undefined {
  const versionSegment = path
    .split('/')
    .filter(Boolean)
    .find((segment) => /^v\d+$/i.test(segment));
  return versionSegment ? versionSegment.charAt(0).toUpperCase() + versionSegment.slice(1) : undefined;
}

interface OperationReference {
  path: string;
  method: string;
  operation: any;
  operationId: string;
}

function collectOperationReferences(document: any): OperationReference[] {
  const references: OperationReference[] = [];

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem as Record<string, any>)) {
      if (!METHODS.has(method)) {
        continue;
      }

      references.push({
        path,
        method,
        operation,
        operationId: String((operation as any).operationId),
      });
    }
  }

  return references;
}

function operationPathRank(path: string): number {
  const versionSuffix = versionSuffixForPath(path);
  return versionSuffix ? Number(versionSuffix.slice(1)) : 0;
}

function compareOperationReferences(a: OperationReference, b: OperationReference): number {
  return (
    operationPathRank(a.path) - operationPathRank(b.path) ||
    a.path.localeCompare(b.path) ||
    a.method.localeCompare(b.method)
  );
}

function uniqueOperationId(baseCandidate: string, operationId: string, seen: Set<string>): string {
  if (!seen.has(baseCandidate)) {
    seen.add(baseCandidate);
    return baseCandidate;
  }

  let index = 2;
  let candidate = `${operationId}${index}`;
  while (seen.has(candidate)) {
    index += 1;
    candidate = `${operationId}${index}`;
  }

  seen.add(candidate);
  return candidate;
}

function stableOperationIdForPath(operationId: string, path: string): string {
  const versionSuffix = versionSuffixForPath(path);
  return versionSuffix && !operationId.endsWith(versionSuffix) ? `${operationId}${versionSuffix}` : operationId;
}

function documentWithUniqueOperationIds(document: any): any {
  const normalized = JSON.parse(JSON.stringify(document));
  const references = collectOperationReferences(normalized);
  const groups = new Map<string, OperationReference[]>();

  for (const reference of references) {
    groups.set(reference.operationId, [...(groups.get(reference.operationId) ?? []), reference]);
  }

  const seen = new Set<string>();
  for (const [operationId, group] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (group.length === 1) {
      group[0].operation.operationId = uniqueOperationId(operationId, operationId, seen);
      continue;
    }

    for (const reference of [...group].sort(compareOperationReferences)) {
      const baseCandidate = stableOperationIdForPath(operationId, reference.path);
      reference.operation.operationId = uniqueOperationId(baseCandidate, operationId, seen);
    }
  }

  return normalized;
}

function operationLiteral(operation: OperationMetadata): string {
  return `  {
    operationId: ${stringLiteral(operation.operationId)},
    method: ${stringLiteral(operation.method)},
    path: ${stringLiteral(operation.path)},
    tag: ${stringLiteral(operation.tag)},
    requiresAuth: ${operation.requiresAuth},
    requestBodyContentTypes: ${stringArrayLiteral(operation.requestBodyContentTypes)},
    responseContentTypes: ${stringArrayLiteral(operation.responseContentTypes)},
  }`;
}

export function collectOperations(document: any): OperationMetadata[] {
  return collectOperationsFromDocument(documentWithUniqueOperationIds(document));
}

function collectOperationsFromDocument(document: any): OperationMetadata[] {
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
  return `import type { OperationMetadata } from '../core/request-options';

export const operations = [
${operations.map(operationLiteral).join(',\n')}
] as const satisfies readonly OperationMetadata[];

export type OperationId = typeof operations[number]['operationId'];
`;
}

export function generateClientSource(operations: OperationMetadata[]): string {
  const methods = operations
    .map(
      (operation) => `  async [${stringLiteral(operation.operationId)}](request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.core.request(${stringLiteral(operation.operationId)}, request);
  }`,
    )
    .join('\n\n');

  return `import type { DiadocRequestOptions } from '../core/request-options';

export type GeneratedOperationRequest = DiadocRequestOptions;

export interface GeneratedCoreClient {
  request<T = unknown>(operationId: string, request?: GeneratedOperationRequest): Promise<T>;
}

export class GeneratedDiadocClient {
  constructor(private readonly core: GeneratedCoreClient) {}

${methods}
}
`;
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
      const aliasNames = new Map<string, string>();
      for (const operation of serviceOperations) {
        const aliasName = toCamelMethodName(operation.operationId);
        const existingOperationId = aliasNames.get(aliasName);
        if (existingOperationId) {
          throw new Error(
            `Duplicate generated alias ${aliasName} for operation IDs ${existingOperationId} and ${operation.operationId} in ${className}`,
          );
        }
        aliasNames.set(aliasName, operation.operationId);
      }

      const rawEntries = serviceOperations
        .map(
          (operation) =>
            `    [${stringLiteral(operation.operationId)}]: (request?: GeneratedOperationRequest) => this.generated[${stringLiteral(operation.operationId)}](request),`,
        )
        .join('\n');
      const aliases = serviceOperations
        .map(
          (operation) => `  async ${toCamelMethodName(operation.operationId)}(request: GeneratedOperationRequest = {}): Promise<unknown> {
    return this.generated[${stringLiteral(operation.operationId)}](request);
  }`,
        )
        .join('\n\n');

      return `export class ${className} {
  readonly raw = {
${rawEntries}
  };

  constructor(private readonly generated: GeneratedDiadocClient) {}

${aliases}
}`;
    })
    .join('\n\n');

  return `import { GeneratedDiadocClient, type GeneratedOperationRequest } from './client';

${classes}
`;
}

async function writeGeneratedFile(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

export async function generateFromOpenApi(openApiPath: string, generatedDir: string): Promise<OperationMetadata[]> {
  const document = JSON.parse(await readFile(openApiPath, 'utf8'));
  const normalized = documentWithUniqueOperationIds(document);
  const operations = collectOperationsFromDocument(normalized);
  const schemaAst = await openapiTS(normalized);
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
