import { useEffect } from 'react';
import { EventBusType as EventBus } from './use_event_bus';
import {
  EventTypes,
  IncomingEventPayloads,
  createSuccessResponse,
  createErrorFromException,
  ErrorCode,
  StandardResponse,
} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = AsyncStorage;

type SetStorageRequest = IncomingEventPayloads[EventTypes.SET_IN_LOCAL_STORAGE];
type GetStorageRequest =
  IncomingEventPayloads[EventTypes.GET_FROM_LOCAL_STORAGE];
type DeleteStorageRequest =
  IncomingEventPayloads[EventTypes.DELETE_FROM_LOCAL_STORAGE];
type ClearStorageRequest =
  IncomingEventPayloads[EventTypes.CLEAR_LOCAL_STORAGE];

// Tipos de datos específicos para cada operación
interface GetStorageData {
  key: string;
  value: string | null;
  requestId: string;
}

/**
 * Executes a storage set operation and returns a standardized response.
 */
const executeSetStorage = async (
  request: SetStorageRequest,
): Promise<StandardResponse<null>> => {
  try {
    const { key, value } = request;
    await storage.setItem(key, value);
    return createSuccessResponse(EventTypes.SET_IN_LOCAL_STORAGE, null);
  } catch (error) {
    console.error('Error setting value in local storage:', error);
    return createErrorFromException(
      EventTypes.SET_IN_LOCAL_STORAGE,
      error,
      ErrorCode.STORAGE_WRITE_FAILED,
    );
  }
};

/**
 * Executes a storage get operation and returns a standardized response.
 */
const executeGetStorage = async (
  request: GetStorageRequest,
): Promise<StandardResponse<GetStorageData>> => {
  try {
    const { key, requestId } = request;
    const value = await storage.getItem(key);

    const data: GetStorageData = {
      key,
      value: value || null,
      requestId,
    };

    return createSuccessResponse(EventTypes.GET_FROM_LOCAL_STORAGE, data);
  } catch (error) {
    console.error('Error getting value from local storage:', error);
    return createErrorFromException(
      EventTypes.GET_FROM_LOCAL_STORAGE,
      error,
      ErrorCode.STORAGE_READ_FAILED,
    );
  }
};

/**
 * Executes a storage delete operation and returns a standardized response.
 */
const executeDeleteStorage = async (
  request: DeleteStorageRequest,
): Promise<StandardResponse<null>> => {
  try {
    const { key } = request;
    await storage.removeItem(key);
    return createSuccessResponse(EventTypes.DELETE_FROM_LOCAL_STORAGE, null);
  } catch (error) {
    console.error('Error deleting value from local storage:', error);
    return createErrorFromException(
      EventTypes.DELETE_FROM_LOCAL_STORAGE,
      error,
      ErrorCode.STORAGE_DELETE_FAILED,
    );
  }
};

/**
 * Executes a storage clear operation and returns a standardized response.
 */
const executeClearStorage = async (
  _request: ClearStorageRequest,
): Promise<StandardResponse<null>> => {
  try {
    await storage.clear();
    return createSuccessResponse(EventTypes.CLEAR_LOCAL_STORAGE, null);
  } catch (error) {
    console.error('Error clearing local storage:', error);
    return createErrorFromException(
      EventTypes.CLEAR_LOCAL_STORAGE,
      error,
      ErrorCode.STORAGE_CLEAR_FAILED,
    );
  }
};

/**
 * React hook that subscribes to storage events on the provided EventBus and
 * performs native storage operations using AsyncStorage. Handles set, get, delete, and clear operations
 * with proper error handling and standardized responses.
 *
 * On receiving storage events, executes the appropriate operation and returns a response
 * object containing success status, data, and error information if applicable.
 *
 * Supported operations:
 * - SET_IN_LOCAL_STORAGE: Stores a key-value pair
 * - GET_FROM_LOCAL_STORAGE: Retrieves a value by key
 * - DELETE_FROM_LOCAL_STORAGE: Removes a specific key-value pair
 * - CLEAR_LOCAL_STORAGE: Removes all stored data
 *
 * The subscriptions are automatically cleaned up when the component unmounts or when the
 * eventBus changes.
 *
 * Note: This implementation uses AsyncStorage as the storage backend, which provides
 * persistent key-value storage that is asynchronous and unencrypted.
 *
 * @param eventBus - The EventBus instance to subscribe to storage events. If null, no subscription is made.
 */
export const useNativeStorage = (eventBus: EventBus | null) => {
  useEffect(() => {
    if (!eventBus) return;

    const unsubscribeSet = eventBus.subscribe(
      EventTypes.SET_IN_LOCAL_STORAGE,
      executeSetStorage,
    );

    const unsubscribeGet = eventBus.subscribe(
      EventTypes.GET_FROM_LOCAL_STORAGE,
      executeGetStorage,
    );

    const unsubscribeDelete = eventBus.subscribe(
      EventTypes.DELETE_FROM_LOCAL_STORAGE,
      executeDeleteStorage,
    );

    const unsubscribeClear = eventBus.subscribe(
      EventTypes.CLEAR_LOCAL_STORAGE,
      executeClearStorage,
    );

    return () => {
      unsubscribeSet();
      unsubscribeGet();
      unsubscribeDelete();
      unsubscribeClear();
    };
  }, [eventBus]);

  return {};
};
