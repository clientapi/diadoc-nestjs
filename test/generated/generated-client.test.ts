import { describe, expect, it, vi } from 'vitest';

import {
  GeneratedDiadocClient,
  type GeneratedCoreClient,
  type GeneratedOperationRequest,
} from '../../src/generated/client';
import { GeneratedAuthorizationDomainClient } from '../../src/generated/domain-clients';

describe('GeneratedDiadocClient', () => {
  it('delegates exact operation ID calls to the core client', async () => {
    const response = { token: 'token-1' };
    const requestPayload: GeneratedOperationRequest = {
      query: { login: 'user' },
      headers: { Authorization: 'DiadocAuth ddauth_api_client_id=client' },
      body: { password: 'secret' },
    };
    const core: GeneratedCoreClient = {
      async request<T = unknown>(operationId: string, operationRequest?: GeneratedOperationRequest): Promise<T> {
        expect(operationId).toBe('AuthenticateV3');
        expect(operationRequest).toBe(requestPayload);
        return response as T;
      },
    };
    const request = vi.spyOn(core, 'request');
    const client = new GeneratedDiadocClient(core);

    await expect(client['AuthenticateV3'](requestPayload)).resolves.toBe(response);

    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith('AuthenticateV3', requestPayload);
  });
});

describe('generated domain clients', () => {
  it('delegates camel aliases and raw exact calls to the generated client', async () => {
    const request = vi.fn(
      async <T = unknown>(operationId: string, request?: GeneratedOperationRequest): Promise<T> =>
        ({
          operationId,
          request,
        }) as T,
    );
    const core = {
      request: request as GeneratedCoreClient['request'],
    };
    const generated = new GeneratedDiadocClient(core);
    const authenticateV3 = vi.spyOn(generated, 'AuthenticateV3');
    const domain = new GeneratedAuthorizationDomainClient(generated);
    const aliasRequest: GeneratedOperationRequest = { body: { login: 'alias' } };
    const rawRequest: GeneratedOperationRequest = { body: { login: 'raw' } };

    await expect(domain.authenticateV3(aliasRequest)).resolves.toEqual({
      operationId: 'AuthenticateV3',
      request: aliasRequest,
    });
    await expect(domain.raw['AuthenticateV3'](rawRequest)).resolves.toEqual({
      operationId: 'AuthenticateV3',
      request: rawRequest,
    });

    expect(authenticateV3).toHaveBeenNthCalledWith(1, aliasRequest);
    expect(authenticateV3).toHaveBeenNthCalledWith(2, rawRequest);
    expect(request).toHaveBeenNthCalledWith(1, 'AuthenticateV3', aliasRequest);
    expect(request).toHaveBeenNthCalledWith(2, 'AuthenticateV3', rawRequest);
  });
});
