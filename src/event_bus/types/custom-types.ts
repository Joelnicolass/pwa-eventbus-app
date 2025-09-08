import { EventTypes } from './event-types';
import {
  GenericResponse,
  InitializationEvent,
  NativeReadyEvent,
  InitializationResponse,
  VibrationRequest,
  ShareContentRequest,
  NotificationRequest,
} from './common-types';

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
  [EventTypes.PWA_READY]: InitializationResponse;
  [EventTypes.NATIVE_READY]: InitializationResponse;
  [EventTypes.CUSTOM_EVENT]: GenericResponse;
  [EventTypes.PWA_CUSTOM_EVENT]: GenericResponse;
}

export interface CustomOutgoingResponses {
  [EventTypes.PWA_READY]: InitializationResponse;
  [EventTypes.NATIVE_READY]: InitializationResponse;
  [EventTypes.CUSTOM_EVENT]: GenericResponse;
  [EventTypes.PWA_CUSTOM_EVENT]: GenericResponse;
  [EventTypes.TEST]: void;
}
