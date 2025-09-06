import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useGlobalEventBus } from '../providers/event_bus_provider';
import { EventTypes } from '../types';

interface UsePwaReadyNotificationProps {
  isServerReady: boolean;
}

export const usePwaReadyNotification = ({
  isServerReady,
}: UsePwaReadyNotificationProps) => {
  const eventBus = useGlobalEventBus();

  // Suscribirse a eventos PWA_READY
  useEffect(() => {
    if (!eventBus) return;

    const unsubscribeInitialization = eventBus.subscribe(
      EventTypes.PWA_READY,
      async payload => {
        console.log('PWA está lista:', payload);
        return { status: 'native_ready', timestamp: Date.now() };
      },
    );

    return () => {
      unsubscribeInitialization();
    };
  }, [eventBus]);

  // Notificar a la PWA cuando React Native está listo
  useEffect(() => {
    if (eventBus && isServerReady) {
      // Pequeño delay para asegurar que la PWA esté cargada
      setTimeout(() => {
        eventBus
          .emit(EventTypes.NATIVE_READY, {
            platform: Platform.OS,
            version: Platform.Version,
            timestamp: Date.now(),
          })
          .catch(error => {
            console.log(
              'PWA aún no está lista para recibir eventos:',
              error.message,
            );
          });
      }, 2000);
    }
  }, [eventBus, isServerReady]);

  return {
    eventBus,
    isEventBusReady: !!eventBus,
  };
};
