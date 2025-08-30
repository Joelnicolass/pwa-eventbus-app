// === EVENTBUS PARA PWA ===
class PWAEventBus {
  constructor() {
    this.subscribers = new Map();
    this.pendingRequests = new Map();
    this.messageIdCounter = 0;
    this.TIMEOUT_MS = 30000; // Timeout de 30 segundos
    this.DEBUG_MODE = true; // Activar logs en desarrollo

    this.log('PWAEventBus inicializado');
    this.setupMessageListeners();
  }

  /**
   * Configura los listeners para mensajes de React Native WebView
   */
  setupMessageListeners() {
    this.log('Configurando listeners de mensajes...');

    // Listener principal para mensajes
    window.addEventListener('message', this.handleMessage.bind(this));

    // Listener adicional para document (fallback)
    document.addEventListener('message', this.handleMessage.bind(this));

    // Listener global (fallback)
    window.onmessage = this.handleMessage.bind(this);

    this.log(
      `Entorno detectado: ${
        window.ReactNativeWebView
          ? 'React Native WebView'
          : 'Browser/Development'
      }`,
    );
  }

  /**
   * Maneja todos los mensajes entrantes
   */
  handleMessage(event) {
    try {
      const messageData = this.extractMessageData(event);
      if (!messageData) return;

      const message = this.parseMessage(messageData);
      if (!message) return;

      this.log('Mensaje recibido:', message);

      if (message.isResponse && message.responseToMessageId) {
        this.handleResponse(message);
      } else {
        this.handleIncomingEvent(message);
      }
    } catch (error) {
      this.logError('Error manejando mensaje:', error);
    }
  }

  /**
   * Extrae los datos del mensaje del evento
   */
  extractMessageData(event) {
    if (event.data) return event.data;
    if (event.detail) return event.detail;
    return null;
  }

  /**
   * Parsea el mensaje de string a objeto
   */
  parseMessage(messageData) {
    try {
      if (typeof messageData === 'string') {
        return JSON.parse(messageData);
      } else if (typeof messageData === 'object') {
        return messageData;
      }
      return null;
    } catch (parseError) {
      this.logError('Error parseando mensaje:', parseError);
      return null;
    }
  }

  /**
   * Maneja respuestas a mensajes enviados anteriormente
   */
  handleResponse(message) {
    this.log(
      `Respuesta recibida para mensaje ID: ${message.responseToMessageId}`,
    );

    const pendingRequest = this.pendingRequests.get(
      message.responseToMessageId,
    );
    if (pendingRequest) {
      pendingRequest.resolve(message.payload);
      this.pendingRequests.delete(message.responseToMessageId);
      this.log(
        `Solicitud pendiente resuelta para ID: ${message.responseToMessageId}`,
      );
    } else {
      this.logError(
        `No se encontró solicitud pendiente para ID: ${message.responseToMessageId}`,
      );
    }
  }

  /**
   * Maneja eventos entrantes y ejecuta callbacks suscritos
   */
  async handleIncomingEvent(message) {
    const subscribers = this.subscribers.get(message.type);

    if (!subscribers || subscribers.size === 0) {
      this.log(`No hay suscriptores para el evento: ${message.type}`);
      return;
    }

    this.log(
      `Ejecutando ${subscribers.size} suscriptor(es) para evento: ${message.type}`,
    );

    try {
      const promises = Array.from(subscribers).map(callback =>
        callback(message.payload),
      );
      const responses = await Promise.all(promises);
      const response = responses[0]; // Tomar la primera respuesta

      if (message.messageId) {
        this.log(`Enviando respuesta para mensaje ID: ${message.messageId}`);
        this.sendResponse(message.messageId, response);
      }
    } catch (error) {
      this.logError(
        `Error ejecutando suscriptores para ${message.type}:`,
        error,
      );

      if (message.messageId) {
        this.sendResponse(message.messageId, {
          code: 'HANDLER_ERROR',
          message: error.message,
          details: error.toString(),
        });
      }
    }
  }

  /**
   * Envía una respuesta a React Native
   */
  sendResponse(messageId, payload) {
    const responseMessage = {
      type: 'response',
      payload,
      isResponse: true,
      responseToMessageId: messageId,
    };

    this.log(`Enviando respuesta para ID: ${messageId}`, responseMessage);
    this.postMessageToReactNative(responseMessage);
  }

  /**
   * Genera un ID único para cada mensaje
   */
  generateMessageId() {
    return `pwa_${Date.now()}_${++this.messageIdCounter}`;
  }

  /**
   * Envía un mensaje a React Native WebView
   */
  postMessageToReactNative(message) {
    try {
      const messageString = JSON.stringify(message);

      if (window.ReactNativeWebView) {
        this.log('Enviando mensaje via ReactNativeWebView');
        window.ReactNativeWebView.postMessage(messageString);
      } else {
        this.log('Enviando mensaje via window.parent (fallback)');
        window.parent.postMessage(messageString, '*');
      }
    } catch (error) {
      this.logError('Error enviando mensaje a React Native:', error);
      throw error;
    }
  }

  /**
   * Emite un evento y espera una respuesta
   */
  emit(eventType, payload) {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();

      this.log(`Emitiendo evento: ${eventType} con ID: ${messageId}`, payload);

      this.pendingRequests.set(messageId, { resolve, reject });

      const message = {
        type: eventType,
        payload,
        messageId,
      };

      this.postMessageToReactNative(message);

      // Timeout de 30 segundos
      setTimeout(() => {
        if (this.pendingRequests.has(messageId)) {
          this.pendingRequests.delete(messageId);
          const error = new Error(
            `Timeout esperando respuesta para ${eventType} (ID: ${messageId})`,
          );
          this.logError('Timeout:', error);
          reject(error);
        }
      }, this.TIMEOUT_MS);
    });
  }

  /**
   * Se suscribe a un tipo de evento
   */
  subscribe(eventType, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback debe ser una función');
    }

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType).add(callback);
    this.log(
      `Suscrito a evento: ${eventType}. Total suscriptores: ${
        this.subscribers.get(eventType).size
      }`,
    );

    // Retorna función para desuscribirse
    return () => {
      this.unsubscribe(eventType, callback);
    };
  }

  /**
   * Se desuscribe de un tipo de evento
   */
  unsubscribe(eventType, callback) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.delete(callback);
      this.log(
        `Desuscrito de evento: ${eventType}. Suscriptores restantes: ${subscribers.size}`,
      );

      if (subscribers.size === 0) {
        this.subscribers.delete(eventType);
        this.log(`Sin suscriptores para ${eventType}, eliminando grupo`);
      }
    }
  }

  /**
   * Métodos de logging
   */
  log(message, data = null) {
    if (this.DEBUG_MODE) {
      const timestamp = new Date().toISOString();
      if (data) {
        console.log('[PWAEventBus ' + timestamp + '] ' + message, data);
      } else {
        console.log('[PWAEventBus ' + timestamp + '] ' + message);
      }
    }
  }

  logError(message, error = null) {
    const timestamp = new Date().toISOString();
    if (error) {
      console.error('[PWAEventBus ERROR ' + timestamp + '] ' + message, error);
    } else {
      console.error('[PWAEventBus ERROR ' + timestamp + '] ' + message);
    }
  }

  /**
   * Obtiene estadísticas del EventBus
   */
  getStats() {
    return {
      subscribersCount: this.subscribers.size,
      pendingRequestsCount: this.pendingRequests.size,
      messageIdCounter: this.messageIdCounter,
      eventTypes: Array.from(this.subscribers.keys()),
    };
  }
}

// Exponer la clase globalmente
window.PWAEventBus = PWAEventBus;
