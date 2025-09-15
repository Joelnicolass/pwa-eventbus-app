/**
 * PWA EventBus Mock - Sistema de Desarrollo
 *
 * Este mock permite a los desarrolladores de PWA trabajar de forma independiente
 * sin necesidad del wrapper de React Native, simulando respuestas realistas.
 *
 * @author Joel Sartori
 * @version 1.0.0
 * @since 2025-09-08
 */

/**
 * 🎭 PWAEventBus Mock - Framework de Desarrollo
 *
 * Esta clase simula el comportamiento del PWAEventBus real, proporcionando
 * respuestas predefinidas y configurables para desarrollo local.
 *
 * ✨ CARACTERÍSTICAS DEL MOCK:
 * • Respuestas predefinidas para todos los tipos de eventos
 * • Simulación de delays realistas (200-1000ms)
 * • Configuración de respuestas personalizadas
 * • Modo de error simulado para testing
 * • Logging detallado para debugging
 * • Auto-detección de entorno de desarrollo
 * • Compatible con la API del PWAEventBus real
 *
 * 🎯 EJEMPLO DE USO:
 * ```javascript
 * const eventBus = new PWAEventBusMock();
 *
 * // Configurar respuesta personalizada
 * eventBus.setMockResponse('CUSTOM_EVENT', {
 *   customData: 'test'
 * });
 *
 * // Usar normalmente
 * const response = await eventBus.emit('GET_DEVICE_INFO');
 * console.log(response); // Datos simulados del dispositivo
 * ```
 */
class PWAEventBusMock {
  constructor() {
    /** @private {Map<string, Set<Function>>} Mapa de suscriptores por tipo de evento */
    this.subscribers = new Map();

    /** @private {Map<string, any>} Respuestas mock personalizadas */
    this.mockResponses = new Map();

    /** @private {number} Contador para generar IDs únicos de mensaje */
    this.messageIdCounter = 0;

    /** @private {boolean} Simular errores aleatoriamente */
    this.simulateErrors = false;

    /** @private {number} Probabilidad de error (0-1) */
    this.errorProbability = 0.1;

    /** @private {number} Delay mínimo en ms */
    this.minDelay = 200;

    /** @private {number} Delay máximo en ms */
    this.maxDelay = 1000;

    this.log('🎭 PWAEventBus Mock inicializado para desarrollo');
    this.setupDefaultResponses();
  }

  // ========================================
  // 🎯 CONFIGURACIÓN DE RESPUESTAS MOCK
  // ========================================

  /**
   * Configura respuestas predefinidas para eventos comunes.
   * @private
   */
  setupDefaultResponses() {
    // === 📱 DISPOSITIVO ===
    this.mockResponses.set('get_device_info', {
      deviceId: 'mock-device-12345',
      platform: 'ios',
      version: '17.0',
      model: 'iPhone 15 Pro',
      manufacturer: 'Apple',
      brand: 'Apple',
      systemName: 'iOS',
      systemVersion: '17.0',
      buildNumber: '21A5326a',
      bundleId: 'com.orbith.pocorbith',
      appVersion: '1.0.0',
      batteryLevel: 0.75,
      isEmulator: true,
    });

    this.mockResponses.set('get_battery_status', {
      level: 0.75,
      isCharging: false,
      chargingTime: null,
      dischargingTime: 14400, // 4 horas
    });

    this.mockResponses.set('get_network_status', {
      isConnected: true,
      connectionType: 'wifi',
      isInternetReachable: true,
      details: {
        isWifiEnabled: true,
        ssid: 'MockWiFi-5G',
      },
    });

    // === 🔐 PERMISOS ===
    this.mockResponses.set('camera_permission_request', {
      granted: true,
      canAskAgain: true,
      status: 'granted',
    });

    this.mockResponses.set('location_permission_request', {
      granted: true,
      canAskAgain: true,
      status: 'granted',
      accuracy: 'high',
    });

    this.mockResponses.set('microphone_permission_request', {
      granted: true,
      canAskAgain: true,
      status: 'granted',
    });

    // === 📍 GEOLOCALIZACIÓN ===
    this.mockResponses.set('get_location', {
      latitude: 40.7128,
      longitude: -74.006,
      altitude: 10,
      accuracy: 5,
      altitudeAccuracy: 3,
      heading: 45,
      speed: 0,
      timestamp: Date.now(),
    });

    // === 📷 CÁMARA Y MULTIMEDIA ===
    this.mockResponses.set('take_photo', {
      uri: 'file:///mock/path/photo_12345.jpg',
      width: 1920,
      height: 1080,
      fileSize: 2048000,
      type: 'image/jpeg',
      fileName: 'photo_12345.jpg',
    });

    this.mockResponses.set('pick_image', {
      uri: 'file:///mock/path/selected_image.jpg',
      width: 1024,
      height: 768,
      fileSize: 1024000,
      type: 'image/jpeg',
      fileName: 'selected_image.jpg',
    });

    this.mockResponses.set('record_video', {
      uri: 'file:///mock/path/video_12345.mp4',
      duration: 15000,
      fileSize: 10240000,
      type: 'video/mp4',
      fileName: 'video_12345.mp4',
    });

    // === 💾 STORAGE ===
    this.mockResponses.set('set_in_local_storage', {
      success: true,
      key: null, // Se establecerá dinámicamente
      message: 'Datos guardados exitosamente',
    });

    this.mockResponses.set('get_from_local_storage', {
      success: true,
      key: null, // Se establecerá dinámicamente
      value: null, // Se establecerá dinámicamente
      found: true,
    });

    this.mockResponses.set('clear_local_storage', {
      success: true,
      itemsCleared: 5,
      message: 'Storage limpiado exitosamente',
    });

    // === 🌐 HTTP ===
    this.mockResponses.set('http_request', {
      status: 200,
      statusText: 'OK',
      data: { message: 'Mock HTTP response', timestamp: Date.now() },
      headers: {
        'content-type': 'application/json',
        'x-mock': 'true',
      },
    });

    // === 🔔 NOTIFICACIONES ===
    this.mockResponses.set('send_local_notification', {
      success: true,
      notificationId: 'mock-notification-12345',
      message: 'Notificación enviada exitosamente',
    });

    // === 🔗 COMPARTIR ===
    this.mockResponses.set('share_content', {
      success: true,
      activityType: 'com.apple.UIKit.activity.Message',
      message: 'Contenido compartido exitosamente',
    });

    // === 📳 HÁPTICOS ===
    this.mockResponses.set('vibrate', {
      success: true,
      message: 'Vibración ejecutada',
    });

    this.mockResponses.set('haptic_feedback', {
      success: true,
      type: 'impact',
      message: 'Feedback háptico ejecutado',
    });

    // === 🚀 INICIALIZACIÓN ===
    this.mockResponses.set('native_ready', {
      ready: true,
      timestamp: Date.now(),
      version: '1.0.0',
    });

    this.mockResponses.set('SHOW_NAME', {
      data: {
        message: 'Gacieeela',
      },
    });

    this.log('✅ Respuestas mock predefinidas configuradas');
  }

  // ========================================
  // 🛠️ API DE CONFIGURACIÓN PARA DESARROLLADORES
  // ========================================

  /**
   * Configura una respuesta personalizada para un tipo de evento.
   * @param {string} eventType - Tipo de evento
   * @param {any} response - Respuesta a devolver
   */
  setMockResponse(eventType, response) {
    this.mockResponses.set(eventType, response);
    this.log(`🎯 Respuesta mock configurada para: ${eventType}`, response);
  }

  /**
   * Configura múltiples respuestas mock de una vez.
   * @param {Object} responses - Objeto con eventType: response
   */
  setMockResponses(responses) {
    Object.entries(responses).forEach(([eventType, response]) => {
      this.setMockResponse(eventType, response);
    });
  }

  /**
   * Habilita/deshabilita la simulación de errores.
   * @param {boolean} enabled - Si simular errores
   * @param {number} probability - Probabilidad de error (0-1)
   */
  setErrorSimulation(enabled, probability = 0.1) {
    this.simulateErrors = enabled;
    this.errorProbability = probability;
    this.log(
      `🎭 Simulación de errores: ${enabled ? 'habilitada' : 'deshabilitada'} (${
        probability * 100
      }%)`,
    );
  }

  /**
   * Configura el rango de delays para simular latencia real.
   * @param {number} min - Delay mínimo en ms
   * @param {number} max - Delay máximo en ms
   */
  setDelayRange(min, max) {
    this.minDelay = min;
    this.maxDelay = max;
    this.log(`⏱️ Rango de delay configurado: ${min}-${max}ms`);
  }

  // ========================================
  // 🚀 API PÚBLICA (Compatible con PWAEventBus)
  // ========================================

  /**
   * Emite un evento y simula la respuesta de React Native.
   * @param {string} eventType - Tipo de evento
   * @param {any} payload - Datos del evento
   * @returns {Promise<any>} Promise con la respuesta simulada
   */
  async emit(eventType, payload) {
    this.log(`🚀 [MOCK] Emitiendo evento: ${eventType}`, payload);

    // Simular delay realista
    const delay =
      Math.random() * (this.maxDelay - this.minDelay) + this.minDelay;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simular error si está habilitado
    if (this.simulateErrors && Math.random() < this.errorProbability) {
      const error = new Error(`Mock error para evento: ${eventType}`);
      this.logError('❌ [MOCK] Error simulado:', error);
      throw error;
    }

    // Obtener respuesta mock
    let response = this.mockResponses.get(eventType);

    if (!response) {
      this.log(
        `⚠️ [MOCK] No hay respuesta predefinida para: ${eventType}, usando respuesta genérica`,
      );
      response = {
        success: true,
        message: `Mock response para ${eventType}`,
        timestamp: Date.now(),
        mockData: true,
      };
    }

    // Personalizar respuesta basada en payload
    response = this.customizeResponse(eventType, payload, response);

    this.log(`✅ [MOCK] Respuesta para ${eventType}:`, response);
    return response;
  }

  /**
   * Se suscribe a eventos (compatible con PWAEventBus).
   * @param {string} eventType - Tipo de evento
   * @param {Function} callback - Callback a ejecutar
   * @returns {Function} Función de desuscripción
   */
  subscribe(eventType, callback) {
    if (typeof callback !== 'function') {
      throw new Error('❌ El callback debe ser una función');
    }

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType).add(callback);
    this.log(`📡 [MOCK] Suscrito a evento: ${eventType}`);

    return () => {
      this.unsubscribe(eventType, callback);
    };
  }

  /**
   * Cancela suscripción a evento.
   * @param {string} eventType - Tipo de evento
   * @param {Function} callback - Callback a remover
   */
  unsubscribe(eventType, callback) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.delete(callback);
      this.log(`❌ [MOCK] Desuscrito de evento: ${eventType}`);
    }
  }

  /**
   * Simula un evento entrante desde React Native.
   * Útil para testing de suscriptores.
   * @param {string} eventType - Tipo de evento
   * @param {any} payload - Datos del evento
   */
  async simulateIncomingEvent(eventType, payload) {
    this.log(`📨 [MOCK] Simulando evento entrante: ${eventType}`, payload);

    const subscribers = this.subscribers.get(eventType);
    if (!subscribers || subscribers.size === 0) {
      this.log(`⚠️ [MOCK] No hay suscriptores para: ${eventType}`);
      return;
    }

    // Ejecutar todos los callbacks
    const promises = Array.from(subscribers).map(callback => callback(payload));
    await Promise.all(promises);
  }

  // ========================================
  // 🛠️ UTILIDADES INTERNAS
  // ========================================

  /**
   * Personaliza la respuesta basada en el payload.
   * @private
   */
  customizeResponse(eventType, payload, baseResponse) {
    const response = { ...baseResponse };

    switch (eventType) {
      case 'set_in_local_storage':
        if (payload?.key) {
          response.key = payload.key;
        }
        break;

      case 'get_from_local_storage':
        if (payload?.key) {
          response.key = payload.key;
          response.value = `mock_value_for_${payload.key}`;
        }
        break;

      case 'http_request':
        if (payload?.url) {
          response.data.requestedUrl = payload.url;
          response.data.method = payload.method || 'GET';
        }
        break;

      case 'take_photo':
        if (payload?.quality) {
          response.quality = payload.quality;
        }
        break;
    }

    return response;
  }

  /**
   * Obtiene estadísticas del mock.
   * @returns {Object} Estadísticas
   */
  getStats() {
    return {
      mockMode: true,
      subscribersCount: this.subscribers.size,
      mockResponsesCount: this.mockResponses.size,
      errorSimulation: this.simulateErrors,
      delayRange: `${this.minDelay}-${this.maxDelay}ms`,
      eventTypes: Array.from(this.subscribers.keys()),
      availableMocks: Array.from(this.mockResponses.keys()),
    };
  }

  /**
   * Logging para desarrollo.
   * @private
   */
  log(message, data = null) {
    console.log(`🎭 [EventBus Mock] ${message}`, data || '');
  }

  /**
   * Error logging para desarrollo.
   * @private
   */
  logError(message, error = null) {
    console.error(`🎭 [EventBus Mock] ${message}`, error || '');
  }
}

// ========================================
// 🎯 FACTORY PARA AUTO-DETECCIÓN
// ========================================

/**
 * Factory que detecta automáticamente el entorno y retorna
 * el EventBus apropiado (real o mock).
 */
class PWAEventBusFactory {
  /**
   * Crea la instancia apropiada del EventBus.
   * @param {boolean} forceMock - Forzar uso del mock
   * @returns {PWAEventBus|PWAEventBusMock} Instancia del EventBus
   */
  static create(forceMock = false) {
    const isDevelopment =
      !window.ReactNativeWebView ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      forceMock;

    if (isDevelopment) {
      console.log('🎭 Usando PWAEventBus Mock para desarrollo');
      return new PWAEventBusMock();
    } else {
      console.log('🌉 Usando PWAEventBus real');
      // Verificar que PWAEventBus esté disponible
      if (typeof window.PWAEventBus !== 'undefined') {
        return new window.PWAEventBus();
      } else {
        console.warn(
          '⚠️ PWAEventBus no está disponible, usando Mock como fallback',
        );
        return new PWAEventBusMock();
      }
    }
  }
}

// ========================================
// 🌍 EXPOSICIÓN GLOBAL
// ========================================

window.PWAEventBusMock = PWAEventBusMock;
window.PWAEventBusFactory = PWAEventBusFactory;

// Crear instancia global para desarrollo rápido
window.eventBusMock = new PWAEventBusMock();
