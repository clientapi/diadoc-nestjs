import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { DiadocAuthTokenProvider } from '../core/diadoc-auth';
import type { DiadocRetryOptions } from '../core/retry-policy';

export interface DiadocModuleOptions {
  apiClientId: string;
  authToken?: DiadocAuthTokenProvider;
  baseUrl?: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
  retry?: DiadocRetryOptions;
}

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<DiadocModuleOptions>({ moduleName: 'Diadoc' })
  .setClassMethodName('register')
  .build();
