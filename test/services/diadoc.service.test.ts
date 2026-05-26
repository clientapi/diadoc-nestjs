import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { DiadocApiClient } from '../../src/core/diadoc-api-client';
import { DiadocService } from '../../src/nest/diadoc.service';
import { AuthorizationService } from '../../src/services/authorization.service';
import { CounterpartiesService } from '../../src/services/counterparties.service';
import { DocflowsService } from '../../src/services/docflows.service';
import { DocumentShelfService } from '../../src/services/document-shelf.service';
import { DocumentsService } from '../../src/services/documents.service';
import { EmployeesService } from '../../src/services/employees.service';
import { EventsService } from '../../src/services/events.service';
import { GenerationService } from '../../src/services/generation.service';
import { MessagesService } from '../../src/services/messages.service';
import { OperatorsService } from '../../src/services/operators.service';
import { OrganizationsService } from '../../src/services/organizations.service';
import { PowerOfAttorneyService } from '../../src/services/power-of-attorney.service';
import { PrintFormsService } from '../../src/services/print-forms.service';
import { SignaturesService } from '../../src/services/signatures.service';

type MockDiadocApiClient = Pick<DiadocApiClient, 'request'>;

describe('DiadocService', () => {
  it('exposes domain services and delegates generated calls through DiadocApiClient', async () => {
    const apiClient: MockDiadocApiClient = {
      request: vi.fn().mockResolvedValue({ documentId: 'doc-1' }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DiadocService,
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
        { provide: DiadocApiClient, useValue: apiClient },
      ],
    }).compile();

    const service = moduleRef.get(DiadocService);
    const request = { query: { boxId: 'box-1' } };

    expect(service.documents).toBeInstanceOf(DocumentsService);
    expect(service.events).toBeInstanceOf(EventsService);
    expect(service.messages).toBeInstanceOf(MessagesService);

    await expect(service.documents.getDocumentV3(request)).resolves.toEqual({
      documentId: 'doc-1',
    });
    expect(apiClient.request).toHaveBeenCalledWith('GetDocumentV3', request);
  });
});
