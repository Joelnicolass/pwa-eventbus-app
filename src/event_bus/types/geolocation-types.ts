import { EventTypes } from './event-types';
import { StandardResponse } from './standard-responses';

// === TIPOS DE GEOLOCALIZACIÓN ===
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface GetLocationRequest {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface LocationTrackingRequest {
  enableHighAccuracy?: boolean;
  distanceFilter?: number;
  interval?: number;
}

// Datos específicos para las respuestas
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

// === INTERFACES PARA GEOLOCALIZACIÓN ===
export interface GeolocationOutgoingPayloads {
  [EventTypes.GET_LOCATION]: GetLocationRequest;
  [EventTypes.START_LOCATION_TRACKING]: LocationTrackingRequest;
  [EventTypes.STOP_LOCATION_TRACKING]: {};
  [EventTypes.LOCATION_UPDATE]: StandardResponse<LocationData>;
}

export interface GeolocationIncomingPayloads {
  [EventTypes.GET_LOCATION]: GetLocationRequest;
  [EventTypes.START_LOCATION_TRACKING]: LocationTrackingRequest;
  [EventTypes.STOP_LOCATION_TRACKING]: {};
}

export interface GeolocationIncomingResponses {
  [EventTypes.GET_LOCATION]: StandardResponse<LocationData>;
  [EventTypes.LOCATION_UPDATE]: StandardResponse<{ received: boolean }>;
}

export interface GeolocationOutgoingResponses {
  [EventTypes.GET_LOCATION]: StandardResponse<LocationData>;
  [EventTypes.START_LOCATION_TRACKING]: StandardResponse<null>;
  [EventTypes.STOP_LOCATION_TRACKING]: StandardResponse<null>;
  [EventTypes.LOCATION_UPDATE]: StandardResponse<{ received: boolean }>;
}
