import { useEffect } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import { EventTypes } from '../types';
import { Alert } from 'react-native';

export const useCustomEvents = (eventBus: EventBus | null) => {
  useEffect(() => {
    if (!eventBus) return;
    // ADD CUSTOM EVENTS

    const unsuscribe = eventBus.subscribe(EventTypes.TEST, async data => {
      Alert.alert('Evento TEST recibido', JSON.stringify(data));
    });

    return () => {
      // CLEAN CUSTOM EVENTS
      unsuscribe();
    };
  }, [eventBus]);
};
