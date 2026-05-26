import { describe, expect, it } from 'vitest';
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';
import fixture from '../fixtures/minimal-openapi.json';
import {
  collectOperations,
  generateClientSource,
  generateDomainClientsSource,
  generateOperationsSource,
  toCamelMethodName,
  toPascalName,
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

  it('converts service names to PascalCase class fragments', () => {
    expect(toPascalName('documentShelf')).toBe('DocumentShelf');
    expect(toPascalName('power-of-attorney')).toBe('PowerOfAttorney');
  });

  it('suffixes duplicate operation IDs with a path version when available', () => {
    expect(
      collectOperations({
        paths: {
          '/UpdateEmployeePowerOfAttorney': {
            post: {
              tags: ['Машиночитаемые доверенности'],
              operationId: 'UpdateEmployeePowerOfAttorney',
              responses: {},
            },
          },
          '/V2/UpdateEmployeePowerOfAttorney': {
            post: {
              tags: ['Машиночитаемые доверенности'],
              operationId: 'UpdateEmployeePowerOfAttorney',
              responses: {},
            },
          },
        },
      }).map((operation) => operation.operationId),
    ).toEqual(['UpdateEmployeePowerOfAttorney', 'UpdateEmployeePowerOfAttorneyV2']);
  });

  it('suffixes duplicate operation IDs by path version regardless of path order', () => {
    expect(
      collectOperations({
        paths: {
          '/V2/UpdateEmployeePowerOfAttorney': {
            post: {
              tags: ['Машиночитаемые доверенности'],
              operationId: 'UpdateEmployeePowerOfAttorney',
              responses: {},
            },
          },
          '/UpdateEmployeePowerOfAttorney': {
            post: {
              tags: ['Машиночитаемые доверенности'],
              operationId: 'UpdateEmployeePowerOfAttorney',
              responses: {},
            },
          },
        },
      }).map((operation) => operation.operationId),
    ).toEqual(['UpdateEmployeePowerOfAttorney', 'UpdateEmployeePowerOfAttorneyV2']);
  });

  it('generates operation metadata source', () => {
    const source = generateOperationsSource(collectOperations(fixture));
    expect(source).toContain("operationId: 'Ping'");
    expect(source).toContain("path: '/Ping'");
  });

  it('generates a client method that delegates by operation ID', () => {
    const source = generateClientSource(collectOperations(fixture));
    expect(source).toContain("async ['Ping'](");
    expect(source).toContain("return this.core.request('Ping', request);");
  });

  it('generates a domain client with camel alias and raw operation access', () => {
    const source = generateDomainClientsSource(collectOperations(fixture));
    expect(source).toContain('export class GeneratedDocumentsDomainClient');
    expect(source).toContain('async ping(');
    expect(source).toContain('readonly raw');
  });

  it('generates valid source for operation IDs that are not TypeScript identifiers', () => {
    const operations = collectOperations({
      paths: {
        '/hostile': {
          get: {
            tags: ['Документы'],
            operationId: '1-Bad.Name',
            responses: {},
          },
        },
      },
    });
    const clientSource = generateClientSource(operations);
    const domainSource = generateDomainClientsSource(operations);

    expect(clientSource).toContain("async ['1-Bad.Name'](");
    expect(domainSource).toContain(
      "['1-Bad.Name']: (request?: GeneratedOperationRequest) => this.generated['1-Bad.Name'](request)",
    );
    expect(domainSource).toContain('async _1BadName(');

    for (const source of [clientSource, domainSource]) {
      const diagnostics = transpileModule(source, {
        compilerOptions: { module: ModuleKind.ESNext, target: ScriptTarget.ES2022 },
        reportDiagnostics: true,
      }).diagnostics;
      expect(diagnostics).toEqual([]);
    }
  });

  it('fails when sanitized alias names collide within a domain client', () => {
    const operations = collectOperations({
      paths: {
        '/dot': {
          get: {
            tags: ['Документы'],
            operationId: 'Get.Foo',
            responses: {},
          },
        },
        '/dash': {
          get: {
            tags: ['Документы'],
            operationId: 'Get-Foo',
            responses: {},
          },
        },
      },
    });

    expect(() => generateDomainClientsSource(operations)).toThrow(/Duplicate generated alias/);
  });
});
