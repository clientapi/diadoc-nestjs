import { Inject, Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedDocflowsDomainClient } from '../generated/domain-clients';

@Injectable()
export class DocflowsService extends GeneratedDocflowsDomainClient {
  constructor(@Inject(DiadocApiClient) apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
