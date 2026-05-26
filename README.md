# diadoc-nestjs

`diadoc-nestjs` - TypeScript-библиотека для интеграции NestJS-приложений с Diadoc API. Проект объединяет сгенерированное покрытие официального OpenAPI-описания Диадока, низкоуровневый HTTP-клиент и удобные NestJS-сервисы для типовых сценариев электронного документооборота.

Библиотека подходит для приложений, которым нужно работать с документами, сообщениями, событиями, контрагентами, организациями, подписями, МЧД, печатными формами и другими разделами Diadoc API, сохраняя при этом возможность вызвать любую исходную OpenAPI-операцию напрямую.

## Возможности

- NestJS dynamic module с методами `DiadocModule.register` и `DiadocModule.registerAsync`.
- Инжектируемый агрегирующий сервис `DiadocService` с доменными клиентами.
- Низкоуровневый `DiadocApiClient` для использования вне NestJS или для специальных интеграций.
- Сгенерированный клиент `GeneratedDiadocClient` с доступом ко всем операциям по точным `operationId`.
- 125 операций, сгенерированных из локального файла `openapi/diadoc.openapi.json`.
- Поддержка авторизации через заголовок `DiadocAuth`.
- Работа с query/path-параметрами, JSON-телами, бинарными телами, текстовыми и бинарными ответами.
- Таймауты, retry-политика и возможность подменить транспорт для тестов.
- Нормализованные ошибки: `DiadocAuthError`, `DiadocHttpError`, `DiadocTimeoutError`, `DiadocValidationError`.
- Скрипты для обновления OpenAPI-описания и регенерации клиента.

## Требования

- Node.js `>=20`.
- NestJS `^10.0.0` или `^11.0.0`.
- `rxjs` `^7.8.0`.
- TypeScript-проект с поддержкой ESM/CJS пакетов.

`@nestjs/common` и `rxjs` указаны как peer dependencies, поэтому в обычном NestJS-приложении они уже должны быть установлены.

## Установка

```bash
npm install diadoc-nestjs
```

Для локальной разработки самого пакета:

```bash
npm install
npm run verify
```

## Быстрый старт

Подключите модуль в корневом или интеграционном модуле NestJS:

```ts
import { Module } from '@nestjs/common';
import { DiadocModule } from 'diadoc-nestjs';

@Module({
  imports: [
    DiadocModule.register({
      apiClientId: process.env.DIADOC_API_CLIENT_ID ?? '',
      authToken: process.env.DIADOC_AUTH_TOKEN,
      timeoutMs: 30_000,
    }),
  ],
})
export class AppModule {}
```

После этого можно инжектировать `DiadocService` в свои сервисы:

```ts
import { Injectable } from '@nestjs/common';
import { DiadocService } from 'diadoc-nestjs';

@Injectable()
export class DocumentsFacade {
  constructor(private readonly diadoc: DiadocService) {}

  async getDocument(boxId: string, messageId: string, entityId: string) {
    return this.diadoc.documents.getDocumentV3({
      query: {
        boxId,
        messageId,
        entityId,
      },
    });
  }
}
```

## Конфигурация модуля

Если настройки известны при объявлении модуля, используйте `register`:

```ts
DiadocModule.register({
  apiClientId: process.env.DIADOC_API_CLIENT_ID ?? '',
  authToken: process.env.DIADOC_AUTH_TOKEN,
  baseUrl: 'https://diadoc-api.kontur.ru',
  timeoutMs: 30_000,
});
```

Если настройки приходят из другого провайдера, например из `@nestjs/config`, используйте `registerAsync`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiadocModule } from 'diadoc-nestjs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiadocModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        apiClientId: config.getOrThrow<string>('DIADOC_API_CLIENT_ID'),
        authToken: () => config.get<string>('DIADOC_AUTH_TOKEN'),
        timeoutMs: 30_000,
      }),
    }),
  ],
})
export class AppModule {}
```

Доступные параметры:

```ts
type DiadocModuleOptions = {
  apiClientId: string;
  authToken?: string | null | undefined | (() => string | null | undefined | Promise<string | null | undefined>);
  baseUrl?: string;
  timeoutMs?: number;
  defaultHeaders?: Record<string, string>;
  retry?: {
    retries?: number;
    retryDelayMs?: number;
    retryableStatuses?: readonly number[];
    retryableMethods?: readonly string[];
    retryOnNetworkError?: boolean;
  };
};
```

### Параметры

| Параметр | Описание |
| --- | --- |
| `apiClientId` | Идентификатор API-клиента Диадока. Используется в каждом `DiadocAuth` заголовке. |
| `authToken` | Статический токен или функция-провайдер токена. Может быть не задан для операций авторизации. |
| `baseUrl` | Базовый URL Diadoc API. По умолчанию используется `https://diadoc-api.kontur.ru`. |
| `timeoutMs` | Максимальное время выполнения операции в миллисекундах. |
| `defaultHeaders` | Заголовки, которые будут добавлены ко всем запросам. |
| `retry` | Настройки повторных попыток для временных ошибок и сетевых сбоев. |

## Авторизация

Запросы используют официальный формат заголовка `DiadocAuth`:

```text
Authorization: DiadocAuth ddauth_api_client_id=<client-id>, ddauth_token=<auth-token>
```

Если токен не передан, клиент сформирует заголовок только с `ddauth_api_client_id`. Это нужно для операций авторизации, которые должны быть доступны до получения пользовательского токена:

```text
Authorization: DiadocAuth ddauth_api_client_id=<client-id>
```

Операции, помеченные в OpenAPI как требующие авторизации, проверяют наличие токена до отправки HTTP-запроса. Если токена нет, будет выброшен `DiadocAuthError`.

Токен можно передать на уровне отдельного запроса:

```ts
await diadoc.documents.getDocumentV3({
  authToken: userToken,
  query: {
    boxId: 'box-id',
    messageId: 'message-id',
    entityId: 'entity-id',
  },
});
```

## Доменные сервисы

Основная точка входа для NestJS-приложений - `DiadocService`. Он группирует операции по областям Diadoc API:

| Свойство `DiadocService` | Назначение |
| --- | --- |
| `authorization` | Авторизация и получение токенов. |
| `documents` | Работа с документами и контентом сущностей. |
| `messages` | Создание и изменение сообщений, отправка пакетов документов. |
| `events` | Получение событий и новых событий по ящикам. |
| `counterparties` | Контрагенты и группы контрагентов. |
| `organizations` | Организации, подразделения и ящики. |
| `employees` | Сотрудники и пользователи. |
| `docflows` | Документообороты и статусы движения документов. |
| `documentShelf` | Полка документов. |
| `printForms` | Печатные формы. |
| `powerOfAttorney` | Машиночитаемые доверенности. |
| `operators` | Операторы ЭДО. |
| `generation` | Генерация и парсинг документов. |
| `signatures` | Подписание документов; также содержит `digitalSignatures` для операций цифровых подписей. |

Доменные методы используют camelCase-имена, полученные из OpenAPI `operationId`:

```ts
await diadoc.messages.postMessageV3({
  body: {
    FromBoxId: 'sender-box-id',
    ToBoxId: 'recipient-box-id',
    DocumentAttachments: [],
  },
});
```

## Raw-доступ к OpenAPI операциям

У каждого доменного клиента есть свойство `.raw`. Оно полезно, когда нужно вызвать операцию точно по имени из OpenAPI:

```ts
await diadoc.messages.raw.PostMessageV3({
  body: {
    FromBoxId: 'sender-box-id',
    ToBoxId: 'recipient-box-id',
    DocumentAttachments: [],
  },
});
```

То же самое можно делать через сгенерированный клиент:

```ts
import { DiadocApiClient, GeneratedDiadocClient, operations } from 'diadoc-nestjs';

const apiClient = new DiadocApiClient({
  apiClientId: process.env.DIADOC_API_CLIENT_ID ?? '',
  authToken: process.env.DIADOC_AUTH_TOKEN,
  operations,
});

const generated = new GeneratedDiadocClient(apiClient);

await generated.PostMessageV3({
  body: {
    FromBoxId: 'sender-box-id',
    ToBoxId: 'recipient-box-id',
    DocumentAttachments: [],
  },
});
```

Такой режим удобен для фоновых задач, CLI-утилит или сервисов, которые не используют NestJS DI-контейнер.

## Формат запроса

Все сгенерированные методы принимают объект `DiadocRequestOptions`:

```ts
type DiadocRequestOptions = {
  path?: Record<string, string | number | boolean>;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: unknown;
  responseType?: 'json' | 'text' | 'arrayBuffer';
  authToken?: string;
};
```

Пример с query-параметрами:

```ts
await diadoc.events.getNewEventsV8({
  query: {
    boxId: 'box-id',
    afterEventId: 'event-id',
  },
});
```

Пример с телом запроса:

```ts
await diadoc.messages.postMessagePatchV4({
  body: {
    BoxId: 'box-id',
    MessageId: 'message-id',
    DocumentPatches: [],
  },
});
```

Если `body` является обычным объектом, транспорт автоматически сериализует его в JSON и выставляет `content-type: application/json`, если этот заголовок не был задан вручную. Бинарные значения, потоки и другие поддерживаемые `undici` тела передаются без JSON-сериализации.

## Бинарные и текстовые ответы

Для эндпоинтов, которые возвращают файлы, контент документов, печатные формы или другие бинарные данные, укажите `responseType: 'arrayBuffer'`:

```ts
const content = await diadoc.documents.getEntityContentV4({
  query: {
    boxId: 'box-id',
    messageId: 'message-id',
    entityId: 'entity-id',
  },
  responseType: 'arrayBuffer',
});

const bytes = Buffer.from(content as ArrayBuffer);
```

Если `responseType` не указан, транспорт пытается выбрать тип по `content-type` ответа:

- JSON-ответы парсятся как объекты.
- `text/*` и XML-ответы возвращаются как строки.
- Остальные типы возвращаются как `ArrayBuffer`.

Ошибочные ответы всегда нормализуются в `DiadocHttpError`; тело ошибки сохраняется как JSON, строка или `null`.

## Ошибки

Все ошибки библиотеки наследуются от `DiadocError`.

| Класс | Когда возникает |
| --- | --- |
| `DiadocAuthError` | Для операции нужен auth token, но он не передан. |
| `DiadocValidationError` | Неизвестный `operationId` или некорректное клиентское состояние. |
| `DiadocHttpError` | Diadoc API вернул HTTP-статус вне диапазона `2xx`. |
| `DiadocTimeoutError` | Операция превысила заданный `timeoutMs`. |

`DiadocHttpError` сохраняет статус, URL, `operationId`, заголовки и тело ответа:

```ts
import { DiadocHttpError } from 'diadoc-nestjs';

try {
  await diadoc.documents.getDocumentV3({
    query: {
      boxId: 'box-id',
      messageId: 'message-id',
      entityId: 'entity-id',
    },
  });
} catch (error) {
  if (error instanceof DiadocHttpError) {
    console.error(error.status, error.operationId, error.body);
  }
}
```

## Таймауты и повторные попытки

`timeoutMs` ограничивает полное время выполнения операции. При превышении лимита запрос прерывается через `AbortController`, а вызывающий код получает `DiadocTimeoutError`.

Retry-политика по умолчанию:

- `retries: 2`
- `retryDelayMs: 250`
- повторяемые статусы: `408`, `429`, `500`, `502`, `503`, `504`
- повторяемые методы: `GET`, `HEAD`, `OPTIONS`
- сетевые ошибки `undici` и стандартные Node.js network errors повторяются только для разрешенных методов

Пример настройки:

```ts
DiadocModule.register({
  apiClientId: process.env.DIADOC_API_CLIENT_ID ?? '',
  authToken: process.env.DIADOC_AUTH_TOKEN,
  retry: {
    retries: 3,
    retryDelayMs: 500,
    retryableMethods: ['GET', 'POST'],
  },
});
```

## Архитектура проекта

```text
src/
  core/
    diadoc-api-client.ts     # маршрутизация operationId, auth, timeout, retry
    diadoc-auth.ts           # построение DiadocAuth заголовка
    diadoc-error.ts          # иерархия ошибок
    http-transport.ts        # undici transport и парсинг ответов
    request-options.ts       # URL, query, headers и типы запросов
    retry-policy.ts          # retry-механика
  generated/
    client.ts                # GeneratedDiadocClient
    domain-clients.ts        # сгенерированные доменные клиенты
    operations.ts            # метаданные операций
    types.ts                 # типы из OpenAPI
  nest/
    diadoc.module.ts         # NestJS module
    diadoc.service.ts        # агрегирующий сервис
  services/
    *.service.ts             # Injectable-обертки над domain clients
scripts/
  download-openapi.ts        # загрузка OpenAPI описания
  generate-client.ts         # генерация клиента и метаданных
test/
  core/
  generated/
  nest/
  scripts/
  services/
openapi/
  diadoc.openapi.json
```

Ручной код не зависит от конкретного количества операций. Метаданные операций генерируются из `openapi/diadoc.openapi.json`, а тесты проверяют, что сгенерированный клиент не разъехался с локальным OpenAPI-файлом.

## Обновление OpenAPI и генерация клиента

Чтобы скачать актуальное OpenAPI-описание Диадока:

```bash
npm run download:openapi
```

Чтобы пересобрать сгенерированные файлы:

```bash
npm run generate
```

После обновления OpenAPI рекомендуется выполнить полную проверку:

```bash
npm run verify
```

## Тестирование и сборка

Основные команды:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run verify
```

`npm run verify` последовательно запускает lint, typecheck, тесты и сборку.

Проверить состав npm-пакета перед публикацией можно так:

```bash
npm pack --dry-run
```

В пакет должны попадать:

- `dist`
- `openapi/diadoc.openapi.json`
- `README.md`


## Ограничения

- Библиотека не выполняет криптографическое подписание сама. Подписи, сертификаты и связанные бинарные данные должны быть подготовлены приложением или внешним криптопровайдером.
- Интеграционные тесты с реальным Diadoc API не входят в стандартный тестовый набор, потому что требуют действующих учетных данных.
- Сгенерированные файлы в `src/generated` не следует редактировать вручную. Изменения нужно вносить в генератор или OpenAPI-файл, затем запускать `npm run generate`.

## Лицензия

MIT.
