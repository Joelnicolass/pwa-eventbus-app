export enum StatusCode {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

export const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_RESPONSE_TYPE = 'json';
