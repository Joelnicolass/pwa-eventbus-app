export enum StatusCode {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

export const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_RESPONSE_TYPE = 'json';

// === CONSTANTES DE GEOLOCALIZACIÓN ===
export const DEFAULT_GEOLOCATION_TIMEOUT = 15000;
export const DEFAULT_MAXIMUM_AGE = 300000; // 5 minutos
export const DEFAULT_DISTANCE_FILTER = 10; // 10 metros
export const DEFAULT_LOCATION_INTERVAL = 5000; // 5 segundos
