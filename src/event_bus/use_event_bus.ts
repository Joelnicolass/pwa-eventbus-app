import { useEffect, useRef } from 'react';
import { EventPayloads, EventResponses } from './types';

interface EventMessage {
  type: string;
  payload: any;
  messageId?: string;
  isResponse?: boolean;
  responseToMessageId?: string;
}

class EventBus {
  private webViewRef: any = null;
  private subscribers = new Map<string, Set<(payload: any) => Promise<any>>>();
  private pendingRequests = new Map<
    string,
    { resolve: Function; reject: Function }
  >();
  private messageIdCounter = 0;

  constructor(webViewRef?: any) {
    this.webViewRef = webViewRef;
  }

  public setWebViewRef(webViewRef: any): void {
    this.webViewRef = webViewRef;
  }

  // Este método debe ser llamado desde el onMessage del WebView
  public handleMessage(event: any): void {
    try {
      const messageData = event.nativeEvent?.data || event.data;
      const message: EventMessage =
        typeof messageData === 'string' ? JSON.parse(messageData) : messageData;

      if (message.isResponse && message.responseToMessageId) {
        // Es una respuesta a un mensaje que enviamos
        this.handleResponse(message);
      } else {
        // Es un evento nuevo desde la PWA
        this.handleIncomingEvent(message);
      }
    } catch (error) {
      console.error('Error parsing message from PWA:', error);
    }
  }

  private handleResponse(message: EventMessage): void {
    const pendingRequest = this.pendingRequests.get(
      message.responseToMessageId!,
    );
    if (pendingRequest) {
      pendingRequest.resolve(message.payload);
      this.pendingRequests.delete(message.responseToMessageId!);
    }
  }

  private async handleIncomingEvent(message: EventMessage): Promise<void> {
    const subscribers = this.subscribers.get(message.type);
    if (subscribers && subscribers.size > 0) {
      try {
        // Ejecutar todos los callbacks suscritos al evento
        const promises = Array.from(subscribers).map(callback =>
          callback(message.payload),
        );

        // Esperar a que todos los callbacks terminen y tomar la primera respuesta
        const responses = await Promise.all(promises);
        const response = responses[0]; // Tomar la primera respuesta

        // Si el mensaje tiene messageId, enviar respuesta
        if (message.messageId) {
          this.sendResponse(message.messageId, response);
        }
      } catch (error) {
        console.error(`Error handling event ${message.type}:`, error);

        // Enviar respuesta de error si es necesario
        if (message.messageId) {
          this.sendResponse(message.messageId, {
            code: 'HANDLER_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error,
          });
        }
      }
    }
  }

  private sendResponse(messageId: string, payload: any): void {
    const responseMessage: EventMessage = {
      type: 'response',
      payload,
      isResponse: true,
      responseToMessageId: messageId,
    };

    this.postMessageToWebView(responseMessage);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}`;
  }

  private postMessageToWebView(message: EventMessage): void {
    if (!this.webViewRef?.current) {
      console.warn('WebView reference not available');
      return;
    }

    try {
      const messageString = JSON.stringify(message);
      this.webViewRef.current.postMessage(messageString);
    } catch (error) {
      console.error('Error sending message to WebView:', error);
    }
  }

  public emit<T extends keyof EventPayloads & keyof EventResponses>(
    eventType: T,
    payload: EventPayloads[T],
  ): Promise<EventResponses[T]> {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();

      // Guardar la promesa pendiente
      this.pendingRequests.set(messageId, { resolve, reject });

      // Crear mensaje
      const message: EventMessage = {
        type: eventType as string,
        payload,
        messageId,
      };

      // Enviar mensaje
      this.postMessageToWebView(message);

      // Timeout para evitar promesas colgadas
      setTimeout(() => {
        if (this.pendingRequests.has(messageId)) {
          this.pendingRequests.delete(messageId);
          reject(new Error(`Timeout waiting for response to ${eventType}`));
        }
      }, 30000); // 30 segundos timeout
    });
  }

  public subscribe<T extends keyof EventPayloads & keyof EventResponses>(
    eventType: T,
    callback: (payload: EventPayloads[T]) => Promise<EventResponses[T]>,
  ): () => void {
    const eventTypeStr = eventType as string;

    if (!this.subscribers.has(eventTypeStr)) {
      this.subscribers.set(eventTypeStr, new Set());
    }

    this.subscribers.get(eventTypeStr)!.add(callback);

    // Retornar función de cleanup
    return () => {
      this.unsubscribe(eventType, callback);
    };
  }

  public unsubscribe<T extends keyof EventPayloads & keyof EventResponses>(
    eventType: T,
    callback: (payload: EventPayloads[T]) => Promise<EventResponses[T]>,
  ): void {
    const eventTypeStr = eventType as string;
    const subscribers = this.subscribers.get(eventTypeStr);

    if (subscribers) {
      subscribers.delete(callback);

      // Limpiar el Set si está vacío
      if (subscribers.size === 0) {
        this.subscribers.delete(eventTypeStr);
      }
    }
  }

  public destroy(): void {
    // Limpiar listeners y pendientes
    this.subscribers.clear();
    this.pendingRequests.clear();
  }
}

export const useEventBus = (webViewRef?: any) => {
  const eventBusRef = useRef<EventBus | null>(null);

  useEffect(() => {
    eventBusRef.current = new EventBus(webViewRef);

    return () => {
      eventBusRef.current?.destroy();
    };
  }, [webViewRef]);

  useEffect(() => {
    if (eventBusRef.current && webViewRef) {
      eventBusRef.current.setWebViewRef(webViewRef);
    }
  }, [webViewRef]);

  return eventBusRef.current;
};
