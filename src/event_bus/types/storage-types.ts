import { EventTypes } from './event-types';

// === TIPOS DE ALMACENAMIENTO ===
export interface SetStorageRequest {
  key: string;
  value: string;
}

export interface GetStorageRequest {
  key: string;
  requestId: string;
}

export interface DeleteStorageRequest {
  key: string;
}

export interface ClearStorageRequest {
  // No requiere parámetros
}

export interface StorageSuccessResponse {
  success: boolean;
  error?: string;
}

export interface GetStorageResponse extends StorageSuccessResponse {
  requestId: string;
  value: string | null;
}

export interface SaveFileRequest {
  filename: string;
  data: string | ArrayBuffer;
  mimeType?: string;
  directory?: 'documents' | 'downloads' | 'cache';
}

// === INTERFACES PARA ALMACENAMIENTO ===
export interface StorageOutgoingPayloads {
  [EventTypes.SAVE_FILE]: SaveFileRequest;
}

export interface StorageIncomingPayloads {
  [EventTypes.SET_IN_LOCAL_STORAGE]: SetStorageRequest;
  [EventTypes.GET_FROM_LOCAL_STORAGE]: GetStorageRequest;
  [EventTypes.DELETE_FROM_LOCAL_STORAGE]: DeleteStorageRequest;
  [EventTypes.CLEAR_LOCAL_STORAGE]: ClearStorageRequest;
}

export interface StorageIncomingResponses {
  // No hay respuestas entrantes para storage
}

export interface StorageOutgoingResponses {
  [EventTypes.SET_IN_LOCAL_STORAGE]: StorageSuccessResponse;
  [EventTypes.GET_FROM_LOCAL_STORAGE]: GetStorageResponse;
  [EventTypes.DELETE_FROM_LOCAL_STORAGE]: StorageSuccessResponse;
  [EventTypes.CLEAR_LOCAL_STORAGE]: StorageSuccessResponse;
}
