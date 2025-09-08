import { useEffect } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import {
  EventTypes,
  IncomingEventPayloads,
  createSuccessResponse,
  createErrorFromException,
  ErrorCode,
  StandardResponse,
} from '../types';
import { useNativeCameraContext } from '../providers/native_camera_provider';

type CameraPhotoBase64Request =
  IncomingEventPayloads[EventTypes.CAMERA_PHOTO_BASE64_PROCESS];

// Tipo de datos para respuesta de procesamiento de foto
interface PhotoProcessedData {
  message: string;
  processed: boolean;
}

/**
 * Executes camera photo base64 processing and returns a standardized response.
 */
const executeCameraPhotoBase64Process = async ({
  base64,
  height,
  width,
}: CameraPhotoBase64Request): Promise<StandardResponse<PhotoProcessedData>> => {
  try {
    console.log('📸 Procesando foto base64:', {
      width,
      height,
      base64Length: base64?.length || 0,
    });

    // Aquí podrías agregar lógica adicional de procesamiento de la foto
    // Por ejemplo: validación, compresión, filtros, etc.

    if (!base64 || base64.length === 0) {
      return createErrorFromException(
        EventTypes.CAMERA_PHOTO_BASE64_PROCESS,
        new Error('Base64 data is empty or invalid'),
        ErrorCode.INVALID_PARAMETERS,
      );
    }

    const data: PhotoProcessedData = {
      message: 'Foto procesada exitosamente',
      processed: true,
    };

    return createSuccessResponse(EventTypes.CAMERA_PHOTO_BASE64_PROCESS, data);
  } catch (error) {
    console.error('Error procesando foto base64:', error);
    return createErrorFromException(
      EventTypes.CAMERA_PHOTO_BASE64_PROCESS,
      error,
      ErrorCode.PHOTO_CAPTURE_FAILED,
    );
  }
};

/**
 * Executes take photo operation and returns a standardized response.
 */
const executeTakePhoto = async (): Promise<
  StandardResponse<{ activated: boolean }>
> => {
  try {
    // Activar la cámara (esto se maneja en el contexto)
    const data = {
      activated: true,
    };

    return createSuccessResponse(EventTypes.TAKE_PHOTO, data);
  } catch (error) {
    console.error('Error activando cámara:', error);
    return createErrorFromException(
      EventTypes.TAKE_PHOTO,
      error,
      ErrorCode.CAMERA_NOT_AVAILABLE,
    );
  }
};

export const useNativeCamera = (eventBus: EventBus | null) => {
  const { isActive, setIsActive } = useNativeCameraContext();

  useEffect(() => {
    if (!eventBus) return;

    const unsubscribeProcess = eventBus.subscribe(
      EventTypes.CAMERA_PHOTO_BASE64_PROCESS,
      executeCameraPhotoBase64Process,
    );

    const unsubscribeTakePhoto = eventBus.subscribe(
      EventTypes.TAKE_PHOTO,
      async () => {
        if (isActive) {
          return createErrorFromException(
            EventTypes.TAKE_PHOTO,
            new Error('Camera is already active'),
            ErrorCode.CAMERA_NOT_AVAILABLE,
          );
        }

        setIsActive(true);
        return executeTakePhoto();
      },
    );

    return () => {
      unsubscribeProcess();
      unsubscribeTakePhoto();
    };
  }, [eventBus, isActive, setIsActive]);
};
