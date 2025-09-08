import { useEffect, useRef } from 'react';
import {
  OutgoingEventPayloads,
  IncomingEventResponses,
  IncomingEventPayloads,
  OutgoingEventResponses,
} from '../types';

/**
 * Represents a message sent through the event bus.
 *
 * @property type - The type of the event message.
 * @property payload - The payload data associated with the event.
 * @property messageId - (Optional) Unique identifier for the message.
 * @property isResponse - (Optional) Indicates if the message is a response to another message.
 * @property responseToMessageId - (Optional) The message ID that this message is responding to.
 */
export interface EventMessage {
  type: string;
  payload: any;
  messageId?: string;
  isResponse?: boolean;
  responseToMessageId?: string;
}

type SubscriberCallback = (payload: any) => Promise<any>;
type PendingRequest = { resolve: Function; reject: Function };
type WebViewRef = { current: any } | null;

/**
 * Manages event-based communication between a WebView and the host application,
 * supporting request/response messaging, event subscriptions, and asynchronous handling.
 *
 * The `EventBus` class enables:
 * - Emitting events to the WebView and awaiting responses.
 * - Subscribing to specific event types with asynchronous callbacks.
 * - Handling incoming messages, distinguishing between new events and responses.
 * - Managing pending requests with automatic timeout handling.
 * - Cleaning up all subscribers and pending requests to prevent memory leaks.
 *
 * @template IncomingEventPayloads - Mapping of event types to payloads received from the WebView.
 * @template OutgoingEventPayloads - Mapping of event types to payloads sent to the WebView.
 * @template IncomingEventResponses - Mapping of event types to responses expected from the WebView.
 * @template OutgoingEventResponses - Mapping of event types to responses sent to the WebView.
 *
 * @remarks
 * - Designed for use with React Native's WebView, but adaptable to other environments.
 * - All event and response types are strongly typed for type safety.
 * - Handles serialization and deserialization of messages automatically.
 * - Provides cleanup via the `destroy` method.
 */
class EventBus {
  private webViewRef: WebViewRef = null;
  private subscribers = new Map<string, Set<SubscriberCallback>>();
  private pendingRequests = new Map<string, PendingRequest>();
  private messageIdCounter = 0;
  private TIMEOUT_MS = 30000; // 30 segundos

  constructor(webViewRef?: any) {
    this.webViewRef = webViewRef;
  }

  public setWebViewRef(webViewRef: any): void {
    this.webViewRef = webViewRef;
  }

  /**
   * Handles incoming messages from the PWA, parsing the event data and delegating
   * to the appropriate handler based on whether the message is a response or a new event.
   *
   * @param event - The event object containing the message data, which may be accessed via `event.nativeEvent?.data` or `event.data`.
   *
   * @remarks
   * - If the message is a response (determined by `isResponse` and `responseToMessageId`), it calls `handleResponse`.
   * - Otherwise, it treats the message as a new event and calls `handleIncomingEvent`.
   * - Any errors during parsing are logged to the console.
   *
   * Should be bound to the WebView's onMessage prop.
   */
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

  /**
   * Handles an incoming response message by resolving the corresponding pending request.
   *
   * This method looks up the pending request associated with the `responseToMessageId` in the message.
   * If a matching pending request is found, it resolves the request with the message payload and removes
   * the request from the pending requests map.
   *
   * @param message - The response message containing the payload and the ID of the original request.
   */
  private handleResponse(message: EventMessage): void {
    const pendingRequest = this.pendingRequests.get(
      message.responseToMessageId!,
    );
    if (pendingRequest) {
      pendingRequest.resolve(message.payload);
      this.pendingRequests.delete(message.responseToMessageId!);
    }
  }

  /**
   * Handles an incoming event message by executing all subscribed callbacks for the event type.
   * Waits for all callbacks to complete and sends the first response back if a messageId is present.
   * In case of errors during callback execution, sends an error response if a messageId is present.
   *
   * @param message - The event message containing the type, payload, and optional messageId.
   * @returns A promise that resolves when all callbacks have been executed and any response has been sent.
   */
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

  /**
   * Sends a response message to the WebView for a given message ID.
   *
   * @param messageId - The ID of the message to respond to.
   * @param payload - The payload to include in the response message.
   */
  private sendResponse(messageId: string, payload: any): void {
    const responseMessage: EventMessage = {
      type: 'response',
      payload,
      isResponse: true,
      responseToMessageId: messageId,
    };

    this.postMessageToWebView(responseMessage);
  }

  /**
   * Generates a unique message identifier string.
   *
   * The identifier is composed of a prefix (`msg_`), the current timestamp in milliseconds,
   * and an incremented counter to ensure uniqueness even within the same millisecond.
   *
   * @returns A unique message ID string.
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}`;
  }

  /**
   * Sends a serialized event message to the WebView component.
   *
   * This method checks if the WebView reference is available before attempting to send the message.
   * If the reference is not available, it logs a warning and returns early.
   * The message is serialized to a JSON string and sent using the WebView's `postMessage` method.
   * Any errors encountered during serialization or sending are caught and logged to the console.
   *
   * @param message - The event message object to be sent to the WebView.
   */
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

  /**
   * Emits an event to the WebView and returns a promise that resolves with the response.
   *
   * @template T - The event type, constrained to keys present in both `OutgoingEventPayloads` and `IncomingEventResponses`.
   * @param eventType - The type of event to emit.
   * @param payload - The payload associated with the event.
   * @returns A promise that resolves with the response for the emitted event.
   *
   * @throws {Error} If the response is not received within 30 seconds, the promise is rejected with a timeout error.
   */
  public emit<
    T extends keyof OutgoingEventPayloads & keyof IncomingEventResponses,
  >(
    eventType: T,
    payload: OutgoingEventPayloads[T],
  ): Promise<IncomingEventResponses[T]> {
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
      }, this.TIMEOUT_MS);
    });
  }

  /**
   * Subscribes to a specific event type, registering a callback to be invoked when the event is emitted.
   *
   * @template T - The event type, constrained to keys of both `IncomingEventPayloads` and `OutgoingEventResponses`.
   * @param eventType - The type of event to subscribe to.
   * @param callback - An asynchronous function that handles the event payload and returns a response.
   * @returns A cleanup function that unsubscribes the callback from the event type.
   */
  public subscribe<
    T extends keyof IncomingEventPayloads & keyof OutgoingEventResponses,
  >(
    eventType: T,
    callback: (
      payload: IncomingEventPayloads[T],
    ) => Promise<OutgoingEventResponses[T]>,
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

  /**
   * Unsubscribes a callback from a specific event type.
   *
   * Removes the provided callback from the set of subscribers for the given event type.
   * If there are no more subscribers for the event type after removal, the event type is deleted from the internal subscribers map.
   *
   * @typeParam T - The event type, constrained to keys present in both IncomingEventPayloads and OutgoingEventResponses.
   * @param eventType - The type of event to unsubscribe from.
   * @param callback - The callback function to remove, which handles the event payload and returns a promise of the event response.
   */
  public unsubscribe<
    T extends keyof IncomingEventPayloads & keyof OutgoingEventResponses,
  >(
    eventType: T,
    callback: (
      payload: IncomingEventPayloads[T],
    ) => Promise<OutgoingEventResponses[T]>,
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

  /**
   * Cleans up the event bus by removing all subscribers and clearing any pending requests.
   * This method should be called when the event bus is no longer needed to prevent memory leaks.
   */
  public destroy(): void {
    // Limpiar listeners y pendientes
    this.subscribers.clear();
    this.pendingRequests.clear();
  }
}

/**
 * Custom React hook that provides an instance of `EventBus` tied to a given WebView reference.
 *
 * - Initializes the `EventBus` when the component mounts or when the `webViewRef` changes.
 * - Cleans up the `EventBus` instance when the component unmounts.
 * - Updates the `EventBus` with the latest `webViewRef` whenever it changes.
 *
 * @param webViewRef - Optional reference to a WebView component.
 * @returns The current `EventBus` instance, or `null` if not initialized.
 */
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

export type { EventBus as EventBusType };
export default EventBus;
