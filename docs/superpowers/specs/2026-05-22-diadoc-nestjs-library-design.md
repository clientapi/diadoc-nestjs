# Diadoc NestJS Library Design

## Context

The repository starts as an empty git project. The target is a reusable TypeScript npm library for NestJS applications that need complete access to Diadoc API capabilities for document exchange workflows.

The authoritative API source is the official Kontur developer OpenAPI document:

- API catalog: `https://developer.kontur.ru/api/documentations`
- Diadoc OpenAPI: `https://developer.kontur.ru/api/documentations/diadoc.api`
- Retrieved on: `2026-05-22`
- Version observed: `1.0.67005139-d9e126d1`
- Observed coverage: `123` paths, `125` operations, `483` schemas, `15` operation tags

The library must preserve full coverage of the official OpenAPI surface while offering a NestJS-friendly developer experience for common document workflows.

## Goals

Build a complete TypeScript library with:

- Full generated coverage for every operation and schema in the official Diadoc OpenAPI document.
- A NestJS dynamic module with `register()` and `registerAsync()` configuration.
- A low-level typed API client for direct access to all generated operations.
- Domain-oriented NestJS services that make document workflows ergonomic.
- Auth header construction for Diadoc's `DiadocAuth` scheme.
- Support for JSON, binary payloads, file downloads, multipart uploads, and request options used by Diadoc methods.
- Normalized errors that preserve Diadoc response data and HTTP metadata.
- Tests that verify auth, request construction, generated-client wrapping, NestJS module wiring, and domain service delegation.

## Non-Goals

This library will not implement cryptographic signing itself. It will accept externally produced signatures and certificate-related payloads as buffers or streams, because cryptographic provider integration is environment-specific.

This library will not manually rewrite all generated operation types. The OpenAPI file remains the source of truth for full method coverage.

This library will not require a running Diadoc account for unit tests. Tests will mock HTTP at the transport boundary.

## Architecture

Use a hybrid architecture:

1. Generated core from OpenAPI for complete coverage.
2. A stable hand-written HTTP transport layer.
3. A NestJS module and domain services on top of the generated core.

The generated core guarantees that every OpenAPI operation remains callable and typed. The hand-written layer handles practical concerns that generators do not model cleanly: `DiadocAuth`, binary bodies, downloads, retries, timeouts, request IDs, custom headers, and NestJS dependency injection.

The package exposes both low-level and high-level APIs:

```ts
import { DiadocModule, DiadocService, DiadocApiClient } from 'diadoc-nestjs';
```

Consumers who need exact API parity can inject `DiadocApiClient`. Consumers who want common workflows can inject `DiadocService` or narrower domain services.

## Package Layout

```text
src/
  index.ts
  generated/
    client.ts
    types.ts
    operations.ts
  core/
    diadoc-api-client.ts
    diadoc-auth.ts
    diadoc-error.ts
    http-transport.ts
    request-options.ts
    retry-policy.ts
  nest/
    diadoc.constants.ts
    diadoc.module-definition.ts
    diadoc.module.ts
    diadoc.service.ts
  services/
    authorization.service.ts
    documents.service.ts
    messages.service.ts
    events.service.ts
    signatures.service.ts
    organizations.service.ts
    counterparties.service.ts
    employees.service.ts
    document-shelf.service.ts
    print-forms.service.ts
    docflows.service.ts
    power-of-attorney.service.ts
    operators.service.ts
    generation.service.ts
  scripts/
    download-openapi.ts
    generate-client.ts
test/
  core/
  nest/
  services/
openapi/
  diadoc.openapi.json
```

Generated files are isolated under `src/generated/`. Manual code imports generated types but generated code does not import manual NestJS services.

## Public Configuration

The NestJS module uses standard dynamic module configuration:

```ts
DiadocModule.register({
  apiClientId: process.env.DIADOC_API_CLIENT_ID,
  authToken: process.env.DIADOC_AUTH_TOKEN,
  baseUrl: 'https://diadoc-api.kontur.ru',
  timeoutMs: 30000,
});
```

Async configuration is also supported:

```ts
DiadocModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    apiClientId: config.getOrThrow('DIADOC_API_CLIENT_ID'),
    authToken: config.get('DIADOC_AUTH_TOKEN'),
    baseUrl: config.get('DIADOC_BASE_URL') ?? 'https://diadoc-api.kontur.ru',
  }),
});
```

Configuration type:

```ts
export interface DiadocModuleOptions {
  apiClientId: string;
  authToken?: string | (() => string | Promise<string>);
  baseUrl?: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
  retry?: DiadocRetryOptions;
}
```

The default `baseUrl` is `https://diadoc-api.kontur.ru`. Test and staging hosts can be provided explicitly.

## Authentication

The library builds the official Diadoc auth header:

```text
Authorization: DiadocAuth ddauth_api_client_id=<clientId>, ddauth_token=<authToken>
```

The token is optional at module creation time because `/V3/Authenticate` and related auth endpoints must be callable before a user token exists. Operation calls that require a token fail early with a clear `DiadocAuthError` if no token provider is configured.

Token configuration accepts either a static string or an async provider function, allowing applications to rotate or fetch tokens from their own storage.

## Generated Core

The generation pipeline downloads the official OpenAPI file into `openapi/diadoc.openapi.json`, then produces:

- Operation parameter and response types.
- Schema types for all OpenAPI components.
- A typed operation map.
- A generated client wrapper that delegates every operation to `DiadocApiClient.request()`.

The generated client must expose all OpenAPI operations by `operationId`, including the currently observed `125` operations. A coverage test asserts that the generated operation count matches the downloaded OpenAPI document.

## HTTP Transport

The transport layer is based on `undici`, with a narrow internal interface:

```ts
export interface DiadocHttpTransport {
  request<T>(request: DiadocHttpRequest): Promise<DiadocHttpResponse<T>>;
}
```

Transport responsibilities:

- Resolve URL path and query parameters.
- Apply `Authorization` and default headers.
- Serialize JSON bodies.
- Pass binary bodies through without mutation.
- Support `Buffer`, `Uint8Array`, `Blob`, `FormData`, and `Readable` where Node supports them.
- Return binary downloads as `ArrayBuffer` or `Buffer`.
- Apply timeout and abort signals.
- Normalize non-2xx responses into `DiadocHttpError`.

## Domain Services

Domain services group the official API by the observed operation tags:

- `AuthorizationService`
- `DocumentsService`
- `MessagesService`
- `EventsService`
- `SignaturesService`
- `OrganizationsService`
- `CounterpartiesService`
- `EmployeesService`
- `DocumentShelfService`
- `PrintFormsService`
- `DocflowsService`
- `PowerOfAttorneyService`
- `OperatorsService`
- `GenerationService`

Each service provides readable methods for common workflows and also exposes a typed `raw` property for exact generated operations in that domain.

Example:

```ts
await diadoc.documents.getDocument({
  boxId,
  messageId,
  entityId,
});

await diadoc.messages.raw.PostMessagePatchV4(params, body);
```

The aggregate `DiadocService` exposes these services as properties:

```ts
diadoc.documents
diadoc.messages
diadoc.events
diadoc.counterparties
```

## Error Handling

Errors use a small class hierarchy:

- `DiadocError` for all library errors.
- `DiadocAuthError` for missing auth material.
- `DiadocHttpError` for HTTP failures.
- `DiadocTimeoutError` for timeout and abort failures.
- `DiadocValidationError` for invalid client-side inputs.

`DiadocHttpError` preserves:

- HTTP status.
- Response headers.
- Response body as text or binary.
- Diadoc request ID headers when present.
- Operation ID and request URL.

## Testing Strategy

Use TDD for implementation. Tests should be focused and layered:

- Auth header unit tests.
- URL/query/body construction tests.
- Binary body and binary response tests.
- Error normalization tests.
- Generated operation coverage test against `openapi/diadoc.openapi.json`.
- NestJS `register()` and `registerAsync()` provider wiring tests.
- Domain service delegation tests for representative methods in every domain service.

Integration tests against real Diadoc hosts remain optional and disabled by default. They require explicit environment variables and should never run in the default test command.

## Build And Tooling

Use a library-oriented TypeScript setup:

- `typescript` for compilation.
- `tsup` for ESM/CJS package output.
- `vitest` for tests.
- `eslint` and `prettier` for formatting and linting.
- `openapi-typescript` plus a small local generator for operation wrappers.

The package should emit type declarations and keep `@nestjs/common` as a peer dependency.

## Acceptance Criteria

The implementation is complete when:

- The package builds successfully.
- The official OpenAPI file is stored in `openapi/diadoc.openapi.json`.
- All observed OpenAPI operations are represented in generated code.
- `DiadocModule.register()` and `DiadocModule.registerAsync()` work in a NestJS testing module.
- `DiadocApiClient` can call any generated operation by operation ID.
- Domain services expose ergonomic methods and raw generated access.
- Auth headers match Diadoc's documented `DiadocAuth` format.
- Binary upload and download paths are supported by the transport.
- Unit tests pass without a real Diadoc account.
- Documentation shows installation, module setup, authentication, and common document workflows.

## Risks And Mitigations

OpenAPI generation may not perfectly model Diadoc binary/protobuf bodies. Mitigation: keep a manual request layer and map binary content types explicitly.

The official OpenAPI file can change. Mitigation: keep the download and generation scripts repeatable, and add a coverage test that fails when generated operations drift from the OpenAPI document.

Cryptographic workflows vary by deployment environment. Mitigation: accept signatures and certificate payloads as data, and document where the host application must integrate with its crypto provider.

NestJS versions differ across consumers. Mitigation: keep NestJS packages as peer dependencies and use standard dynamic module patterns.
