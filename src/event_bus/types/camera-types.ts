import { EventTypes } from './event-types';

// === TIPOS DE CÁMARA ===
export interface TakePhotoRequest {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowEditing?: boolean;
  cameraType?: 'front' | 'back';
}

export interface TakePhotoResponse {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
}

export interface CameraPhotoBase64Data {
  base64: string;
  width: number;
  height: number;
}

// === INTERFACES PARA CÁMARA ===
export interface CameraOutgoingPayloads {
  [EventTypes.TAKE_PHOTO]: TakePhotoRequest;
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: CameraPhotoBase64Data;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: CameraPhotoBase64Data;
}

export interface CameraIncomingPayloads {
  [EventTypes.TAKE_PHOTO]: any; // GenericResponse
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: CameraPhotoBase64Data;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: CameraPhotoBase64Data;
}

export interface CameraIncomingResponses {
  [EventTypes.TAKE_PHOTO]: TakePhotoResponse;
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: void;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: CameraPhotoBase64Data;
}

export interface CameraOutgoingResponses {
  [EventTypes.TAKE_PHOTO]: any; // GenericResponse
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: any; // GenericResponse | void | null
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: CameraPhotoBase64Data;
}
