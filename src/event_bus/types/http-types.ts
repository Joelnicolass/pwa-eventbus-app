import { EventTypes } from './event-types';

// === TIPOS DE HTTP ===
export interface HttpRequestEvent {
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

export interface HttpResponse {
  status: number;
  data: any;
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
  [EventTypes.HTTP_REQUEST]: HttpResponse;
}
