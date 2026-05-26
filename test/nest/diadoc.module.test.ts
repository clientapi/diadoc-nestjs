import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { DiadocApiClient } from '../../src/core/diadoc-api-client';
import { DIADOC_MODULE_OPTIONS } from '../../src/nest/diadoc.constants';
import { DiadocModule, type DiadocModuleOptions } from '../../src/nest/diadoc.module';

describe('DiadocModule', () => {
  it('registers static module options and DiadocApiClient', async () => {
    const options = {
      apiClientId: 'static-client',
      authToken: 'static-token',
      baseUrl: 'https://diadoc.example.test',
    } satisfies DiadocModuleOptions;

    const moduleRef = await Test.createTestingModule({
      imports: [DiadocModule.register(options)],
    }).compile();

    expect(moduleRef.get(DIADOC_MODULE_OPTIONS)).toBe(options);
    expect(moduleRef.get(DiadocApiClient)).toBeInstanceOf(DiadocApiClient);
  });

  it('registers async module options and DiadocApiClient using injected dependencies', async () => {
    const fixture = {
      apiClientId: 'async-client',
      authToken: 'async-token',
      baseUrl: 'https://async-diadoc.example.test',
    } satisfies DiadocModuleOptions;

    @Module({
      providers: [{ provide: 'DIADOC_OPTIONS_FIXTURE', useValue: fixture }],
      exports: ['DIADOC_OPTIONS_FIXTURE'],
    })
    class FixtureModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [
        DiadocModule.registerAsync({
          imports: [FixtureModule],
          inject: ['DIADOC_OPTIONS_FIXTURE'],
          useFactory: (injectedOptions: DiadocModuleOptions) => injectedOptions,
        }),
      ],
    }).compile();

    expect(moduleRef.get(DIADOC_MODULE_OPTIONS)).toBe(fixture);
    expect(moduleRef.get(DiadocApiClient)).toBeInstanceOf(DiadocApiClient);
  });
});
