import { Inject, Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import { GeneratedPrintFormsDomainClient } from '../generated/domain-clients';

@Injectable()
export class PrintFormsService extends GeneratedPrintFormsDomainClient {
  constructor(@Inject(DiadocApiClient) apiClient: DiadocApiClient) {
    super(new GeneratedDiadocClient(apiClient));
  }
}
