import { Module } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { operations } from '../generated/operations';
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
import { DIADOC_MODULE_OPTIONS } from './diadoc.constants';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  type DiadocModuleOptions,
} from './diadoc.module-definition';
import { DiadocService } from './diadoc.service';

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

@Module({
  providers: [
    {
      provide: DIADOC_MODULE_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN,
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
    ...DOMAIN_SERVICES,
  ],
  exports: [DIADOC_MODULE_OPTIONS, DiadocApiClient, ...DOMAIN_SERVICES],
})
export class DiadocModule extends ConfigurableModuleClass {}

export type { DiadocModuleOptions } from './diadoc.module-definition';
