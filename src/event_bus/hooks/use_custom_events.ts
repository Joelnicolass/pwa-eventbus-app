import { useEffect } from 'react';
import { EventBus } from './use_event_bus';

export const useCustomEvents = (eventBus: EventBus | null) => {
  useEffect(() => {
    if (!eventBus) return;
    // ADD CUSTOM EVENTS

    return () => {
      // CLEAN CUSTOM EVENTS
    };
  }, [eventBus]);
};
