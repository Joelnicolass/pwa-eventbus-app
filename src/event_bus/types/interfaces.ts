import {
  PermissionOutgoingPayloads,
  PermissionIncomingPayloads,
  PermissionIncomingResponses,
  PermissionOutgoingResponses,
} from './permissions-types';
import {
  CameraOutgoingPayloads,
  CameraIncomingPayloads,
  CameraIncomingResponses,
  CameraOutgoingResponses,
} from './camera-types';
import {
  GeolocationOutgoingPayloads,
  GeolocationIncomingPayloads,
  GeolocationIncomingResponses,
  GeolocationOutgoingResponses,
} from './geolocation-types';
import {
  StorageOutgoingPayloads,
  StorageIncomingPayloads,
  StorageIncomingResponses,
  StorageOutgoingResponses,
} from './storage-types';
import {
  HttpOutgoingPayloads,
  HttpIncomingPayloads,
  HttpIncomingResponses,
  HttpOutgoingResponses,
} from './http-types';
import {
  CustomOutgoingPayloads,
  CustomIncomingPayloads,
  CustomIncomingResponses,
  CustomOutgoingResponses,
} from './custom-types';

/**
 * Tipos de payload para eventos que EMITES (lo que envías cuando haces emit())
 */
export interface OutgoingEventPayloads
  extends PermissionOutgoingPayloads,
    CameraOutgoingPayloads,
    GeolocationOutgoingPayloads,
    StorageOutgoingPayloads,
    HttpOutgoingPayloads,
    CustomOutgoingPayloads {}

/**
 * Tipos de respuesta que RECIBES después de emitir un evento (lo que esperas como respuesta)
 */
export interface IncomingEventResponses
  extends PermissionIncomingResponses,
    CameraIncomingResponses,
    GeolocationIncomingResponses,
    StorageIncomingResponses,
    HttpIncomingResponses,
    CustomIncomingResponses {}

/**
 * Tipos de payload para eventos que RECIBES (lo que recibes cuando alguien emite hacia ti)
 */
export interface IncomingEventPayloads
  extends PermissionIncomingPayloads,
    CameraIncomingPayloads,
    GeolocationIncomingPayloads,
    StorageIncomingPayloads,
    HttpIncomingPayloads,
    CustomIncomingPayloads {}

/**
 * Tipos de respuesta que ENVÍAS cuando respondes a un evento recibido (lo que debes retornar)
 */
export interface OutgoingEventResponses
  extends PermissionOutgoingResponses,
    CameraOutgoingResponses,
    GeolocationOutgoingResponses,
    StorageOutgoingResponses,
    HttpOutgoingResponses,
    CustomOutgoingResponses {}
