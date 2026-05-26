import { DiadocAuthError } from './diadoc-error';

export type DiadocAuthTokenProvider =
  | string
  | null
  | undefined
  | (() => string | null | undefined | Promise<string | null | undefined>);

export interface ResolveAuthTokenOptions {
  required?: boolean;
}

export function buildDiadocAuthHeader(apiClientId: string, authToken?: string): string {
  if (!authToken) {
    return `DiadocAuth ddauth_api_client_id=${apiClientId}`;
  }

  return `DiadocAuth ddauth_api_client_id=${apiClientId}, ddauth_token=${authToken}`;
}

export async function resolveAuthToken(
  provider: DiadocAuthTokenProvider,
  options: ResolveAuthTokenOptions = {},
): Promise<string | undefined> {
  const token = typeof provider === 'function' ? await provider() : provider;

  if (!token && options.required) {
    throw new DiadocAuthError('Diadoc auth token is required for this operation');
  }

  return token ?? undefined;
}
