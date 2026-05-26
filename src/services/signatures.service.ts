import { Inject, Injectable } from '@nestjs/common';
import { DiadocApiClient } from '../core/diadoc-api-client';
import { GeneratedDiadocClient } from '../generated/client';
import {
  GeneratedSignaturesDomainClient,
  GeneratedSigningDomainClient,
} from '../generated/domain-clients';

@Injectable()
export class SignaturesService extends GeneratedSigningDomainClient {
  readonly digitalSignatures: GeneratedSignaturesDomainClient;

  constructor(@Inject(DiadocApiClient) apiClient: DiadocApiClient) {
    const generated = new GeneratedDiadocClient(apiClient);

    super(generated);
    this.digitalSignatures = new GeneratedSignaturesDomainClient(generated);
  }
}
