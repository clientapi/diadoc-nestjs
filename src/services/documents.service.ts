import { Inject, Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedDocumentsDomainClient } from '../generated/domain-clients';

@Injectable()
export class DocumentsService extends GeneratedDocumentsDomainClient {
  constructor(@Inject(DiadocApiClient) apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
