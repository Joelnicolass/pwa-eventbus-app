import { EventTypes } from './event-types';

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

export interface LocationResponse extends LocationCoordinates {
  success: boolean;
  error?: string;
}

export interface LocationUpdateResponse {
  received: boolean;
}

// === INTERFACES PARA GEOLOCALIZACIÓN ===
export interface GeolocationOutgoingPayloads {
  [EventTypes.GET_LOCATION]: GetLocationRequest;
  [EventTypes.START_LOCATION_TRACKING]: LocationTrackingRequest;
  [EventTypes.STOP_LOCATION_TRACKING]: {};
  [EventTypes.LOCATION_UPDATE]: LocationResponse;
}

export interface GeolocationIncomingPayloads {
  [EventTypes.GET_LOCATION]: GetLocationRequest;
  [EventTypes.START_LOCATION_TRACKING]: LocationTrackingRequest;
  [EventTypes.STOP_LOCATION_TRACKING]: {};
}

export interface GeolocationIncomingResponses {
  [EventTypes.GET_LOCATION]: LocationCoordinates;
  [EventTypes.LOCATION_UPDATE]: LocationUpdateResponse;
}

export interface GeolocationOutgoingResponses {
  [EventTypes.GET_LOCATION]: LocationResponse;
  [EventTypes.START_LOCATION_TRACKING]: { success: boolean; error?: string };
  [EventTypes.STOP_LOCATION_TRACKING]: { success: boolean; error?: string };
  [EventTypes.LOCATION_UPDATE]: LocationUpdateResponse;
}
