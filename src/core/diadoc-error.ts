export class DiadocError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class DiadocAuthError extends DiadocError {}

export class DiadocValidationError extends DiadocError {}

export interface DiadocHttpErrorInput {
  message: string;
  status: number;
  url: string;
  operationId?: string;
  headers: Record<string, string>;
  body: unknown;
}

export class DiadocHttpError extends DiadocError {
  readonly status: number;
  readonly url: string;
  readonly operationId?: string;
  readonly headers: Record<string, string>;
  readonly body: unknown;

  constructor(input: DiadocHttpErrorInput) {
    super(input.message);
    this.status = input.status;
    this.url = input.url;
    this.operationId = input.operationId;
    this.headers = input.headers;
    this.body = input.body;
  }
}

export class DiadocTimeoutError extends DiadocError {
  constructor(
    readonly operationId: string,
    readonly timeoutMs: number,
  ) {
    super(`Diadoc operation ${operationId} timed out after ${timeoutMs} ms`);
  }
}
