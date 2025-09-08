import { useEffect } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import {
  EventTypes,
  IncomingEventPayloads,
  createSuccessResponse,
  createErrorFromException,
  ErrorCode,
  StandardResponse,
  TestEventData,
} from '../types';
import { Alert } from 'react-native';

type TestEventRequest = IncomingEventPayloads[EventTypes.TEST];

/**
 * Executes TEST event processing and returns a standardized response.
 */
const executeTestEvent = async (
  data: TestEventRequest,
): Promise<StandardResponse<TestEventData>> => {
  try {
    Alert.alert('Evento TEST recibido', JSON.stringify(data));

    const responseData: TestEventData = {
      message: 'Evento TEST procesado exitosamente',
      receivedData: data,
      processedAt: new Date().toISOString(),
    };

    return createSuccessResponse(EventTypes.TEST, responseData);
  } catch (error) {
    console.error('Error procesando evento TEST:', error);
    return createErrorFromException(
      EventTypes.TEST,
      error,
      ErrorCode.OPERATION_FAILED,
    );
  }
};

export const useCustomEvents = (eventBus: EventBus | null) => {
  useEffect(() => {
    if (!eventBus) return;

    const unsubscribeTest = eventBus.subscribe(
      EventTypes.TEST,
      executeTestEvent,
    );

    return () => {
      unsubscribeTest();
    };
  }, [eventBus]);
};
