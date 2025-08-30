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
 * Manages bidirectional event-based communication between a Progressive Web App (PWA)
 * and a React Native application running as the WebView container.
 *
 * The `PWAEventBus` provides a robust mechanism for message exchange between the PWA
 * code and the native application, enabling both event emission and asynchronous
 * response reception.
 *
 * ### Key Features:
 * - **Bidirectional communication**: Sends events from PWA to Native and vice versa
 * - **Response handling**: Allows waiting for asynchronous responses with automatic timeouts
 * - **Multiple subscriptions**: Multiple handlers can subscribe to the same event type
 * - **Automatic environment detection**: Works in both WebView and browser environments
 * - **Logging system**: Detailed logs for debugging and monitoring
 * - **Error handling**: Captures and handles errors in both sending and receiving
 * - **Automatic memory management**: Automatic cleanup to prevent memory leaks
 *
 * ### Communication Flow:
 * ```
 * [PWA] --emit--> [React Native] --response--> [PWA]
 * [React Native] --emit--> [PWA] --response--> [React Native]
 * ```
 *
 * ### Usage Examples:
 *
 * **Send an event and wait for response:**
 * ```javascript
 * const eventBus = new PWAEventBus();
 *
 * // Request device information
 * const deviceInfo = await eventBus.emit('GET_DEVICE_INFO', {
 *   includeHardware: true
 * });
 *
 * console.log('Device information:', deviceInfo);
 * ```
 *
 * ### Automatic Setup:
 * The EventBus configures itself automatically when instantiated, detecting whether it's
 * running inside a React Native WebView or in a standard browser, and adjusting its
 * communication behavior accordingly.
 *
 * @remarks
 * - All event handlers are asynchronous and can return promises
 * - Responses are associated with requests using unique message IDs
 * - If no response is received within 30 seconds, the promise is rejected with timeout
 * - Designed specifically for PWA environments with WebView communication
 * - Supports multiple subscribers per event type
 * - Automatic JSON serialization/deserialization handling
 * - Configurable logging system for development and production
 */
class PWAEventBus {
  /**
   * Creates a new instance of PWAEventBus.
   *
   * Automatically configures message listeners and detects the execution environment.
   */
  constructor() {
    /** @private {Map<string, Set<Function>>} Map of subscribers by event type */
    this.subscribers = new Map();

    /** @private {Map<string, Object>} Map of pending requests */
    this.pendingRequests = new Map();

    /** @private {number} Counter to generate unique message IDs */
    this.messageIdCounter = 0;

    /** @private {number} Timeout in milliseconds to wait for responses */
    this.TIMEOUT_MS = 30000; // 30 seconds

    /** @private {boolean} Enable logs in development mode */
    this.DEBUG_MODE = true;

    this.log('PWAEventBus initialized successfully');
    this.setupMessageListeners();
  }

  // ========================================
  // SETUP AND MESSAGE HANDLING
  // ========================================

  /**
   * Sets up listeners to receive messages from React Native WebView.
   *
   * Establishes multiple listeners as fallbacks to ensure compatibility
   * with different WebView versions and configurations.
   *
   * @private
   */
  setupMessageListeners() {
    this.log('Setting up message listeners...');

    // Main listener for WebView messages
    window.addEventListener('message', this.handleMessage.bind(this));

    // Additional listener for document (fallback)
    document.addEventListener('message', this.handleMessage.bind(this));

    // Global listener (additional fallback)
    window.onmessage = this.handleMessage.bind(this);

    const environment = window.ReactNativeWebView
      ? 'React Native WebView'
      : 'Browser/Development';

    this.log(`Environment detected: ${environment}`);
  }

  /**
   * Handles all incoming messages from React Native, parsing event data
   * and delegating to the appropriate handler based on whether it's a response or new event.
   *
   * This method is the main entry point for all messages coming from
   * the React Native application.
   *
   * @param {Event} event - Event object containing message data
   *
   * @remarks
   * - If the message is a response (has `isResponse` and `responseToMessageId`), calls `handleResponse`
   * - Otherwise, treats the message as a new event and calls `handleIncomingEvent`
   * - Parsing errors are logged to console but don't interrupt execution
   */
  handleMessage(event) {
    try {
      const messageData = this.extractMessageData(event);
      if (!messageData) return;

      const message = this.parseMessage(messageData);
      if (!message) return;

      this.log('Message received:', message);

      if (message.isResponse && message.responseToMessageId) {
        // It's a response to a message we sent
        this.handleResponse(message);
      } else {
        // It's a new event from React Native
        this.handleIncomingEvent(message);
      }
    } catch (error) {
      this.logError('Error handling message:', error);
    }
  }

  /**
   * Extracts message data from the event object.
   *
   * Handles different event formats and properties where data might be located.
   *
   * @private
   * @param {Event} event - The event object
   * @returns {*|null} The message data or null if not found
   */
  extractMessageData(event) {
    if (event.data) return event.data;
    if (event.detail) return event.detail;
    return null;
  }

  /**
   * Parses the message from JSON string to JavaScript object.
   *
   * @private
   * @param {string|Object} messageData - The message data to parse
   * @returns {Object|null} The parsed message or null if error
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
      this.logError('Error parsing message:', parseError);
      return null;
    }
  }

  // ========================================
  // RESPONSE AND EVENT HANDLING
  // ========================================

  /**
   * Handles an incoming response by resolving the corresponding pending request.
   *
   * Looks for the pending request associated with the `responseToMessageId` in the message.
   * If it finds a matching request, resolves it with the message payload.
   *
   * @private
   * @param {EventMessage} message - The response message
   */
  handleResponse(message) {
    this.log(
      `Response received for message ID: ${message.responseToMessageId}`,
    );

    const pendingRequest = this.pendingRequests.get(
      message.responseToMessageId,
    );

    if (pendingRequest) {
      pendingRequest.resolve(message.payload);
      this.pendingRequests.delete(message.responseToMessageId);
      this.log(
        `Pending request resolved for ID: ${message.responseToMessageId}`,
      );
    } else {
      this.logError(
        `No pending request found for ID: ${message.responseToMessageId}`,
      );
    }
  }

  /**
   * Handles an incoming event by executing all callbacks subscribed to the event type.
   * Waits for all callbacks to finish and sends the first response back if there's a messageId.
   * In case of errors during callback execution, sends an error response.
   *
   * @private
   * @param {EventMessage} message - The event message
   * @returns {Promise<void>} Promise that resolves when all callbacks have been executed
   */
  async handleIncomingEvent(message) {
    const subscribers = this.subscribers.get(message.type);

    if (!subscribers || subscribers.size === 0) {
      this.log(`No subscribers for event: ${message.type}`);
      return;
    }

    this.log(
      `Executing ${subscribers.size} subscriber(s) for event: ${message.type}`,
    );

    try {
      // Execute all callbacks subscribed to the event
      const promises = Array.from(subscribers).map(callback =>
        callback(message.payload),
      );

      // Wait for all callbacks to finish and take the first response
      const responses = await Promise.all(promises);
      const response = responses[0]; // Take the first response

      // If the message has messageId, send response
      if (message.messageId) {
        this.log(`Sending response for message ID: ${message.messageId}`);
        this.sendResponse(message.messageId, response);
      }
    } catch (error) {
      this.logError(`Error executing subscribers for ${message.type}:`, error);

      // Send error response if needed
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
   * Sends a response to React Native for a specific messageId.
   *
   * @private
   * @param {string} messageId - The ID of the message being responded to
   * @param {*} payload - The response data
   */
  sendResponse(messageId, payload) {
    const responseMessage = {
      type: 'response',
      payload,
      isResponse: true,
      responseToMessageId: messageId,
    };

    this.log(`Sending response for ID: ${messageId}`, responseMessage);
    this.postMessageToReactNative(responseMessage);
  }

  // ========================================
  // COMMUNICATION UTILITIES
  // ========================================

  /**
   * Generates a unique message identifier.
   *
   * The identifier is composed of a prefix ('pwa_'), current timestamp,
   * and an incrementing counter to ensure uniqueness even in the same millisecond.
   *
   * @private
   * @returns {string} Unique message ID
   */
  generateMessageId() {
    return `pwa_${Date.now()}_${++this.messageIdCounter}`;
  }

  /**
   * Sends a serialized message to the React Native WebView component.
   *
   * Automatically detects if running in a React Native WebView
   * or in a standard browser and uses the appropriate communication method.
   *
   * @private
   * @param {EventMessage} message - The message to send
   * @throws {Error} If an error occurs during serialization or sending
   */
  postMessageToReactNative(message) {
    try {
      const messageString = JSON.stringify(message);

      if (window.ReactNativeWebView) {
        this.log('Sending message via ReactNativeWebView');
        window.ReactNativeWebView.postMessage(messageString);
      } else {
        this.log('Sending message via window.parent (fallback)');
        window.parent.postMessage(messageString, '*');
      }
    } catch (error) {
      this.logError('Error sending message to React Native:', error);
      throw error;
    }
  }

  // ========================================
  // PUBLIC API
  // ========================================

  /**
   * Emits an event to React Native and returns a promise that resolves with the response.
   *
   * @param {string} eventType - The type of event to emit
   * @param {*} payload - The data associated with the event
   * @returns {Promise<*>} Promise that resolves with the event response
   *
   * @throws {Error} If the response is not received within 30 seconds
   *
   * @example
   * ```javascript
   * // Request camera permissions
   * const result = await eventBus.emit('CAMERA_PERMISSION_REQUEST', {
   *   reason: "We need camera access to take photos"
   * });
   *
   * if (result.granted) {
   *   console.log("Permission granted");
   * }
   * ```
   */
  emit(eventType, payload) {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();

      this.log(`Emitting event: ${eventType} with ID: ${messageId}`, payload);

      // Store the pending promise
      this.pendingRequests.set(messageId, { resolve, reject });

      // Create message
      const message = {
        type: eventType,
        payload,
        messageId,
      };

      // Send message
      this.postMessageToReactNative(message);

      // Timeout to avoid hanging promises
      setTimeout(() => {
        if (this.pendingRequests.has(messageId)) {
          this.pendingRequests.delete(messageId);
          const error = new Error(
            `Timeout waiting for response to ${eventType} (ID: ${messageId})`,
          );
          this.logError('Timeout:', error);
          reject(error);
        }
      }, this.TIMEOUT_MS);
    });
  }

  /**
   * Subscribes to a specific event type, registering a callback to be invoked
   * when the event is emitted from React Native.
   *
   * @param {string} eventType - The event type to subscribe to
   * @param {Function} callback - Async function that handles the event payload and returns a response
   * @returns {Function} Cleanup function that cancels the subscription
   *
   * @throws {Error} If the callback is not a function
   *
   * @example
   * ```javascript
   * // Subscribe to HTTP requests
   * const unsubscribe = eventBus.subscribe('HTTP_REQUEST', async (request) => {
   *   const response = await fetch(request.url);
   *   return {
   *     status: response.status,
   *     data: await response.json()
   *   };
   * });
   *
   * // Clean up when needed
   * unsubscribe();
   * ```
   */
  subscribe(eventType, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType).add(callback);
    this.log(
      `Subscribed to event: ${eventType}. Total subscribers: ${
        this.subscribers.get(eventType).size
      }`,
    );

    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventType, callback);
    };
  }

  /**
   * Cancels the subscription of a callback from a specific event type.
   *
   * Removes the provided callback from the set of subscribers for the given event type.
   * If no more subscribers remain for the event type after removal,
   * the event type is removed from the internal subscribers map.
   *
   * @param {string} eventType - The event type to unsubscribe from
   * @param {Function} callback - The callback to remove
   */
  unsubscribe(eventType, callback) {
    const subscribers = this.subscribers.get(eventType);

    if (subscribers) {
      subscribers.delete(callback);
      this.log(
        `Unsubscribed from event: ${eventType}. Remaining subscribers: ${subscribers.size}`,
      );

      // Clean up the Set if empty
      if (subscribers.size === 0) {
        this.subscribers.delete(eventType);
        this.log(`No subscribers for ${eventType}, removing group`);
      }
    }
  }

  // ========================================
  // LOGGING AND DEBUGGING UTILITIES
  // ========================================

  /**
   * Logs an informational message to the console.
   *
   * @private
   * @param {string} message - The message to log
   * @param {*} [data=null] - Optional additional data
   */
  log(message, data = null) {
    if (!this.DEBUG_MODE) return;

    const timestamp = new Date().toISOString();
    const additionalData = data ?? '';

    console.log(`[PWAEventBus ${timestamp}] ${message}`, additionalData);
  }

  /**
   * Logs an error message to the console.
   *
   * @private
   * @param {string} message - The error message
   * @param {Error} [error=null] - Optional error object
   */
  logError(message, error = null) {
    const timestamp = new Date().toISOString();
    if (error) {
      console.error(`[PWAEventBus ERROR ${timestamp}] ${message}`, error);
    } else {
      console.error(`[PWAEventBus ERROR ${timestamp}] ${message}`);
    }
  }

  /**
   * Gets statistics about the current state of the EventBus.
   *
   * Useful for debugging and monitoring the internal state of the event bus.
   *
   * @returns {Object} Object with EventBus statistics
   * @returns {number} returns.subscribersCount - Number of event types with subscribers
   * @returns {number} returns.pendingRequestsCount - Number of pending requests
   * @returns {number} returns.messageIdCounter - Current message ID counter
   * @returns {string[]} returns.eventTypes - Array of subscribed event types
   *
   * @example
   * ```javascript
   * const stats = eventBus.getStats();
   * console.log(`Active subscribers: ${stats.subscribersCount}`);
   * console.log(`Pending requests: ${stats.pendingRequestsCount}`);
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
// EVENT TYPES DEFINITION
// ========================================

/**
 * Constants that define the available event types for communication
 * between the PWA and React Native.
 *
 * Maintains synchronization with the types defined in the React Native application.
 */
class EventTypes {
  // === HTTP REQUESTS ===
  static HTTP_REQUEST = 'http_request';

  // === INITIALIZATION EVENTS ===
  static PWA_READY = 'pwa_ready';
  static NATIVE_READY = 'native_ready';

  // === PERMISSIONS ===
  static CAMERA_PERMISSION_REQUEST = 'camera_permission_request';
  static LOCATION_PERMISSION_REQUEST = 'location_permission_request';
  static MICROPHONE_PERMISSION_REQUEST = 'microphone_permission_request';
  static STORAGE_PERMISSION_REQUEST = 'storage_permission_request';
  static CONTACTS_PERMISSION_REQUEST = 'contacts_permission_request';

  // === CACHE ===
  static SET_IN_LOCAL_STORAGE = 'set_in_local_storage';
  static GET_FROM_LOCAL_STORAGE = 'get_from_local_storage';
  static DELETE_FROM_LOCAL_STORAGE = 'delete_from_local_storage';
  static CLEAR_LOCAL_STORAGE = 'clear_local_storage';

  // === CAMERA AND MULTIMEDIA ===
  static TAKE_PHOTO = 'take_photo';
  static RECORD_VIDEO = 'record_video';
  static PICK_IMAGE = 'pick_image';
  static PICK_VIDEO = 'pick_video';

  // === GEOLOCATION ===
  static GET_LOCATION = 'get_location';
  static START_LOCATION_TRACKING = 'start_location_tracking';
  static STOP_LOCATION_TRACKING = 'stop_location_tracking';

  // === FILES AND STORAGE ===
  static SAVE_FILE = 'save_file';
  static READ_FILE = 'read_file';
  static DELETE_FILE = 'delete_file';
  static LIST_FILES = 'list_files';

  // === NOTIFICATIONS ===
  static SEND_LOCAL_NOTIFICATION = 'send_local_notification';
  static REGISTER_PUSH_NOTIFICATIONS = 'register_push_notifications';

  // === DEVICE ===
  static GET_DEVICE_INFO = 'get_device_info';
  static GET_BATTERY_STATUS = 'get_battery_status';
  static GET_NETWORK_STATUS = 'get_network_status';

  // === VIBRATION AND HAPTICS ===
  static VIBRATE = 'vibrate';
  static HAPTIC_FEEDBACK = 'haptic_feedback';

  // === SHARING ===
  static SHARE_CONTENT = 'share_content';
  static SHARE_FILE = 'share_file';

  // === CUSTOM EVENTS ===
  static CUSTOM_EVENT = 'custom_event';
  static PWA_CUSTOM_EVENT = 'pwa_custom_event';
}

// ========================================
// GLOBAL EXPOSURE
// ========================================

// Expose classes globally for use in the PWA
window.PWAEventBus = PWAEventBus;
window.EventTypes = EventTypes;
