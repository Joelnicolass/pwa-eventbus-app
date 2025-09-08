import { EventTypes } from './event-types';
import { StandardResponse } from './standard-responses';
import { GenericResponse } from './common-types';

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

// Datos específicos para respuestas de cámara
export interface PhotoProcessedData {
  message: string;
  processed: boolean;
}

export interface CameraActivatedData {
  activated: boolean;
}

// === INTERFACES PARA CÁMARA ===
export interface CameraOutgoingPayloads {
  [EventTypes.TAKE_PHOTO]: TakePhotoRequest;
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: CameraPhotoBase64Data;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: CameraPhotoBase64Data;
}

export interface CameraIncomingPayloads {
  [EventTypes.TAKE_PHOTO]: GenericResponse;
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: CameraPhotoBase64Data;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: CameraPhotoBase64Data;
}

export interface CameraIncomingResponses {
  [EventTypes.TAKE_PHOTO]: StandardResponse<CameraActivatedData>;
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: StandardResponse<PhotoProcessedData>;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: StandardResponse<CameraPhotoBase64Data>;
}

export interface CameraOutgoingResponses {
  [EventTypes.TAKE_PHOTO]: StandardResponse<CameraActivatedData>;
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: StandardResponse<PhotoProcessedData>;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: StandardResponse<CameraPhotoBase64Data>;
}
