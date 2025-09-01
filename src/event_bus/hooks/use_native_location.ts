import { useEffect, useRef, useCallback } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import Geolocation from '@react-native-community/geolocation';
import {
  EventTypes,
  IncomingEventPayloads,
  OutgoingEventResponses,
} from '../types';
import {
  DEFAULT_GEOLOCATION_TIMEOUT,
  DEFAULT_MAXIMUM_AGE,
  DEFAULT_DISTANCE_FILTER,
  DEFAULT_LOCATION_INTERVAL,
} from '../constants';

// Definir el tipo de posición de geolocalización
interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
  };
  timestamp: number;
}

type GetLocationRequest = IncomingEventPayloads[EventTypes.GET_LOCATION];
type StartTrackingRequest =
  IncomingEventPayloads[EventTypes.START_LOCATION_TRACKING];
type StopTrackingRequest =
  IncomingEventPayloads[EventTypes.STOP_LOCATION_TRACKING];
type GetLocationResponse = OutgoingEventResponses[EventTypes.GET_LOCATION];
type StartTrackingResponse =
  OutgoingEventResponses[EventTypes.START_LOCATION_TRACKING];
type StopTrackingResponse =
  OutgoingEventResponses[EventTypes.STOP_LOCATION_TRACKING];

/**
 * Creates a successful location response object.
 *
 * @param position - The geolocation position object.
 * @returns A GetLocationResponse object with success: true and location data.
 */
const createLocationSuccessResponse = (
  position: GeolocationPosition,
): GetLocationResponse => ({
  success: true,
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy,
  altitude: position.coords.altitude ?? undefined,
  speed: position.coords.speed ?? undefined,
  heading: position.coords.heading ?? undefined,
  timestamp: position.timestamp,
});

/**
 * Creates a standardized location error response.
 *
 * @param error - The error that occurred.
 * @returns A GetLocationResponse object with success: false and error details.
 */
const createLocationErrorResponse = (error: unknown): GetLocationResponse => ({
  success: false,
  latitude: 0,
  longitude: 0,
  timestamp: Date.now(),
  error: error instanceof Error ? error.message : String(error),
});

/**
 * Creates a successful tracking start response object.
 *
 * @returns A StartTrackingResponse object with success: true.
 */
const createStartTrackingSuccessResponse = (): StartTrackingResponse => ({
  success: true,
});

/**
 * Creates a successful tracking stop response object.
 *
 * @returns A StopTrackingResponse object with success: true.
 */
const createStopTrackingSuccessResponse = (): StopTrackingResponse => ({
  success: true,
});

/**
 * Creates a standardized tracking error response.
 *
 * @param error - The error that occurred.
 * @returns A tracking response object with success: false and error details.
 */
const createTrackingErrorResponse = (
  error: unknown,
): StartTrackingResponse | StopTrackingResponse => ({
  success: false,
  error: error instanceof Error ? error.message : String(error),
});

/**
 * Executes a get current location operation and returns a standardized response.
 *
 * @param request - The location request configuration object.
 * @returns A promise that resolves to a response containing location data or error details.
 */
const executeGetLocation = async (
  request: GetLocationRequest,
): Promise<GetLocationResponse> => {
  return new Promise(resolve => {
    try {
      const options = {
        enableHighAccuracy: request.enableHighAccuracy ?? true,
        timeout: request.timeout ?? DEFAULT_GEOLOCATION_TIMEOUT,
        maximumAge: request.maximumAge ?? DEFAULT_MAXIMUM_AGE,
      };

      Geolocation.getCurrentPosition(
        position => {
          resolve(createLocationSuccessResponse(position));
        },
        error => {
          console.error('Error getting current location:', error);
          resolve(createLocationErrorResponse(error));
        },
        options,
      );
    } catch (error) {
      console.error('Error in executeGetLocation:', error);
      resolve(createLocationErrorResponse(error));
    }
  });
};

/**
 * React hook that subscribes to location events on the provided EventBus and
 * performs native location operations using React Native Geolocation. Handles get location,
 * start tracking, and stop tracking operations with proper error handling and standardized responses.
 *
 * On receiving location events, executes the appropriate operation and returns a response
 * object containing success status, location data, and error information if applicable.
 *
 * Supported operations:
 * - GET_LOCATION: Gets the current device location once
 * - START_LOCATION_TRACKING: Starts continuous location tracking
 * - STOP_LOCATION_TRACKING: Stops continuous location tracking
 *
 * The subscriptions are automatically cleaned up when the component unmounts or when the
 * eventBus changes. Location tracking is also stopped on cleanup to prevent memory leaks.
 *
 * Note: This implementation uses React Native Geolocation API which requires location
 * permissions to be granted by the user.
 *
 * @param eventBus - The EventBus instance to subscribe to location events. If null, no subscription is made.
 */
export const useNativeLocation = (eventBus: EventBus | null) => {
  const watchIdRef = useRef<number | null>(null);

  const executeStartLocationTracking = useCallback(
    async (request: StartTrackingRequest): Promise<StartTrackingResponse> => {
      try {
        // Si ya hay un tracking activo, lo detenemos primero
        if (watchIdRef.current !== null) {
          Geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }

        const options = {
          enableHighAccuracy: request.enableHighAccuracy ?? true,
          distanceFilter: request.distanceFilter ?? DEFAULT_DISTANCE_FILTER,
          interval: request.interval ?? DEFAULT_LOCATION_INTERVAL,
        };

        return new Promise(resolve => {
          watchIdRef.current = Geolocation.watchPosition(
            position => {
              // Emitir evento de actualización de ubicación
              if (eventBus) {
                const locationUpdate = createLocationSuccessResponse(position);
                eventBus
                  .emit(EventTypes.LOCATION_UPDATE, locationUpdate)
                  .catch(error => {
                    console.error(
                      'Error enviando actualización de ubicación:',
                      error,
                    );
                  });
              }
            },
            error => {
              console.error('Error in location tracking:', error);
              watchIdRef.current = null;
              resolve(createTrackingErrorResponse(error));
            },
            options,
          );

          resolve(createStartTrackingSuccessResponse());
        });
      } catch (error) {
        console.error('Error starting location tracking:', error);
        return createTrackingErrorResponse(error);
      }
    },
    [eventBus],
  );

  const executeStopLocationTracking = useCallback(
    async (_request: StopTrackingRequest): Promise<StopTrackingResponse> => {
      try {
        if (watchIdRef.current !== null) {
          Geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        return createStopTrackingSuccessResponse();
      } catch (error) {
        console.error('Error stopping location tracking:', error);
        return createTrackingErrorResponse(error);
      }
    },
    [],
  );

  useEffect(() => {
    if (!eventBus) return;

    const unsubscribeGetLocation = eventBus.subscribe(
      EventTypes.GET_LOCATION,
      executeGetLocation,
    );

    const unsubscribeStartTracking = eventBus.subscribe(
      EventTypes.START_LOCATION_TRACKING,
      executeStartLocationTracking,
    );

    const unsubscribeStopTracking = eventBus.subscribe(
      EventTypes.STOP_LOCATION_TRACKING,
      executeStopLocationTracking,
    );

    return () => {
      // Limpiar suscripciones
      unsubscribeGetLocation();
      unsubscribeStartTracking();
      unsubscribeStopTracking();

      // Detener tracking si está activo
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [eventBus, executeStartLocationTracking, executeStopLocationTracking]);

  return {};
};
