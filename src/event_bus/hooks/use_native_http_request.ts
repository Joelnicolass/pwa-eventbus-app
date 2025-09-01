import axios from 'axios';
import { EventBusType as EventBus } from './use_event_bus';
import { useEffect } from 'react';
import {
  EventTypes,
  IncomingEventPayloads,
  OutgoingEventResponses,
} from '../types';
import {
  DEFAULT_TIMEOUT,
  DEFAULT_RESPONSE_TYPE,
  METHODS_WITH_BODY,
  StatusCode,
} from '../constants';

type HttpRequest = IncomingEventPayloads[EventTypes.HTTP_REQUEST];
type HttpResponse = OutgoingEventResponses[EventTypes.HTTP_REQUEST];

const buildAxiosConfig = (request: HttpRequest) => {
  /**
   * Configuration object for an HTTP request.
   *
   * @property {string} method - The HTTP method to use for the request (e.g., 'GET', 'POST').
   * @property {string} url - The URL to which the request is sent.
   * @property {Record<string, string>} headers - An object representing the HTTP headers to include with the request.
   * @property {number} timeout - The maximum time in milliseconds to wait for the request to complete.
   * @property {string} responseType - The type of data expected in the response (e.g., 'json', 'text').
   */
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
 * Creates a successful HTTP response object with the provided data.
 *
 * @param data - The payload to include in the response.
 * @returns An `HttpResponse` object with a status of `StatusCode.OK` and the given data.
 */
const createSuccessResponse = (data: unknown): HttpResponse => ({
  status: StatusCode.OK,
  data,
});

/**
 * Crea una respuesta de error estandarizada
 */
const createErrorResponse = (error: unknown): HttpResponse => ({
  status: StatusCode.INTERNAL_SERVER_ERROR,
  data: {
    error: error instanceof Error ? error.message : String(error),
  },
});

/**
 * Executes an HTTP request using Axios and returns a standardized response.
 *
 * @param request - The HTTP request configuration object.
 * @returns A promise that resolves to an `HttpResponse` containing either the successful response data
 * or an error response if the request fails.
 */
const executeHttpRequest = async (
  request: HttpRequest,
): Promise<HttpResponse> => {
  try {
    const config = buildAxiosConfig(request);
    const { data } = await axios(config);
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(error);
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
