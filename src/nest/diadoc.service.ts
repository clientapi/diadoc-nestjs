import { Inject, Injectable } from '@nestjs/common';
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
    @Inject(AuthorizationService) readonly authorization: AuthorizationService,
    @Inject(CounterpartiesService) readonly counterparties: CounterpartiesService,
    @Inject(DocflowsService) readonly docflows: DocflowsService,
    @Inject(DocumentShelfService) readonly documentShelf: DocumentShelfService,
    @Inject(DocumentsService) readonly documents: DocumentsService,
    @Inject(EmployeesService) readonly employees: EmployeesService,
    @Inject(EventsService) readonly events: EventsService,
    @Inject(GenerationService) readonly generation: GenerationService,
    @Inject(MessagesService) readonly messages: MessagesService,
    @Inject(OperatorsService) readonly operators: OperatorsService,
    @Inject(OrganizationsService) readonly organizations: OrganizationsService,
    @Inject(PowerOfAttorneyService) readonly powerOfAttorney: PowerOfAttorneyService,
    @Inject(PrintFormsService) readonly printForms: PrintFormsService,
    @Inject(SignaturesService) readonly signatures: SignaturesService,
  ) {}
}
