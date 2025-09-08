// === EXPORTACIONES PRINCIPALES ===
export { EventTypes } from './event-types';
export type { GenericResponse } from './common-types';

// === EXPORTAR RESPUESTAS ESTANDARIZADAS ===
export type {
  StandardResponse,
  SuccessResponse,
  ErrorResponse,
} from './standard-responses';
export {
  ErrorCode,
  createSuccessResponse,
  createErrorResponse,
  createErrorFromException,
} from './standard-responses';

// === EXPORTAR TODAS LAS INTERFACES PRINCIPALES ===
export type {
  OutgoingEventPayloads,
  IncomingEventResponses,
  IncomingEventPayloads,
  OutgoingEventResponses,
} from './interfaces';

// === EXPORTAR TIPOS COMUNES ===
export type {
  InitializationEvent,
  NativeReadyEvent,
  InitializationResponse,
  VibrationRequest,
  ShareContentRequest,
  NotificationRequest,
} from './common-types';

// === EXPORTAR TIPOS ESPECIALIZADOS ===
export type {
  PermissionRequest,
  PermissionResponse,
  LocationPermissionRequest,
} from './permissions-types';

export type {
  TakePhotoRequest,
  TakePhotoResponse,
  CameraPhotoBase64Data,
  PhotoProcessedData,
  CameraActivatedData,
  TakePhotoDirectResponse,
} from './camera-types';

export type {
  LocationCoordinates,
  GetLocationRequest,
  LocationTrackingRequest,
  LocationData,
} from './geolocation-types';

export type {
  SetStorageRequest,
  GetStorageRequest,
  DeleteStorageRequest,
  ClearStorageRequest,
  GetStorageData,
  SaveFileRequest,
} from './storage-types';

export type { HttpRequestEvent, HttpResponseData } from './http-types';

export type { TestEventData } from './custom-types';
