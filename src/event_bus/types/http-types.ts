import { EventTypes } from './event-types';
import { StandardResponse } from './standard-responses';

// === TIPOS DE HTTP ===
export interface HttpRequestEvent {
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

// Datos específicos para respuesta HTTP exitosa
export interface HttpResponseData {
  status: number;
  data: any;
  headers?: Record<string, string>;
}

// === INTERFACES PARA HTTP ===
export interface HttpOutgoingPayloads {
  // No hay payloads HTTP salientes desde React Native
}

export interface HttpIncomingPayloads {
  [EventTypes.HTTP_REQUEST]: HttpRequestEvent;
}

export interface HttpIncomingResponses {
  // No hay respuestas HTTP entrantes
}

export interface HttpOutgoingResponses {
  [EventTypes.HTTP_REQUEST]: StandardResponse<HttpResponseData>;
}
