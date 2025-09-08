import { EventTypes } from './event-types';

// === TIPOS DE PERMISOS ===
export interface PermissionRequest {
  reason?: string;
}

export interface PermissionResponse {
  granted: boolean;
  canAskAgain?: boolean;
}

// Tipos específicos para cada permiso
export interface LocationPermissionRequest extends PermissionRequest {
  enableHighAccuracy?: boolean;
}

// === INTERFACES PARA PERMISOS ===
export interface PermissionOutgoingPayloads {
  [EventTypes.CAMERA_PERMISSION_REQUEST]: PermissionRequest;
  [EventTypes.LOCATION_PERMISSION_REQUEST]: LocationPermissionRequest;
  [EventTypes.MICROPHONE_PERMISSION_REQUEST]: PermissionRequest;
  [EventTypes.STORAGE_PERMISSION_REQUEST]: PermissionRequest;
  [EventTypes.CONTACTS_PERMISSION_REQUEST]: PermissionRequest;
}

export interface PermissionIncomingPayloads {
  [EventTypes.CAMERA_PERMISSION_REQUEST]: PermissionRequest;
  [EventTypes.LOCATION_PERMISSION_REQUEST]: LocationPermissionRequest;
  [EventTypes.MICROPHONE_PERMISSION_REQUEST]: PermissionRequest;
  [EventTypes.STORAGE_PERMISSION_REQUEST]: PermissionRequest;
  [EventTypes.CONTACTS_PERMISSION_REQUEST]: PermissionRequest;
}

export interface PermissionIncomingResponses {
  [EventTypes.CAMERA_PERMISSION_REQUEST]: PermissionResponse;
  [EventTypes.LOCATION_PERMISSION_REQUEST]: PermissionResponse;
  [EventTypes.MICROPHONE_PERMISSION_REQUEST]: PermissionResponse;
  [EventTypes.STORAGE_PERMISSION_REQUEST]: PermissionResponse;
  [EventTypes.CONTACTS_PERMISSION_REQUEST]: PermissionResponse;
}

export interface PermissionOutgoingResponses {
  [EventTypes.CAMERA_PERMISSION_REQUEST]: PermissionResponse;
  [EventTypes.LOCATION_PERMISSION_REQUEST]: PermissionResponse;
  [EventTypes.MICROPHONE_PERMISSION_REQUEST]: PermissionResponse;
  [EventTypes.STORAGE_PERMISSION_REQUEST]: PermissionResponse;
  [EventTypes.CONTACTS_PERMISSION_REQUEST]: PermissionResponse;
}
