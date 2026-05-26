import { Inject, Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedOrganizationsDomainClient } from '../generated/domain-clients';

@Injectable()
export class OrganizationsService extends GeneratedOrganizationsDomainClient {
  constructor(@Inject(DiadocApiClient) apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
