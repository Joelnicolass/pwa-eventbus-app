import { EventTypes } from './event-types';
import { StandardResponse } from './standard-responses';
import {
  GenericResponse,
  InitializationEvent,
  NativeReadyEvent,
  InitializationResponse,
  VibrationRequest,
  ShareContentRequest,
  NotificationRequest,
} from './common-types';

// Datos específicos para respuestas de eventos personalizados
export interface TestEventData {
  message: string;
  receivedData: any;
  processedAt: string;
}

// === INTERFACES PARA EVENTOS PERSONALIZADOS ===
export interface CustomOutgoingPayloads {
  [EventTypes.PWA_READY]: InitializationEvent;
  [EventTypes.NATIVE_READY]: NativeReadyEvent;
  [EventTypes.VIBRATE]: VibrationRequest;
  [EventTypes.SHARE_CONTENT]: ShareContentRequest;
  [EventTypes.SEND_LOCAL_NOTIFICATION]: NotificationRequest;
  [EventTypes.CUSTOM_EVENT]: GenericResponse;
  [EventTypes.PWA_CUSTOM_EVENT]: GenericResponse;
}

export interface CustomIncomingPayloads {
  [EventTypes.PWA_READY]: InitializationEvent;
  [EventTypes.NATIVE_READY]: NativeReadyEvent;
  [EventTypes.CUSTOM_EVENT]: GenericResponse;
  [EventTypes.PWA_CUSTOM_EVENT]: GenericResponse;
  [EventTypes.TEST]: GenericResponse;
}

export interface CustomIncomingResponses {
  [EventTypes.PWA_READY]: StandardResponse<InitializationResponse>;
  [EventTypes.NATIVE_READY]: StandardResponse<InitializationResponse>;
  [EventTypes.CUSTOM_EVENT]: StandardResponse<GenericResponse>;
  [EventTypes.PWA_CUSTOM_EVENT]: StandardResponse<GenericResponse>;
}

export interface CustomOutgoingResponses {
  [EventTypes.PWA_READY]: StandardResponse<InitializationResponse>;
  [EventTypes.NATIVE_READY]: StandardResponse<InitializationResponse>;
  [EventTypes.CUSTOM_EVENT]: StandardResponse<GenericResponse>;
  [EventTypes.PWA_CUSTOM_EVENT]: StandardResponse<GenericResponse>;
  [EventTypes.TEST]: StandardResponse<TestEventData>;
}
