import { useEffect } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import { Alert } from 'react-native';

export const useCustomEvents = (eventBus: EventBus | null) => {
  useEffect(() => {
    if (!eventBus) return;

    const unsub = eventBus.subscribe(
      'web',
      async ({ data }: { data: string }) => {
        Alert.alert('Evento desde WebView', data);
      },
    );

    return () => {
      unsub();
    };
  }, [eventBus]);
};
