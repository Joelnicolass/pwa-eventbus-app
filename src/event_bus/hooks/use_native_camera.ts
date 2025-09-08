import { useEffect } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import { EventTypes } from '../types';
import { useNativeCameraContext } from '../providers/native_camera_provider';

export const useNativeCamera = (eventBus: EventBus | null) => {
  const { isActive, setIsActive } = useNativeCameraContext();

  useEffect(() => {
    if (!eventBus) return;

    const unsubscribeTakePhoto = eventBus.subscribe(
      EventTypes.TAKE_PHOTO,
      async () => {
        if (isActive)
          return { success: false, error: 'Camera is already active' };

        setIsActive(true);

        return { success: true };
      },
    );

    const unsuscribeSendImage = eventBus.subscribe(
      EventTypes.CAMERA_PHOTO_BASE64_PROCESS,
      async ({ base64, height, width }) => {
        eventBus.emit(EventTypes.CAMERA_PHOTO_BASE64_READY, {
          base64,
          height,
          width,
        });
      },
    );

    return () => {
      unsubscribeTakePhoto();
      unsuscribeSendImage();
    };
  }, [eventBus, isActive, setIsActive]);
};
