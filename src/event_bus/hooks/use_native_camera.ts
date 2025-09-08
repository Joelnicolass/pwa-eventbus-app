import { useEffect } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import {
  EventTypes,
  IncomingEventPayloads,
  createSuccessResponse,
  createErrorFromException,
  ErrorCode,
  StandardResponse,
  PhotoProcessedData,
  TakePhotoDirectResponse,
  TakePhotoRequest,
} from '../types';
import { useNativeCameraContext } from '../providers/native_camera_provider';

type CameraPhotoBase64Request =
  IncomingEventPayloads[EventTypes.CAMERA_PHOTO_BASE64_PROCESS];

/**
 * Executes camera photo base64 processing and returns a standardized response.
 * MANTENER para compatibilidad hacia atrás
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
 * 🚀 NUEVO: Función refactorizada para TAKE_PHOTO directo
 *
 * Implementa el flujo simplificado:
 * 1. PWA emite TAKE_PHOTO
 * 2. Se activa la cámara
 * 3. Usuario toma foto
 * 4. Se retorna directamente base64, width, height
 */
const executeTakePhotoDirectly = async (
  payload: TakePhotoRequest,
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
    console.log('📷 Iniciando captura directa de foto con payload:', payload);

    // Verificar si la cámara ya está activa
    if (cameraContext.isActive) {
      return createErrorFromException(
        EventTypes.TAKE_PHOTO,
        new Error('Camera is already active'),
        ErrorCode.CAMERA_NOT_AVAILABLE,
      );
    }

    // 🎯 CREAR PROMISE PARA EL FLUJO DIRECTO - USANDO CONVENCIÓN ESTÁNDAR
    return new Promise((resolve, reject) => {
      // Configurar el promise pendiente en el contexto
      cameraContext.setPendingPhotoPromise({
        resolve: (photoData: TakePhotoDirectResponse) => {
          console.log('📸 Foto capturada exitosamente:', {
            width: photoData.width,
            height: photoData.height,
            base64Length: photoData.base64.length,
          });
          // ✅ USAR CONVENCIÓN ESTÁNDAR - createSuccessResponse
          resolve(createSuccessResponse(EventTypes.TAKE_PHOTO, photoData));
        },
        reject: (error: Error) => {
          console.error('📸 Error capturando foto:', error);
          // ✅ USAR CONVENCIÓN ESTÁNDAR - createErrorFromException
          reject(
            createErrorFromException(
              EventTypes.TAKE_PHOTO,
              error,
              ErrorCode.PHOTO_CAPTURE_FAILED,
            ),
          );
        },
      });

      // Activar la cámara - esto hará que se muestre la UI de cámara
      cameraContext.setIsActive(true);
      console.log('📷 Cámara activada - esperando captura del usuario');
    });
  } catch (error) {
    console.error('📷 Error en executeTakePhotoDirectly:', error);
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

    // MANTENER: Suscripción para compatibilidad hacia atrás
    const unsubscribeProcess = eventBus.subscribe(
      EventTypes.CAMERA_PHOTO_BASE64_PROCESS,
      executeCameraPhotoBase64Process,
    );

    // 🚀 REFACTORIZADO: Nueva suscripción para TAKE_PHOTO directo
    const unsubscribeTakePhoto = eventBus.subscribe(
      EventTypes.TAKE_PHOTO,
      async (payload: TakePhotoRequest) => {
        console.log('📷 TAKE_PHOTO recibido con payload:', payload);
        return await executeTakePhotoDirectly(payload, cameraContext);
      },
    );

    return () => {
      unsubscribeProcess();
      unsubscribeTakePhoto();
    };
  }, [eventBus, cameraContext]);
};
