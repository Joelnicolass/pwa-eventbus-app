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

// NUEVO: Interface simplificada para respuesta directa de TAKE_PHOTO
export interface TakePhotoDirectResponse extends CameraPhotoBase64Data {
  success: boolean;
  timestamp: number;
}

export interface CameraActivatedData {
  activated: boolean;
}

// === INTERFACES PARA CÁMARA SIMPLIFICADAS ===
export interface CameraOutgoingPayloads {
  [EventTypes.TAKE_PHOTO]: TakePhotoRequest;
  // Mantenemos los eventos de procesamiento para compatibilidad hacia atrás
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: CameraPhotoBase64Data;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: CameraPhotoBase64Data;
}

export interface CameraIncomingPayloads {
  [EventTypes.TAKE_PHOTO]: GenericResponse;
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: CameraPhotoBase64Data;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: CameraPhotoBase64Data;
}

export interface CameraIncomingResponses {
  // REFACTORIZADO: TAKE_PHOTO ahora retorna directamente los datos de la foto
  [EventTypes.TAKE_PHOTO]: StandardResponse<TakePhotoDirectResponse>;
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: StandardResponse<PhotoProcessedData>;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: StandardResponse<CameraPhotoBase64Data>;
}

export interface CameraOutgoingResponses {
  // REFACTORIZADO: TAKE_PHOTO ahora retorna directamente los datos de la foto
  [EventTypes.TAKE_PHOTO]: StandardResponse<TakePhotoDirectResponse>;
  [EventTypes.CAMERA_PHOTO_BASE64_PROCESS]: StandardResponse<PhotoProcessedData>;
  [EventTypes.CAMERA_PHOTO_BASE64_READY]: StandardResponse<CameraPhotoBase64Data>;
}
