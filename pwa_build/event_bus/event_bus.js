/**
 * EventBus for Progressive Web App (PWA)
 *
 * Manages bidirectional event-based communication between a Progressive Web App
 * and its containing React Native application through the WebView.
 *
 * @author Joel Sartori
 * @version 1.0.0
 * @since 2025-08-30
 */

/**
 * Represents a message sent through the event bus.
 *
 * @typedef {Object} EventMessage
 * @property {string} type - The event type
 * @property {*} payload - The data associated with the event
 * @property {string} [messageId] - Unique message identifier
 * @property {boolean} [isResponse] - Indicates if the message is a response
 * @property {string} [responseToMessageId] - ID of the message this responds to
 */

/**
 * 🌉 PWA EventBus - Framework de Comunicación Bidireccional
 *
 * Esta clase gestiona la comunicación entre la PWA y React Native de manera robusta y tipada.
 *
 * ✨ CARACTERÍSTICAS PRINCIPALES:
 * • Comunicación bidireccional (PWA ↔ React Native)
 * • Manejo de respuestas asíncronas con timeouts automáticos
 * • Múltiples suscripciones por tipo de evento
 * • Detección automática del entorno (WebView vs Browser)
 * • Sistema de logging detallado para debugging
 * • Manejo robusto de errores en envío y recepción
 * • Limpieza automática de memoria para prevenir leaks
 *
 * 🚀 FLUJO DE COMUNICACIÓN:
 * ```
 * [PWA] --emit--> [React Native] --response--> [PWA]
 * [React Native] --emit--> [PWA] --response--> [React Native]
 * ```
 *
 * 💡 EJEMPLO DE USO BÁSICO:
 * ```javascript
 * const eventBus = new PWAEventBus();
 *
 * // Enviar evento y esperar respuesta
 * const response = await eventBus.emit('GET_DEVICE_INFO', {
 *   includeHardware: true
 * });
 *
 * // Suscribirse a eventos desde React Native
 * const unsubscribe = eventBus.subscribe('NATIVE_READY', async (payload) => {
 *   console.log('React Native está listo:', payload);
 *   return { success: true, data: 'PWA confirmó recepción' };
 * });
 * ```
 */
class PWAEventBus {
  /**
   * Crea una nueva instancia de PWAEventBus.
   * Se configura automáticamente detectando el entorno y estableciendo listeners.
   */
  constructor() {
    /** @private {Map<string, Set<Function>>} Mapa de suscriptores por tipo de evento */
    this.subscribers = new Map();

    /** @private {Map<string, Object>} Mapa de peticiones pendientes */
    this.pendingRequests = new Map();

    /** @private {number} Contador para generar IDs únicos de mensaje */
    this.messageIdCounter = 0;

    /** @private {number} Timeout en milisegundos para esperar respuestas */
    this.TIMEOUT_MS = 30000; // 30 segundos

    /** @private {boolean} Habilitar logs en modo desarrollo */
    this.DEBUG_MODE = true;

    this.log('🌉 PWAEventBus inicializado exitosamente');
    this.setupMessageListeners();
  }

  // ========================================
  // 🔧 CONFIGURACIÓN Y MANEJO DE MENSAJES
  // ========================================

  /**
   * Configura listeners para recibir mensajes desde React Native WebView.
   * Establece múltiples listeners como fallbacks para asegurar compatibilidad.
   *
   * @private
   */
  setupMessageListeners() {
    this.log('🔌 Configurando listeners de mensajes...');

    // Listener principal para mensajes de WebView
    window.addEventListener('message', this.handleMessage.bind(this));

    // Listener adicional para document (fallback)
    document.addEventListener('message', this.handleMessage.bind(this));

    // Listener global (fallback adicional)
    window.onmessage = this.handleMessage.bind(this);

    const environment = window.ReactNativeWebView
      ? 'React Native WebView'
      : 'Browser/Development';

    this.log(`🌍 Entorno detectado: ${environment}`);
  }

  /**
   * 📨 Maneja todos los mensajes entrantes desde React Native.
   *
   * Este método es el punto de entrada principal para todos los mensajes
   * provenientes de la aplicación React Native.
   *
   * @param {Event} event - Objeto evento que contiene los datos del mensaje
   *
   * @remarks
   * - Si el mensaje es una respuesta (tiene `isResponse` y `responseToMessageId`), llama a `handleResponse`
   * - De lo contrario, trata el mensaje como un evento nuevo y llama a `handleIncomingEvent`
   * - Los errores de parsing se registran en consola pero no interrumpen la ejecución
   */
  handleMessage(event) {
    try {
      const messageData = this.extractMessageData(event);
      if (!messageData) return;

      const message = this.parseMessage(messageData);
      if (!message) return;

      this.log('📩 Mensaje recibido:', message);

      if (message.isResponse && message.responseToMessageId) {
        // Es una respuesta a un mensaje que enviamos
        this.handleResponse(message);
      } else {
        // Es un evento nuevo desde React Native
        this.handleIncomingEvent(message);
      }
    } catch (error) {
      this.logError('❌ Error manejando mensaje:', error);
    }
  }

  /**
   * Extrae los datos del mensaje del objeto evento.
   * Maneja diferentes formatos de evento y propiedades donde pueden estar los datos.
   *
   * @private
   * @param {Event} event - El objeto evento
   * @returns {*|null} Los datos del mensaje o null si no se encuentran
   */
  extractMessageData(event) {
    if (event.data) return event.data;
    if (event.detail) return event.detail;
    return null;
  }

  /**
   * Parsea el mensaje desde string JSON a objeto JavaScript.
   *
   * @private
   * @param {string|Object} messageData - Los datos del mensaje a parsear
   * @returns {Object|null} El mensaje parseado o null si hay error
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
      this.logError('❌ Error parseando mensaje:', parseError);
      return null;
    }
  }

  // ========================================
  // 🔄 MANEJO DE RESPUESTAS Y EVENTOS
  // ========================================

  /**
   * 📬 Maneja una respuesta entrante resolviendo la petición pendiente correspondiente.
   *
   * @private
   * @param {EventMessage} message - El mensaje de respuesta
   */
  handleResponse(message) {
    this.log(
      `📬 Respuesta recibida para mensaje ID: ${message.responseToMessageId}`,
    );

    const pendingRequest = this.pendingRequests.get(
      message.responseToMessageId,
    );

    if (pendingRequest) {
      pendingRequest.resolve(message.payload);
      this.pendingRequests.delete(message.responseToMessageId);
      this.log(
        `✅ Petición pendiente resuelta para ID: ${message.responseToMessageId}`,
      );
    } else {
      this.logError(
        `❌ No se encontró petición pendiente para ID: ${message.responseToMessageId}`,
      );
    }
  }

  /**
   * 🎯 Maneja un evento entrante ejecutando todos los callbacks suscritos al tipo de evento.
   * Espera a que todos los callbacks terminen y envía la primera respuesta de vuelta si hay messageId.
   * En caso de errores durante la ejecución de callbacks, envía una respuesta de error.
   *
   * @private
   * @param {EventMessage} message - El mensaje del evento
   * @returns {Promise<void>} Promesa que se resuelve cuando todos los callbacks han sido ejecutados
   */
  async handleIncomingEvent(message) {
    const subscribers = this.subscribers.get(message.type);

    if (!subscribers || subscribers.size === 0) {
      this.log(`⚠️ No hay suscriptores para el evento: ${message.type}`);
      return;
    }

    this.log(
      `🎯 Ejecutando ${subscribers.size} suscriptor(es) para evento: ${message.type}`,
    );

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
        this.log(`📤 Enviando respuesta para mensaje ID: ${message.messageId}`);
        this.sendResponse(message.messageId, response);
      }
    } catch (error) {
      this.logError(
        `❌ Error ejecutando suscriptores para ${message.type}:`,
        error,
      );

      // Enviar respuesta de error si es necesario
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
   * Envía una respuesta a React Native para un messageId específico.
   *
   * @private
   * @param {string} messageId - El ID del mensaje al que se está respondiendo
   * @param {*} payload - Los datos de respuesta
   */
  sendResponse(messageId, payload) {
    const responseMessage = {
      type: 'response',
      payload,
      isResponse: true,
      responseToMessageId: messageId,
    };

    this.log(`📤 Enviando respuesta para ID: ${messageId}`, responseMessage);
    this.postMessageToReactNative(responseMessage);
  }

  // ========================================
  // 🛠️ UTILIDADES DE COMUNICACIÓN
  // ========================================

  /**
   * Genera un identificador único de mensaje.
   * El identificador está compuesto por un prefijo ('pwa_'), timestamp actual,
   * y un contador incremental para asegurar unicidad incluso en el mismo milisegundo.
   *
   * @private
   * @returns {string} ID único de mensaje
   */
  generateMessageId() {
    return `pwa_${Date.now()}_${++this.messageIdCounter}`;
  }

  /**
   * 📡 Envía un mensaje serializado al componente React Native WebView.
   * Detecta automáticamente si está ejecutándose en un React Native WebView
   * o en un navegador estándar y usa el método de comunicación apropiado.
   *
   * @private
   * @param {EventMessage} message - El mensaje a enviar
   * @throws {Error} Si ocurre un error durante la serialización o envío
   */
  postMessageToReactNative(message) {
    try {
      const messageString = JSON.stringify(message);

      if (window.ReactNativeWebView) {
        this.log('📡 Enviando mensaje vía ReactNativeWebView');
        window.ReactNativeWebView.postMessage(messageString);
      } else {
        this.log('📡 Enviando mensaje vía window.parent (fallback)');
        window.parent.postMessage(messageString, '*');
      }
    } catch (error) {
      this.logError('❌ Error enviando mensaje a React Native:', error);
      throw error;
    }
  }

  // ========================================
  // 🚀 API PÚBLICA
  // ========================================

  /**
   * 🚀 Emite un evento a React Native y retorna una promesa que se resuelve con la respuesta.
   *
   * @param {string} eventType - El tipo de evento a emitir
   * @param {*} payload - Los datos asociados con el evento
   * @returns {Promise<*>} Promesa que se resuelve con la respuesta del evento
   *
   * @throws {Error} Si la respuesta no se recibe en 30 segundos
   *
   * @example
   * ```javascript
   * // Solicitar permisos de cámara
   * const result = await eventBus.emit('CAMERA_PERMISSION_REQUEST', {
   *   reason: "Necesitamos acceso a la cámara para tomar fotos"
   * });
   *
   * if (result.granted) {
   *   console.log("Permiso concedido");
   * }
   * ```
   */
  emit(eventType, payload) {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();

      this.log(
        `🚀 Emitiendo evento: ${eventType} con ID: ${messageId}`,
        payload,
      );

      // Guardar la promesa pendiente
      this.pendingRequests.set(messageId, { resolve, reject });

      // Crear mensaje
      const message = {
        type: eventType,
        payload,
        messageId,
      };

      // Enviar mensaje
      this.postMessageToReactNative(message);

      // Timeout para evitar promesas colgadas
      setTimeout(() => {
        if (this.pendingRequests.has(messageId)) {
          this.pendingRequests.delete(messageId);
          const error = new Error(
            `⏱️ Timeout esperando respuesta de ${eventType} (ID: ${messageId})`,
          );
          this.logError('⏱️ Timeout:', error);
          reject(error);
        }
      }, this.TIMEOUT_MS);
    });
  }

  /**
   * 📡 Se suscribe a un tipo de evento específico, registrando un callback a ser invocado
   * cuando el evento es emitido desde React Native.
   *
   * @param {string} eventType - El tipo de evento al que suscribirse
   * @param {Function} callback - Función async que maneja el payload del evento y retorna una respuesta
   * @returns {Function} Función de limpieza que cancela la suscripción
   *
   * @throws {Error} Si el callback no es una función
   *
   * @example
   * ```javascript
   * // Suscribirse a solicitudes HTTP
   * const unsubscribe = eventBus.subscribe('HTTP_REQUEST', async (request) => {
   *   const response = await fetch(request.url);
   *   return {
   *     status: response.status,
   *     data: await response.json()
   *   };
   * });
   *
   * // Limpiar cuando sea necesario
   * unsubscribe();
   * ```
   */
  subscribe(eventType, callback) {
    if (typeof callback !== 'function') {
      throw new Error('❌ El callback debe ser una función');
    }

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType).add(callback);
    this.log(
      `📡 Suscrito al evento: ${eventType}. Total suscriptores: ${
        this.subscribers.get(eventType).size
      }`,
    );

    // Retornar función de desuscripción
    return () => {
      this.unsubscribe(eventType, callback);
    };
  }

  /**
   * ❌ Cancela la suscripción de un callback de un tipo de evento específico.
   *
   * @param {string} eventType - El tipo de evento del que desuscribirse
   * @param {Function} callback - El callback a remover
   */
  unsubscribe(eventType, callback) {
    const subscribers = this.subscribers.get(eventType);

    if (subscribers) {
      subscribers.delete(callback);
      this.log(
        `❌ Desuscrito del evento: ${eventType}. Suscriptores restantes: ${subscribers.size}`,
      );

      // Limpiar el Set si está vacío
      if (subscribers.size === 0) {
        this.subscribers.delete(eventType);
        this.log(`🗑️ No hay suscriptores para ${eventType}, removiendo grupo`);
      }
    }
  }

  // ========================================
  // 📊 UTILIDADES DE LOGGING Y DEBUGGING
  // ========================================

  /**
   * Registra un mensaje informativo en la consola.
   *
   * @private
   * @param {string} message - El mensaje a registrar
   * @param {*} [data=null] - Datos adicionales opcionales
   */
  log(message, data = null) {
    // Logging deshabilitado
    return;
  }

  /**
   * Registra un mensaje de error en la consola.
   *
   * @private
   * @param {string} message - El mensaje de error
   * @param {Error} [error=null] - Objeto error opcional
   */
  logError(message, error = null) {
    // Error logging deshabilitado
    return;
  }

  /**
   * 📊 Obtiene estadísticas sobre el estado actual del EventBus.
   * Útil para debugging y monitoreo del estado interno del event bus.
   *
   * @returns {Object} Objeto con estadísticas del EventBus
   * @returns {number} returns.subscribersCount - Número de tipos de evento con suscriptores
   * @returns {number} returns.pendingRequestsCount - Número de peticiones pendientes
   * @returns {number} returns.messageIdCounter - Contador actual de ID de mensaje
   * @returns {string[]} returns.eventTypes - Array de tipos de evento suscritos
   *
   * @example
   * ```javascript
   * const stats = eventBus.getStats();
   * console.log(`Suscriptores activos: ${stats.subscribersCount}`);
   * console.log(`Peticiones pendientes: ${stats.pendingRequestsCount}`);
   * ```
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

// ========================================
// 🏷️ DEFINICIÓN DE TIPOS DE EVENTOS
// ========================================

/**
 * 🏷️ Constantes que definen los tipos de eventos disponibles para comunicación
 * entre la PWA y React Native.
 *
 * Mantiene sincronización con los tipos definidos en la aplicación React Native.
 *
 * 💡 CATEGORÍAS DE EVENTOS:
 * • 🌐 HTTP: Solicitudes web
 * • 🚀 Inicialización: Eventos de startup
 * • 🔐 Permisos: Solicitudes de permisos del sistema
 * • 💾 Cache: Manejo de storage local
 * • 📷 Multimedia: Cámara y archivos
 * • 📍 Geolocalización: Ubicación y tracking
 * • 📁 Archivos: Manejo del filesystem
 * • 🔔 Notificaciones: Alerts y push notifications
 * • 📱 Dispositivo: Info del hardware y sistema
 * • 📳 Hápticos: Vibración y feedback
 * • 🔗 Compartir: Funciones de sharing
 * • 🎯 Personalizados: Eventos custom de la app
 */
class EventTypes {
  // === 🌐 SOLICITUDES HTTP ===
  static HTTP_REQUEST = 'http_request';

  // === 🚀 EVENTOS DE INICIALIZACIÓN ===
  static PWA_READY = 'pwa_ready';
  static NATIVE_READY = 'native_ready';

  // === 🔐 PERMISOS ===
  static CAMERA_PERMISSION_REQUEST = 'camera_permission_request';
  static LOCATION_PERMISSION_REQUEST = 'location_permission_request';
  static MICROPHONE_PERMISSION_REQUEST = 'microphone_permission_request';
  static STORAGE_PERMISSION_REQUEST = 'storage_permission_request';
  static CONTACTS_PERMISSION_REQUEST = 'contacts_permission_request';

  // === 💾 CACHE Y STORAGE ===
  static SET_IN_LOCAL_STORAGE = 'set_in_local_storage';
  static GET_FROM_LOCAL_STORAGE = 'get_from_local_storage';
  static DELETE_FROM_LOCAL_STORAGE = 'delete_from_local_storage';
  static CLEAR_LOCAL_STORAGE = 'clear_local_storage';

  // === 📷 CÁMARA Y MULTIMEDIA ===
  static TAKE_PHOTO = 'take_photo';
  static RECORD_VIDEO = 'record_video';
  static PICK_IMAGE = 'pick_image';
  static PICK_VIDEO = 'pick_video';

  // === 📍 GEOLOCALIZACIÓN ===
  static GET_LOCATION = 'get_location';
  static START_LOCATION_TRACKING = 'start_location_tracking';
  static STOP_LOCATION_TRACKING = 'stop_location_tracking';
  static LOCATION_UPDATE = 'location_update';

  // === 📁 ARCHIVOS Y STORAGE ===
  static SAVE_FILE = 'save_file';
  static READ_FILE = 'read_file';
  static DELETE_FILE = 'delete_file';
  static LIST_FILES = 'list_files';

  // === 🔔 NOTIFICACIONES ===
  static SEND_LOCAL_NOTIFICATION = 'send_local_notification';
  static REGISTER_PUSH_NOTIFICATIONS = 'register_push_notifications';

  // === 📱 DISPOSITIVO ===
  static GET_DEVICE_INFO = 'get_device_info';
  static GET_BATTERY_STATUS = 'get_battery_status';
  static GET_NETWORK_STATUS = 'get_network_status';

  // === 📳 VIBRACIÓN Y HÁPTICOS ===
  static VIBRATE = 'vibrate';
  static HAPTIC_FEEDBACK = 'haptic_feedback';

  // === 🔗 COMPARTIR ===
  static SHARE_CONTENT = 'share_content';
  static SHARE_FILE = 'share_file';

  // === 🎯 EVENTOS PERSONALIZADOS ===
  static CUSTOM_EVENT = 'custom_event';
  static PWA_CUSTOM_EVENT = 'pwa_custom_event';

  // === 🧪 TESTING ===
  static TEST = 'test';
}

// ========================================
// 🌍 EXPOSICIÓN GLOBAL
// ========================================

// Exponer clases globalmente para uso en la PWA
window.PWAEventBus = PWAEventBus;
window.EventTypes = EventTypes;

// Framework listo para usar (sin logs)
