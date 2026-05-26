import { describe, expect, it } from 'vitest';

import { GeneratedDiadocClient, type GeneratedCoreClient } from '../../src/generated/client';
import * as domainClients from '../../src/generated/domain-clients';
import { operations } from '../../src/generated/operations';

const expectedDomainClientExports = [
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

const domainClientByTag = {
  Авторизация: 'GeneratedAuthorizationDomainClient',
  'Генерация и парсинг': 'GeneratedGenerationDomainClient',
  Документооборот: 'GeneratedDocflowsDomainClient',
  Документы: 'GeneratedDocumentsDomainClient',
  'Контрагенты и группы контрагентов': 'GeneratedCounterpartiesDomainClient',
  'Машиночитаемые доверенности': 'GeneratedPowerOfAttorneyDomainClient',
  'Операторы ЭДО': 'GeneratedOperatorsDomainClient',
  'Организации, подразделения и ящики': 'GeneratedOrganizationsDomainClient',
  'Печатные формы': 'GeneratedPrintFormsDomainClient',
  'Подписание документов': 'GeneratedSigningDomainClient',
  'Полка документов': 'GeneratedDocumentShelfDomainClient',
  Сообщения: 'GeneratedMessagesDomainClient',
  События: 'GeneratedEventsDomainClient',
  'Сотрудники и пользователи': 'GeneratedEmployeesDomainClient',
  'Цифровые подписи': 'GeneratedSignaturesDomainClient',
} as const;

type DomainClientExportName = (typeof expectedDomainClientExports)[number];

function makeGeneratedClient(): GeneratedDiadocClient {
  const core: GeneratedCoreClient = {
    async request<T = unknown>() {
      return undefined as T;
    },
  };

  return new GeneratedDiadocClient(core);
}

describe('generated domain coverage', () => {
  it('exports every expected generated domain client class', () => {
    for (const exportName of expectedDomainClientExports) {
      expect(domainClients[exportName]).toEqual(expect.any(Function));
    }
  });

  it('assigns every generated operation to a non-empty tag', () => {
    for (const operation of operations) {
      expect(typeof operation.tag === 'string' && operation.tag.trim().length > 0, operation.operationId).toBe(true);
    }
  });

  it('maps every operation tag to the expected generated domain client', () => {
    const generatedClient = makeGeneratedClient();
    const domainClientInstances = {} as Record<DomainClientExportName, { raw: Record<string, unknown> }>;

    for (const exportName of expectedDomainClientExports) {
      const DomainClient = domainClients[exportName];
      domainClientInstances[exportName] = new DomainClient(generatedClient);
    }

    for (const operation of operations) {
      const domainClientExport = domainClientByTag[operation.tag as keyof typeof domainClientByTag];

      expect(domainClientExport, operation.operationId).toBeDefined();
      expect(Object.hasOwn(domainClientInstances[domainClientExport].raw, operation.operationId), operation.operationId).toBe(
        true,
      );
    }
  });
});
