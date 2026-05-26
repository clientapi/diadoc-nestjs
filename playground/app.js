/* global document, fetch, localStorage, location, window */

const state = {
  operations: [],
  organizations: [],
  counteragents: [],
  counteragentMeta: {},
  busy: false,
};

const els = {
  apiClientId: document.querySelector('#apiClientId'),
  authToken: document.querySelector('#authToken'),
  authScheme: document.querySelector('#authScheme'),
  baseUrlPreset: document.querySelector('#baseUrlPreset'),
  baseUrl: document.querySelector('#baseUrl'),
  timeoutMs: document.querySelector('#timeoutMs'),
  envStatus: document.querySelector('#envStatus'),
  statusLine: document.querySelector('#statusLine'),
  responseLog: document.querySelector('#responseLog'),
  clearLog: document.querySelector('#clearLog'),
  inviteFromBoxId: document.querySelector('#inviteFromBoxId'),
  inviteToBoxId: document.querySelector('#inviteToBoxId'),
  inviteComment: document.querySelector('#inviteComment'),
  oidcClientId: document.querySelector('#oidcClientId'),
  oidcClientSecret: document.querySelector('#oidcClientSecret'),
  oidcScope: document.querySelector('#oidcScope'),
  oidcRedirectUri: document.querySelector('#oidcRedirectUri'),
  legacyLogin: document.querySelector('#legacyLogin'),
  legacyPassword: document.querySelector('#legacyPassword'),
  orgAutoRegister: document.querySelector('#orgAutoRegister'),
  orgSearch: document.querySelector('#orgSearch'),
  orgSummary: document.querySelector('#orgSummary'),
  orgTableBody: document.querySelector('#orgTableBody'),
  counteragentMyBoxId: document.querySelector('#counteragentMyBoxId'),
  counteragentQuery: document.querySelector('#counteragentQuery'),
  counteragentStatus: document.querySelector('#counteragentStatus'),
  counteragentPageSize: document.querySelector('#counteragentPageSize'),
  counteragentAfterIndexKey: document.querySelector('#counteragentAfterIndexKey'),
  counteragentSummary: document.querySelector('#counteragentSummary'),
  counteragentTableBody: document.querySelector('#counteragentTableBody'),
  messageBody: document.querySelector('#messageBody'),
  rawOperation: document.querySelector('#rawOperation'),
  rawResponseType: document.querySelector('#rawResponseType'),
  rawPath: document.querySelector('#rawPath'),
  rawQuery: document.querySelector('#rawQuery'),
  rawHeaders: document.querySelector('#rawHeaders'),
  rawBody: document.querySelector('#rawBody'),
};

const messageTemplate = {
  FromBoxId: '',
  ToBoxId: '',
  DocumentAttachments: [
    {
      SignedContent: {
        Content: '<base64 document bytes>',
      },
      TypeNamedId: 'UniversalTransferDocument',
      Function: 'СЧФДОП',
      Version: 'utd820_05_01_01_hyphen',
      TitleType: 0,
      Metadata: [
        { Key: 'FileName', Value: 'document.xml' },
      ],
    },
  ],
};

function configPayload() {
  return {
    apiClientId: els.apiClientId.value,
    authToken: els.authToken.value,
    authScheme: els.authScheme.value,
    baseUrl: els.baseUrl.value,
    timeoutMs: Number(els.timeoutMs.value || 30000),
  };
}

function parseJsonField(element, fallback, label) {
  const value = element.value.trim();

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

async function callDiadoc(payload) {
  if (state.busy) {
    return;
  }

  setBusy(true);
  setStatus('Выполняю запрос...', 'pending');

  const startedAt = Date.now();

  try {
    const response = await fetch('/api/call', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        config: configPayload(),
        ...payload,
      }),
    });
    const data = await response.json();
    const elapsedMs = Date.now() - startedAt;

    appendLog({
      timestamp: new Date().toISOString(),
      httpStatus: response.status,
      elapsedMs,
      request: payload,
      response: data,
    });

    if (!response.ok || data.ok === false) {
      setStatus(`Ошибка: ${data.error?.message ?? response.statusText}`, 'error');
      return data;
    }

    setStatus(`Готово: ${payload.operationId} за ${data.elapsedMs ?? elapsedMs} ms`, 'ok');
    return data;
  } catch (error) {
    appendLog({
      timestamp: new Date().toISOString(),
      request: payload,
      error: {
        name: error.name,
        message: error.message,
      },
    });
    setStatus(`Ошибка: ${error.message}`, 'error');
    return undefined;
  } finally {
    setBusy(false);
  }
}

async function authenticatePassword() {
  if (state.busy) {
    return;
  }

  setBusy(true);
  setStatus('Получаю DiadocAuth token...', 'pending');

  try {
    const response = await fetch('/api/authenticate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        config: configPayload(),
        login: els.legacyLogin.value,
        password: els.legacyPassword.value,
      }),
    });
    const data = await response.json();

    appendLog({
      timestamp: new Date().toISOString(),
      httpStatus: response.status,
      request: { operationId: 'AuthenticateV3' },
      response: maskTokenFields(data),
    });

    if (!response.ok || data.ok === false) {
      setStatus(`Ошибка авторизации: ${data.error?.message ?? response.statusText}`, 'error');
      return;
    }

    els.authScheme.value = 'diadocAuth';
    els.authToken.value = data.authToken;
    els.legacyPassword.value = '';
    setStatus(`DiadocAuth token получен за ${data.elapsedMs} ms`, 'ok');
  } catch (error) {
    setStatus(`Ошибка авторизации: ${error.message}`, 'error');
  } finally {
    setBusy(false);
  }
}

async function startOidc() {
  if (state.busy) {
    return;
  }

  setBusy(true);
  setStatus('Готовлю OpenID AuthorizationCode...', 'pending');

  try {
    const response = await fetch('/api/oidc/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        config: configPayload(),
        clientId: els.oidcClientId.value,
        clientSecret: els.oidcClientSecret.value,
        scope: els.oidcScope.value,
        redirectUri: els.oidcRedirectUri.value,
      }),
    });
    const data = await response.json();

    appendLog({
      timestamp: new Date().toISOString(),
      httpStatus: response.status,
      request: { operationId: 'OpenID AuthorizationCode', redirectUri: els.oidcRedirectUri.value },
      response: data.ok ? { ok: true, redirectUri: data.redirectUri } : data,
    });

    if (!response.ok || data.ok === false) {
      setStatus(`Ошибка OpenID: ${data.error?.message ?? response.statusText}`, 'error');
      setBusy(false);
      return;
    }

    window.location.href = data.authorizeUrl;
  } catch (error) {
    setStatus(`Ошибка OpenID: ${error.message}`, 'error');
    setBusy(false);
  }
}

function appendLog(entry) {
  const current = els.responseLog.textContent.trim();
  const next = JSON.stringify(entry, null, 2);
  els.responseLog.textContent = current ? `${next}\n\n${current}` : next;
}

function maskTokenFields(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const masked = { ...value };
  for (const key of ['authToken', 'access_token', 'refresh_token', 'id_token']) {
    if (typeof masked[key] === 'string') {
      masked[key] = `${masked[key].slice(0, 12)}...`;
    }
  }
  return masked;
}

function setStatus(text, kind) {
  els.statusLine.textContent = text;
  els.statusLine.classList.toggle('ok', kind === 'ok');
  els.statusLine.classList.toggle('error', kind === 'error');
}

function setBusy(isBusy) {
  state.busy = isBusy;
  for (const button of document.querySelectorAll('button[data-action]')) {
    button.disabled = isBusy;
  }
}

async function loadOrganizations() {
  const data = await callDiadoc({
    operationId: 'GetMyOrganizations',
    query: {
      autoRegister: els.orgAutoRegister.checked,
    },
  });

  if (!data?.ok) {
    state.organizations = [];
    renderOrganizations();
    return;
  }

  state.organizations = normalizeOrganizations(data.result?.value);
  renderOrganizations();
}

function normalizeOrganizations(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.Organizations)) {
    return value.Organizations;
  }

  return [];
}

function renderOrganizations() {
  const query = els.orgSearch.value.trim().toLowerCase();
  const filtered = state.organizations.filter((organization) => organizationMatches(organization, query));

  els.orgSummary.textContent = state.organizations.length
    ? `Загружено организаций: ${state.organizations.length}. Показано: ${filtered.length}.`
    : 'Организации не загружены или ответ пустой';
  els.orgTableBody.textContent = '';

  if (filtered.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'empty-cell';
    cell.textContent = state.organizations.length ? 'По фильтру ничего не найдено' : 'Нажмите “Загрузить список”';
    row.append(cell);
    els.orgTableBody.append(row);
    return;
  }

  for (const organization of filtered) {
    els.orgTableBody.append(createOrganizationRow(organization));
  }
}

async function loadCounteragents() {
  let query;

  try {
    query = buildCounteragentQuery();
  } catch (error) {
    setStatus(`Ошибка формы: ${error.message}`, 'error');
    els.counteragentSummary.textContent = error.message;
    return;
  }

  const data = await callDiadoc({
    operationId: 'GetCounteragentsV3',
    query,
  });

  if (!data?.ok) {
    state.counteragents = [];
    state.counteragentMeta = { loaded: true };
    renderCounteragents();
    return;
  }

  const value = data.result?.value;
  state.counteragents = normalizeCounteragents(value);
  state.counteragentMeta = {
    loaded: true,
    totalCount: value?.TotalCount,
    totalCountType: value?.TotalCountType,
    pageSize: query.pageSize,
  };
  renderCounteragents();
}

async function loadNextCounteragents() {
  const indexKey = nextCounteragentIndexKey();

  if (!indexKey) {
    setStatus('Нет IndexKey для следующей страницы', 'error');
    els.counteragentSummary.textContent = 'Сначала выполните поиск и получите страницу с IndexKey.';
    return;
  }

  els.counteragentAfterIndexKey.value = indexKey;
  els.counteragentQuery.value = '';
  await loadCounteragents();
}

function buildCounteragentQuery() {
  const myBoxId = els.counteragentMyBoxId.value.trim();
  const searchQuery = els.counteragentQuery.value.trim();
  const afterIndexKey = els.counteragentAfterIndexKey.value.trim();
  const pageSizeText = els.counteragentPageSize.value.trim() || '100';
  const pageSize = Number(pageSizeText);

  if (!myBoxId) {
    throw new Error('Укажите MyBoxId своей организации');
  }

  if (searchQuery && afterIndexKey) {
    throw new Error('Для GetCounteragentsV3 нельзя одновременно указывать Поиск и AfterIndexKey');
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error('Page size должен быть целым числом от 1 до 100');
  }

  const query = {
    myBoxId,
    pageSize,
  };

  if (els.counteragentStatus.value) {
    query.counteragentStatus = els.counteragentStatus.value;
  }

  if (searchQuery) {
    query.query = searchQuery;
  }

  if (afterIndexKey) {
    query.afterIndexKey = afterIndexKey;
  }

  return query;
}

function normalizeCounteragents(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.Counteragents)) {
    return value.Counteragents;
  }

  return [];
}

function renderCounteragents() {
  const totalCount = state.counteragentMeta.totalCount;
  const totalCountText = Number.isFinite(totalCount) ? ` Всего: ${totalCount}.` : '';
  const totalCountTypeText = state.counteragentMeta.totalCountType
    ? ` Тип подсчета: ${state.counteragentMeta.totalCountType}.`
    : '';

  els.counteragentSummary.textContent = state.counteragentMeta.loaded
    ? `Показано контрагентов: ${state.counteragents.length}.${totalCountText}${totalCountTypeText}`
    : 'Поиск еще не выполнялся';
  els.counteragentTableBody.textContent = '';

  if (state.counteragents.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'empty-cell';
    cell.textContent = state.counteragentMeta.loaded
      ? 'Контрагенты не найдены или ответ пустой'
      : 'Заполните MyBoxId и нажмите “Найти”';
    row.append(cell);
    els.counteragentTableBody.append(row);
    return;
  }

  for (const counteragent of state.counteragents) {
    els.counteragentTableBody.append(createCounteragentRow(counteragent));
  }
}

function createCounteragentRow(counteragent) {
  const organization = counteragent.Organization ?? {};
  const box = firstBox(organization);
  const row = document.createElement('tr');

  row.append(
    createCell((cell) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'org-name';
      const title = document.createElement('strong');
      title.textContent = organization.ShortName || organization.FullName || 'Без названия';
      const subtitle = document.createElement('span');
      subtitle.className = 'muted';
      subtitle.textContent = organization.FullName && organization.FullName !== title.textContent
        ? organization.FullName
        : organization.FnsParticipantId || '';
      wrapper.append(title, subtitle);
      cell.append(wrapper);
    }),
    createTextCell(`${textOrDash(organization.Inn)} / ${textOrDash(organization.Kpp)}`),
    createTextCell(box?.BoxIdGuid || box?.BoxId || '-', 'mono'),
    createTextCell(organization.OrgId || '-', 'mono'),
    createCell((cell) => {
      cell.append(createChipRow([counteragentStatusChip(counteragent.CurrentStatus)]));
    }),
    createTextCell(counteragent.IndexKey || '-', 'mono'),
    createTextCell(counteragentComment(counteragent)),
  );

  return row;
}

function counteragentStatusChip(status) {
  return {
    label: status || '-',
    ok: status === 'IsMyCounteragent',
  };
}

function counteragentComment(counteragent) {
  return [
    counteragent.LastEventComment,
    counteragent.MessageFromCounteragent,
    counteragent.MessageToCounteragent,
  ]
    .filter(Boolean)
    .join('\n') || '-';
}

function nextCounteragentIndexKey() {
  for (let index = state.counteragents.length - 1; index >= 0; index -= 1) {
    if (state.counteragents[index]?.IndexKey) {
      return state.counteragents[index].IndexKey;
    }
  }

  return undefined;
}

function organizationMatches(organization, query) {
  if (!query) {
    return true;
  }

  return [
    organization.ShortName,
    organization.FullName,
    organization.Inn,
    organization.Kpp,
    organization.OrgId,
    organization.FnsParticipantId,
    firstBox(organization)?.BoxId,
    firstBox(organization)?.BoxIdGuid,
    firstBox(organization)?.Title,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
}

function createOrganizationRow(organization) {
  const box = firstBox(organization);
  const row = document.createElement('tr');

  row.append(
    createCell((cell) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'org-name';
      const title = document.createElement('strong');
      title.textContent = organization.ShortName || organization.FullName || 'Без названия';
      const subtitle = document.createElement('span');
      subtitle.className = 'muted';
      subtitle.textContent = organization.FullName && organization.FullName !== title.textContent
        ? organization.FullName
        : organization.FnsParticipantId || '';
      wrapper.append(title, subtitle);
      cell.append(wrapper);
    }),
    createTextCell(`${textOrDash(organization.Inn)} / ${textOrDash(organization.Kpp)}`),
    createTextCell(box?.BoxIdGuid || box?.BoxId || '-', 'mono'),
    createTextCell(organization.OrgId || '-', 'mono'),
    createCell((cell) => {
      cell.append(createChipRow(statusChips(organization)));
    }),
    createCell((cell) => {
      cell.append(createChipRow(permissionChips(organization)));
    }),
  );

  return row;
}

function createCell(fill) {
  const cell = document.createElement('td');
  fill(cell);
  return cell;
}

function createTextCell(text, className) {
  return createCell((cell) => {
    cell.textContent = text;
    if (className) {
      cell.className = className;
    }
  });
}

function firstBox(organization) {
  return Array.isArray(organization?.Boxes) ? organization.Boxes[0] : undefined;
}

function textOrDash(value) {
  return value ? String(value) : '-';
}

function createChipRow(chips) {
  const row = document.createElement('div');
  row.className = 'chip-row';

  for (const chip of chips.length ? chips : [{ label: '-', ok: false }]) {
    const span = document.createElement('span');
    span.className = chip.ok ? 'chip ok' : 'chip';
    span.textContent = chip.label;
    row.append(span);
  }

  return row;
}

function statusChips(organization) {
  const chips = [];
  if (organization.IsActive) chips.push({ label: 'active', ok: true });
  if (organization.IsEmployee) chips.push({ label: 'employee', ok: true });
  if (organization.IsTest) chips.push({ label: 'test', ok: false });
  if (organization.IsPilot) chips.push({ label: 'pilot', ok: false });
  if (organization.IsRoaming) chips.push({ label: 'roaming', ok: false });
  if (organization.JoinedDiadocTreaty) chips.push({ label: 'treaty', ok: true });
  return chips;
}

function permissionChips(organization) {
  const permissions = organization.OrganizationUserPermissions ?? organization.CurrentUserPermissions ?? {};
  const chips = [];
  if (permissions.IsAdministrator) chips.push({ label: 'admin', ok: true });
  if (permissions.CanSendDocuments) chips.push({ label: 'send', ok: true });
  if (permissions.CanSignDocuments) chips.push({ label: 'sign', ok: true });
  if (permissions.CanCreateDocuments) chips.push({ label: 'create', ok: true });
  if (permissions.CanManageCounteragents) chips.push({ label: 'counteragents', ok: true });
  return chips;
}

function activateTab(name) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('is-active', tab.dataset.tab === name);
  }

  for (const panel of document.querySelectorAll('.action-panel')) {
    panel.classList.toggle('is-active', panel.id === `tab-${name}`);
  }
}

function syncBaseUrlPreset() {
  if (els.baseUrlPreset.value !== 'custom') {
    els.baseUrl.value = els.baseUrlPreset.value;
  }
}

function fillRawOperationOptions(operations) {
  els.rawOperation.innerHTML = '';

  for (const operation of operations) {
    const option = document.createElement('option');
    option.value = operation.operationId;
    option.textContent = `${operation.operationId} - ${operation.method} ${operation.path}`;
    els.rawOperation.append(option);
  }

  const postMessage = operations.find((operation) => operation.operationId === 'PostMessageV3');
  if (postMessage) {
    els.rawOperation.value = postMessage.operationId;
  }
}

async function loadConfig() {
  const response = await fetch('/api/config');
  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error?.message ?? 'Failed to load config');
  }

  state.operations = data.operations;
  fillRawOperationOptions(data.operations);
  els.oidcClientId.value = data.config.oidcClientId ?? '';
  els.oidcRedirectUri.value = `${location.origin}/api/oidc/callback`;

  els.baseUrl.value = data.config.baseUrl;
  els.baseUrlPreset.value = ['https://diadoc-api.kontur.ru', 'https://diadoc-api.testkontur.ru'].includes(
    data.config.baseUrl,
  )
    ? data.config.baseUrl
    : 'custom';

  const envParts = [];
  envParts.push(data.config.hasApiClientId ? 'API Client ID найден в .env' : 'API Client ID не найден');
  envParts.push(data.config.hasAuthToken ? 'Auth token найден в .env' : 'Auth token не найден');
  envParts.push(data.config.hasOidcClientSecret ? 'OpenID secret найден в .env' : 'OpenID secret не найден');
  envParts.push(`${data.operations.length} операций доступно`);
  els.envStatus.textContent = envParts.join(' · ');

  applyStoredOidcResult();
}

function wireEvents() {
  document.querySelector('.tabs').addEventListener('click', (event) => {
    const button = event.target.closest('.tab');
    if (button) {
      activateTab(button.dataset.tab);
    }
  });

  els.baseUrlPreset.addEventListener('change', syncBaseUrlPreset);
  els.clearLog.addEventListener('click', () => {
    els.responseLog.textContent = '';
    setStatus('Журнал очищен', 'pending');
  });
  els.orgSearch.addEventListener('input', renderOrganizations);

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    try {
      if (button.dataset.action === 'checkConnection') {
        await callDiadoc({
          operationId: 'GetMyOrganizations',
        });
      }

      if (button.dataset.action === 'loadOrganizations') {
        await loadOrganizations();
      }

      if (button.dataset.action === 'loadCounteragents') {
        await loadCounteragents();
      }

      if (button.dataset.action === 'loadNextCounteragents') {
        await loadNextCounteragents();
      }

      if (button.dataset.action === 'authenticatePassword') {
        await authenticatePassword();
      }

      if (button.dataset.action === 'startOidc') {
        await startOidc();
      }

      if (button.dataset.action === 'invite') {
        await callDiadoc({
          operationId: 'AcquireCounteragentV3',
          body: {
            FromBoxId: els.inviteFromBoxId.value,
            ToBoxId: els.inviteToBoxId.value,
            Comment: els.inviteComment.value,
          },
        });
      }

      if (button.dataset.action === 'sendMessage') {
        await callDiadoc({
          operationId: 'PostMessageV3',
          body: parseJsonField(els.messageBody, {}, 'Request body'),
        });
      }

      if (button.dataset.action === 'rawCall') {
        await callDiadoc({
          operationId: els.rawOperation.value,
          path: parseJsonField(els.rawPath, {}, 'Path JSON'),
          query: parseJsonField(els.rawQuery, {}, 'Query JSON'),
          headers: parseJsonField(els.rawHeaders, {}, 'Headers JSON'),
          body: parseJsonField(els.rawBody, undefined, 'Body JSON'),
          responseType: els.rawResponseType.value || undefined,
        });
      }
    } catch (error) {
      setStatus(`Ошибка формы: ${error.message}`, 'error');
    }
  });
}

function applyStoredOidcResult() {
  const raw = localStorage.getItem('diadocPlaygroundOidcResult');
  if (!raw) {
    return;
  }

  localStorage.removeItem('diadocPlaygroundOidcResult');

  try {
    const result = JSON.parse(raw);
    appendLog({
      timestamp: new Date().toISOString(),
      request: { operationId: 'OpenID callback' },
      response: maskTokenFields(result.token ?? result),
    });

    if (!result.ok) {
      setStatus(`Ошибка OpenID: ${result.error}`, 'error');
      return;
    }

    const accessToken = result.token?.access_token;
    if (!accessToken) {
      setStatus('OpenID вернул ответ без access_token', 'error');
      return;
    }

    els.authScheme.value = 'bearer';
    els.authToken.value = accessToken;
    setStatus('Bearer access_token получен и подставлен в форму', 'ok');
  } catch (error) {
    setStatus(`Ошибка чтения OpenID callback: ${error.message}`, 'error');
  }
}

els.messageBody.value = JSON.stringify(messageTemplate, null, 2);
wireEvents();
loadConfig().catch((error) => {
  els.envStatus.textContent = `Ошибка конфигурации: ${error.message}`;
  setStatus(`Ошибка конфигурации: ${error.message}`, 'error');
});
