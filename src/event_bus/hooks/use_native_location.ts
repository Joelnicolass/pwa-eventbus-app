import { useEffect, useRef, useCallback } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import Geolocation from '@react-native-community/geolocation';
import {
  EventTypes,
  IncomingEventPayloads,
  createSuccessResponse,
  createErrorFromException,
  ErrorCode,
  StandardResponse,
  LocationData,
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

/**
 * Convierte una posición de geolocalización a datos estandarizados
 */
const convertPositionToLocationData = (
  position: GeolocationPosition,
): LocationData => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy,
  altitude: position.coords.altitude ?? undefined,
  speed: position.coords.speed ?? undefined,
  heading: position.coords.heading ?? undefined,
  timestamp: position.timestamp,
});

/**
 * Executes a get current location operation and returns a standardized response.
 */
const executeGetLocation = async (
  request: GetLocationRequest,
): Promise<StandardResponse<LocationData>> => {
  return new Promise(resolve => {
    try {
      const options = {
        enableHighAccuracy: request.enableHighAccuracy ?? true,
        timeout: request.timeout ?? DEFAULT_GEOLOCATION_TIMEOUT,
        maximumAge: request.maximumAge ?? DEFAULT_MAXIMUM_AGE,
      };

      Geolocation.getCurrentPosition(
        position => {
          const data = convertPositionToLocationData(position);
          resolve(createSuccessResponse(EventTypes.GET_LOCATION, data));
        },
        error => {
          console.error('Error getting current location:', error);
          let errorCode = ErrorCode.LOCATION_UNAVAILABLE;

          // Mapear códigos de error específicos
          if (error.code === 1)
            errorCode = ErrorCode.LOCATION_PERMISSION_DENIED;
          else if (error.code === 2) errorCode = ErrorCode.LOCATION_UNAVAILABLE;
          else if (error.code === 3) errorCode = ErrorCode.LOCATION_TIMEOUT;

          resolve(
            createErrorFromException(EventTypes.GET_LOCATION, error, errorCode),
          );
        },
        options,
      );
    } catch (error) {
      console.error('Error in executeGetLocation:', error);
      resolve(
        createErrorFromException(
          EventTypes.GET_LOCATION,
          error,
          ErrorCode.LOCATION_UNAVAILABLE,
        ),
      );
    }
  });
};

/**
 * React hook que maneja eventos de geolocalización usando respuestas estandarizadas
 */
export const useNativeLocation = (eventBus: EventBus | null) => {
  const watchIdRef = useRef<number | null>(null);

  const executeStartLocationTracking = useCallback(
    async (request: StartTrackingRequest): Promise<StandardResponse<null>> => {
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
                const locationData = convertPositionToLocationData(position);
                const updateResponse = createSuccessResponse(
                  EventTypes.LOCATION_UPDATE,
                  locationData,
                );
                eventBus
                  .emit(EventTypes.LOCATION_UPDATE, updateResponse)
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
              let errorCode = ErrorCode.LOCATION_UNAVAILABLE;
              if (error.code === 1)
                errorCode = ErrorCode.LOCATION_PERMISSION_DENIED;
              resolve(
                createErrorFromException(
                  EventTypes.START_LOCATION_TRACKING,
                  error,
                  errorCode,
                ),
              );
            },
            options,
          );

          resolve(
            createSuccessResponse(EventTypes.START_LOCATION_TRACKING, null),
          );
        });
      } catch (error) {
        console.error('Error starting location tracking:', error);
        return createErrorFromException(
          EventTypes.START_LOCATION_TRACKING,
          error,
          ErrorCode.LOCATION_UNAVAILABLE,
        );
      }
    },
    [eventBus],
  );

  const executeStopLocationTracking = useCallback(
    async (_request: StopTrackingRequest): Promise<StandardResponse<null>> => {
      try {
        if (watchIdRef.current !== null) {
          Geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        return createSuccessResponse(EventTypes.STOP_LOCATION_TRACKING, null);
      } catch (error) {
        console.error('Error stopping location tracking:', error);
        return createErrorFromException(
          EventTypes.STOP_LOCATION_TRACKING,
          error,
          ErrorCode.LOCATION_UNAVAILABLE,
        );
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
