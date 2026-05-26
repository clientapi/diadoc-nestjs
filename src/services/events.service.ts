import { Inject, Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedEventsDomainClient } from '../generated/domain-clients';

@Injectable()
export class EventsService extends GeneratedEventsDomainClient {
  constructor(@Inject(DiadocApiClient) apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
