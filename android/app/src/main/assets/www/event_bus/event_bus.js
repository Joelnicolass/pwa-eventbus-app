// === CLASE EVENTBUS PARA PWA ===
class PWAEventBus {
  constructor() {
    this.subscribers = new Map();
    this.pendingRequests = new Map();
    this.messageIdCounter = 0;

    // Múltiples listeners para diferentes entornos
    this.setupMessageListeners();
  }

  setupMessageListeners() {
    // Listener para React Native WebView
    if (window.ReactNativeWebView) {
      // Para React Native, usar el objeto global
      window.addEventListener('message', this.handleMessage.bind(this));
    } else {
      // Fallback para desarrollo/testing
      window.addEventListener('message', this.handleMessage.bind(this));
    }

    // Listener adicional para document
    document.addEventListener('message', this.handleMessage.bind(this));

    // Listener global para capturar todos los mensajes
    window.onmessage = this.handleMessage.bind(this);

    // Debug: Mostrar todos los eventos de mensaje
    const originalAddEventListener = window.addEventListener;

    window.addEventListener = function (type, listener, options) {
      if (type === 'message') {
        // Envolver el listener para logging
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  handleMessage(event) {
    try {
      let messageData;

      // Intentar múltiples formas de extraer los datos
      if (event.data) {
        messageData = event.data;
      } else if (event.detail) {
        messageData = event.detail;
      } else {
        return;
      }

      // Parsear el mensaje
      let message;
      if (typeof messageData === 'string') {
        try {
          message = JSON.parse(messageData);
        } catch (parseError) {
          return;
        }
      } else if (typeof messageData === 'object') {
        message = messageData;
      } else {
        return;
      }

      if (message.isResponse && message.responseToMessageId) {
        this.handleResponse(message);
      } else {
        this.handleIncomingEvent(message);
      }
    } catch (error) {
      // Manejo de errores
    }
  }

  handleResponse(message) {
    const pendingRequest = this.pendingRequests.get(
      message.responseToMessageId,
    );
    if (pendingRequest) {
      pendingRequest.resolve(message.payload);
      this.pendingRequests.delete(message.responseToMessageId);
    }
  }

  async handleIncomingEvent(message) {
    const subscribers = this.subscribers.get(message.type);
    if (subscribers && subscribers.size > 0) {
      try {
        const promises = Array.from(subscribers).map(callback =>
          callback(message.payload),
        );

        const responses = await Promise.all(promises);
        const response = responses[0]; // Tomar la primera respuesta

        if (message.messageId) {
          this.sendResponse(message.messageId, response);
        }
      } catch (error) {
        if (message.messageId) {
          this.sendResponse(message.messageId, {
            code: 'HANDLER_ERROR',
            message: error.message,
            details: error,
          });
        }
      }
    } else {
      // No hay suscriptores para este evento
    }
  }

  sendResponse(messageId, payload) {
    const responseMessage = {
      type: 'response',
      payload,
      isResponse: true,
      responseToMessageId: messageId,
    };

    this.postMessageToReactNative(responseMessage);
  }

  generateMessageId() {
    return `pwa_${Date.now()}_${++this.messageIdCounter}`;
  }

  postMessageToReactNative(message) {
    try {
      const messageString = JSON.stringify(message);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(messageString);
      } else {
        // Fallback para development/testing
        window.parent.postMessage(messageString, '*');
      }
    } catch (error) {
      // Manejo de errores al enviar el mensaje
    }
  }

  emit(eventType, payload) {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();

      this.pendingRequests.set(messageId, { resolve, reject });

      const message = {
        type: eventType,
        payload,
        messageId,
      };

      this.postMessageToReactNative(message);

      setTimeout(() => {
        if (this.pendingRequests.has(messageId)) {
          this.pendingRequests.delete(messageId);
          reject(new Error(`Timeout waiting for response to ${eventType}`));
        }
      }, 30000);
    });
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType).add(callback);

    return () => {
      this.unsubscribe(eventType, callback);
    };
  }

  unsubscribe(eventType, callback) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(eventType);
      }
    }
  }
}

// Hacer la clase disponible globalmente
window.PWAEventBus = PWAEventBus;
