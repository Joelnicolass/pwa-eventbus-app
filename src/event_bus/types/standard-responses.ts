// === RESPUESTAS ESTANDARIZADAS ===

/**
 * Respuesta base estandarizada para todos los eventos
 */
export interface StandardResponse<T = any> {
  /** El tipo de evento que generó esta respuesta */
  event: string;
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Datos de la respuesta (null si hay error) */
  data: T | null;
  /** Código de error específico (solo presente si success=false) */
  errorCode?: string;
  /** Mensaje de error legible (solo presente si success=false) */
  errorMessage?: string;
  /** Timestamp de cuando se generó la respuesta */
  timestamp: number;
}

/**
 * Respuesta exitosa estandarizada
 */
export interface SuccessResponse<T = any> extends StandardResponse<T> {
  success: true;
  data: T;
  errorCode?: never;
  errorMessage?: never;
}

/**
 * Respuesta de error estandarizada
 */
export interface ErrorResponse extends StandardResponse<null> {
  success: false;
  data: null;
  errorCode: string;
  errorMessage: string;
}

// === CÓDIGOS DE ERROR ESTANDARIZADOS ===
export enum ErrorCode {
  // Errores generales
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  OPERATION_FAILED = 'OPERATION_FAILED',

  // Errores de permisos
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PERMISSION_NOT_REQUESTED = 'PERMISSION_NOT_REQUESTED',

  // Errores de cámara
  CAMERA_NOT_AVAILABLE = 'CAMERA_NOT_AVAILABLE',
  CAMERA_PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',
  PHOTO_CAPTURE_FAILED = 'PHOTO_CAPTURE_FAILED',

  // Errores de geolocalización
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  LOCATION_SERVICE_DISABLED = 'LOCATION_SERVICE_DISABLED',
  LOCATION_TIMEOUT = 'LOCATION_TIMEOUT',
  LOCATION_UNAVAILABLE = 'LOCATION_UNAVAILABLE',

  // Errores de almacenamiento
  STORAGE_READ_FAILED = 'STORAGE_READ_FAILED',
  STORAGE_WRITE_FAILED = 'STORAGE_WRITE_FAILED',
  STORAGE_DELETE_FAILED = 'STORAGE_DELETE_FAILED',
  STORAGE_CLEAR_FAILED = 'STORAGE_CLEAR_FAILED',

  // Errores de HTTP
  HTTP_REQUEST_FAILED = 'HTTP_REQUEST_FAILED',
  HTTP_NETWORK_ERROR = 'HTTP_NETWORK_ERROR',
  HTTP_TIMEOUT = 'HTTP_TIMEOUT',
  HTTP_INVALID_URL = 'HTTP_INVALID_URL',
}

// === UTILIDADES PARA CREAR RESPUESTAS ===

/**
 * Crea una respuesta exitosa estandarizada
 */
export const createSuccessResponse = <T>(
  event: string,
  data: T,
): SuccessResponse<T> => ({
  event,
  success: true,
  data,
  timestamp: Date.now(),
});

/**
 * Crea una respuesta de error estandarizada
 */
export const createErrorResponse = (
  event: string,
  errorCode: ErrorCode,
  errorMessage: string,
): ErrorResponse => ({
  event,
  success: false,
  data: null,
  errorCode,
  errorMessage,
  timestamp: Date.now(),
});

/**
 * Crea una respuesta de error desde una excepción
 */
export const createErrorFromException = (
  event: string,
  error: unknown,
  defaultErrorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
): ErrorResponse => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return createErrorResponse(event, defaultErrorCode, errorMessage);
};
