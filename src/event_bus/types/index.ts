// === EXPORTACIONES PRINCIPALES ===
export { EventTypes } from './event-types';
export type { GenericResponse } from './common-types';

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
} from './camera-types';

export type {
  LocationCoordinates,
  GetLocationRequest,
  LocationTrackingRequest,
  LocationResponse,
  LocationUpdateResponse,
} from './geolocation-types';

export type {
  SetStorageRequest,
  GetStorageRequest,
  DeleteStorageRequest,
  ClearStorageRequest,
  StorageSuccessResponse,
  GetStorageResponse,
  SaveFileRequest,
} from './storage-types';

export type { HttpRequestEvent, HttpResponse } from './http-types';
