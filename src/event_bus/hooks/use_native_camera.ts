import { useEffect } from 'react';
import { EventBusType as EventBus } from './use_event_bus';

export const useNativeCamera = (eventBus: EventBus | null) => {
  useEffect(() => {
    if (!eventBus) return;

    return () => {};
  }, [eventBus]);
};
