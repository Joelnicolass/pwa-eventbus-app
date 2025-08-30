import { useEffect } from 'react';
import { EventBus } from './use_event_bus';

import {
  EventTypes,
  IncomingEventPayloads,
  OutgoingEventResponses,
} from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = AsyncStorage;

type SetStorageRequest = IncomingEventPayloads[EventTypes.SET_IN_LOCAL_STORAGE];
type GetStorageRequest =
  IncomingEventPayloads[EventTypes.GET_FROM_LOCAL_STORAGE];
type DeleteStorageRequest =
  IncomingEventPayloads[EventTypes.DELETE_FROM_LOCAL_STORAGE];
type ClearStorageRequest =
  IncomingEventPayloads[EventTypes.CLEAR_LOCAL_STORAGE];
type SetStorageResponse =
  OutgoingEventResponses[EventTypes.SET_IN_LOCAL_STORAGE];
type GetStorageResponse =
  OutgoingEventResponses[EventTypes.GET_FROM_LOCAL_STORAGE];
type DeleteStorageResponse =
  OutgoingEventResponses[EventTypes.DELETE_FROM_LOCAL_STORAGE];
type ClearStorageResponse =
  OutgoingEventResponses[EventTypes.CLEAR_LOCAL_STORAGE];

/**
 * Creates a successful set storage response object.
 *
 * @returns A SetStorageResponse object with success: true.
 */
const createSetSuccessResponse = (): SetStorageResponse => ({
  success: true,
});

/**
 * Creates a successful get storage response object.
 *
 * @param requestId - The request ID.
 * @param value - The retrieved value.
 * @returns A GetStorageResponse object with success: true and the given data.
 */
const createGetSuccessResponse = (
  requestId: string,
  value: string | null,
): GetStorageResponse => ({
  success: true,
  requestId,
  value,
});

/**
 * Creates a standardized set storage error response.
 *
 * @param error - The error that occurred.
 * @returns A SetStorageResponse object with success: false and error details.
 */
const createSetErrorResponse = (error: unknown): SetStorageResponse => ({
  success: false,
  error: error instanceof Error ? error.message : String(error),
});

/**
 * Creates a standardized get storage error response.
 *
 * @param error - The error that occurred.
 * @param requestId - The request ID.
 * @returns A GetStorageResponse object with success: false and error details.
 */
const createGetErrorResponse = (
  error: unknown,
  requestId: string,
): GetStorageResponse => ({
  success: false,
  error: error instanceof Error ? error.message : String(error),
  requestId,
  value: null,
});

/**
 * Creates a successful delete storage response object.
 *
 * @returns A DeleteStorageResponse object with success: true.
 */
const createDeleteSuccessResponse = (): DeleteStorageResponse => ({
  success: true,
});

/**
 * Creates a successful clear storage response object.
 *
 * @returns A ClearStorageResponse object with success: true.
 */
const createClearSuccessResponse = (): ClearStorageResponse => ({
  success: true,
});

/**
 * Creates a standardized delete storage error response.
 *
 * @param error - The error that occurred.
 * @returns A DeleteStorageResponse object with success: false and error details.
 */
const createDeleteErrorResponse = (error: unknown): DeleteStorageResponse => ({
  success: false,
  error: error instanceof Error ? error.message : String(error),
});

/**
 * Creates a standardized clear storage error response.
 *
 * @param error - The error that occurred.
 * @returns A ClearStorageResponse object with success: false and error details.
 */
const createClearErrorResponse = (error: unknown): ClearStorageResponse => ({
  success: false,
  error: error instanceof Error ? error.message : String(error),
});

/**
 * Executes a storage set operation and returns a standardized response.
 *
 * @param request - The storage set request configuration object.
 * @returns A promise that resolves to a response containing either success or error details.
 */
const executeSetStorage = async (
  request: SetStorageRequest,
): Promise<SetStorageResponse> => {
  try {
    const { key, value } = request;
    await storage.setItem(key, value);
    return createSetSuccessResponse();
  } catch (error) {
    console.error('Error setting value in local storage:', error);
    return createSetErrorResponse(error);
  }
};

/**
 * Executes a storage get operation and returns a standardized response.
 *
 * @param request - The storage get request configuration object.
 * @returns A promise that resolves to a response containing the value or error details.
 */
const executeGetStorage = async (
  request: GetStorageRequest,
): Promise<GetStorageResponse> => {
  try {
    const { key, requestId } = request;
    const value = await storage.getItem(key);

    return createGetSuccessResponse(requestId, value || null);
  } catch (error) {
    console.error('Error getting value from local storage:', error);
    return createGetErrorResponse(error, request.requestId);
  }
};

/**
 * Executes a storage delete operation and returns a standardized response.
 *
 * @param request - The storage delete request configuration object.
 * @returns A promise that resolves to a response containing either success or error details.
 */
const executeDeleteStorage = async (
  request: DeleteStorageRequest,
): Promise<DeleteStorageResponse> => {
  try {
    const { key } = request;
    await storage.removeItem(key);
    return createDeleteSuccessResponse();
  } catch (error) {
    console.error('Error deleting value from local storage:', error);
    return createDeleteErrorResponse(error);
  }
};

/**
 * Executes a storage clear operation and returns a standardized response.
 *
 * @param _request - The storage clear request configuration object (unused but required for consistency).
 * @returns A promise that resolves to a response containing either success or error details.
 */
const executeClearStorage = async (
  _request: ClearStorageRequest,
): Promise<ClearStorageResponse> => {
  try {
    await storage.clear();
    return createClearSuccessResponse();
  } catch (error) {
    console.error('Error clearing local storage:', error);
    return createClearErrorResponse(error);
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
