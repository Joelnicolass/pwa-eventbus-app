import axios from 'axios';
import { EventBusType as EventBus } from './use_event_bus';
import { useEffect } from 'react';
import {
  EventTypes,
  IncomingEventPayloads,
  createSuccessResponse,
  createErrorFromException,
  ErrorCode,
  StandardResponse,
  HttpResponseData,
} from '../types';
import {
  DEFAULT_TIMEOUT,
  DEFAULT_RESPONSE_TYPE,
  METHODS_WITH_BODY,
} from '../constants';

type HttpRequest = IncomingEventPayloads[EventTypes.HTTP_REQUEST];

const buildAxiosConfig = (request: HttpRequest) => {
  const baseConfig = {
    method: request.method,
    url: request.url,
    headers: request.headers,
    timeout: request.timeout || DEFAULT_TIMEOUT,
    responseType: request.responseType || DEFAULT_RESPONSE_TYPE,
  };

  const shouldIncludeBody =
    request.method && METHODS_WITH_BODY.includes(request.method);
  if (shouldIncludeBody) return { ...baseConfig, data: request.body };

  return baseConfig;
};

/**
 * Executes an HTTP request using Axios and returns a standardized response.
 */
const executeHttpRequest = async (
  request: HttpRequest,
): Promise<StandardResponse<HttpResponseData>> => {
  try {
    const config = buildAxiosConfig(request);
    const response = await axios(config);

    const data: HttpResponseData = {
      status: response.status,
      data: response.data,
      headers: response.headers as Record<string, string>,
    };

    return createSuccessResponse(EventTypes.HTTP_REQUEST, data);
  } catch (error) {
    console.error('HTTP request failed:', error);

    // Determinar el tipo de error específico
    let errorCode = ErrorCode.HTTP_REQUEST_FAILED;
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorCode = ErrorCode.HTTP_TIMEOUT;
      } else if (error.response?.status) {
        errorCode = ErrorCode.HTTP_REQUEST_FAILED;
      } else {
        errorCode = ErrorCode.HTTP_NETWORK_ERROR;
      }
    }

    return createErrorFromException(EventTypes.HTTP_REQUEST, error, errorCode);
  }
};

/**
 * React hook that subscribes to HTTP request events on the provided EventBus and
 * performs native HTTP requests using Axios. Handles request methods, headers, timeouts,
 * response types, and request bodies as specified in the event payload.
 *
 * On receiving an HTTP request event, executes the request and returns a response object
 * containing the status, data, and headers. Handles errors by returning an internal server
 * error status and the error message.
 *
 * The subscription is automatically cleaned up when the component unmounts or when the
 * eventBus changes.
 *
 * @param eventBus - The EventBus instance to subscribe to HTTP request events. If null, no subscription is made.
 */
export const useNativeHttpRequest = (eventBus: EventBus | null) => {
  useEffect(() => {
    if (!eventBus) return;

    const unsubscribe = eventBus.subscribe(
      EventTypes.HTTP_REQUEST,
      executeHttpRequest,
    );

    return () => unsubscribe();
  }, [eventBus]);
};
