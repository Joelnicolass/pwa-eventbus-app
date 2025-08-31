import { useEffect } from 'react';
import { EventBus } from './use_event_bus';

export const useNativeCamera = (eventBus: EventBus | null) => {
  useEffect(() => {
    if (!eventBus) return;

    return () => {};
  }, [eventBus]);
};
