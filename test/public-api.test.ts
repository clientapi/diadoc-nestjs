import { describe, expect, it } from 'vitest';

import * as api from '../src';

describe('public API', () => {
  it('exports core client, Nest module, services, and errors', () => {
    expect(api.DiadocApiClient).toEqual(expect.any(Function));
    expect(api.DiadocModule).toEqual(expect.any(Function));
    expect(api.DiadocService).toEqual(expect.any(Function));
    expect(api.DocumentsService).toEqual(expect.any(Function));
    expect(api.MessagesService).toEqual(expect.any(Function));
    expect(api.EventsService).toEqual(expect.any(Function));
    expect(api.DiadocHttpError).toEqual(expect.any(Function));
  });

  it('exports generated client helpers and additional public services', () => {
    expect(api.GeneratedDiadocClient).toEqual(expect.any(Function));
    expect(api.operations).toEqual(expect.any(Array));
    expect(api.DiadocAuthError).toEqual(expect.any(Function));
    expect(api.DIADOC_MODULE_OPTIONS).toBeTypeOf('symbol');
    expect(api.OrganizationsService).toEqual(expect.any(Function));
    expect(api.PowerOfAttorneyService).toEqual(expect.any(Function));
  });

  it('keeps Nest module builder internals out of the root runtime API', () => {
    expect(api).not.toHaveProperty('MODULE_OPTIONS_TOKEN');
    expect(api).not.toHaveProperty('ConfigurableModuleClass');
    expect(api).not.toHaveProperty('ASYNC_OPTIONS_TYPE');
    expect(api).not.toHaveProperty('OPTIONS_TYPE');
    expect(api.DIADOC_MODULE_OPTIONS).toBeTypeOf('symbol');
  });
});
