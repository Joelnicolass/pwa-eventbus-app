import { useEffect } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import {
  EventTypes,
  createSuccessResponse,
  createErrorFromException,
  ErrorCode,
  StandardResponse,
  TakePhotoDirectResponse,
  TakePhotoRequest,
} from '../types';
import { useNativeCameraContext } from '../providers/native_camera_provider';

/**
 * 1. PWA emite TAKE_PHOTO
 * 2. Se activa la cámara
 * 3. Usuario toma foto
 * 4. Se retorna directamente base64, width, height
 */
const executeTakePhotoDirectly = async (
  _payload: TakePhotoRequest,
  cameraContext: {
    isActive: boolean;
    setIsActive: (active: boolean) => void;
    setPendingPhotoPromise: (
      promise: {
        resolve: (value: TakePhotoDirectResponse) => void;
        reject: (error: Error) => void;
      } | null,
    ) => void;
  },
): Promise<StandardResponse<TakePhotoDirectResponse>> => {
  try {
    if (cameraContext.isActive) {
      return createErrorFromException(
        EventTypes.TAKE_PHOTO,
        new Error('Camera is already active'),
        ErrorCode.CAMERA_NOT_AVAILABLE,
      );
    }

    return new Promise((resolve, reject) => {
      cameraContext.setPendingPhotoPromise({
        resolve: (photoData: TakePhotoDirectResponse) => {
          resolve(createSuccessResponse(EventTypes.TAKE_PHOTO, photoData));
        },
        reject: (error: Error) => {
          reject(
            createErrorFromException(
              EventTypes.TAKE_PHOTO,
              error,
              ErrorCode.PHOTO_CAPTURE_FAILED,
            ),
          );
        },
      });

      cameraContext.setIsActive(true);
    });
  } catch (error) {
    return createErrorFromException(
      EventTypes.TAKE_PHOTO,
      error,
      ErrorCode.CAMERA_NOT_AVAILABLE,
    );
  }
};

export const useNativeCamera = (eventBus: EventBus | null) => {
  const cameraContext = useNativeCameraContext();

  useEffect(() => {
    if (!eventBus) return;

    const unsubscribeTakePhoto = eventBus.subscribe(
      EventTypes.TAKE_PHOTO,
      async (payload: TakePhotoRequest) => {
        return await executeTakePhotoDirectly(payload, cameraContext);
      },
    );

    return () => {
      unsubscribeTakePhoto();
    };
  }, [eventBus, cameraContext]);
};
