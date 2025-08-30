/**
 * Tipos de eventos para comunicación bidireccional PWA <-> NATIVE
 */

export enum EventTypes {
  // === EVENTOS DE INICIALIZACIÓN ===
  PWA_READY = 'pwa_ready',
  NATIVE_READY = 'native_ready',

  // === HTTP REQUESTS ===
  HTTP_RESPONSE = 'http_response',
  HTTP_REQUEST = 'http_request',

  // === PERMISOS ===
  CAMERA_PERMISSION_REQUEST = 'camera_permission_request',
  CAMERA_PERMISSION_RESPONSE = 'camera_permission_response',
  LOCATION_PERMISSION_REQUEST = 'location_permission_request',
  LOCATION_PERMISSION_RESPONSE = 'location_permission_response',
  MICROPHONE_PERMISSION_REQUEST = 'microphone_permission_request',
  MICROPHONE_PERMISSION_RESPONSE = 'microphone_permission_response',
  STORAGE_PERMISSION_REQUEST = 'storage_permission_request',
  STORAGE_PERMISSION_RESPONSE = 'storage_permission_response',
  CONTACTS_PERMISSION_REQUEST = 'contacts_permission_request',
  CONTACTS_PERMISSION_RESPONSE = 'contacts_permission_response',

  // === CÁMARA Y MULTIMEDIA ===
  TAKE_PHOTO = 'take_photo',
  TAKE_PHOTO_RESPONSE = 'take_photo_response',
  RECORD_VIDEO = 'record_video',
  RECORD_VIDEO_RESPONSE = 'record_video_response',
  PICK_IMAGE = 'pick_image',
  PICK_IMAGE_RESPONSE = 'pick_image_response',
  PICK_VIDEO = 'pick_video',
  PICK_VIDEO_RESPONSE = 'pick_video_response',

  // === GEOLOCALIZACIÓN ===
  GET_LOCATION = 'get_location',
  GET_LOCATION_RESPONSE = 'get_location_response',
  START_LOCATION_TRACKING = 'start_location_tracking',
  STOP_LOCATION_TRACKING = 'stop_location_tracking',
  LOCATION_UPDATE = 'location_update',

  // === ARCHIVOS Y STORAGE ===
  SAVE_FILE = 'save_file',
  SAVE_FILE_RESPONSE = 'save_file_response',
  READ_FILE = 'read_file',
  READ_FILE_RESPONSE = 'read_file_response',
  DELETE_FILE = 'delete_file',
  DELETE_FILE_RESPONSE = 'delete_file_response',
  LIST_FILES = 'list_files',
  LIST_FILES_RESPONSE = 'list_files_response',

  // CACHE
  SET_IN_LOCAL_STORAGE = 'set_in_local_storage',
  GET_FROM_LOCAL_STORAGE = 'get_from_local_storage',
  DELETE_FROM_LOCAL_STORAGE = 'delete_from_local_storage',
  CLEAR_LOCAL_STORAGE = 'clear_local_storage',

  // === NOTIFICACIONES PUSH ===
  REGISTER_PUSH_NOTIFICATIONS = 'register_push_notifications',
  REGISTER_PUSH_NOTIFICATIONS_RESPONSE = 'register_push_notifications_response',
  SEND_LOCAL_NOTIFICATION = 'send_local_notification',
  SEND_LOCAL_NOTIFICATION_RESPONSE = 'send_local_notification_response',
  NOTIFICATION_RECEIVED = 'notification_received',
  NOTIFICATION_OPENED = 'notification_opened',

  // === BLUETOOTH ===
  BLUETOOTH_SCAN = 'bluetooth_scan',
  BLUETOOTH_SCAN_RESPONSE = 'bluetooth_scan_response',
  BLUETOOTH_CONNECT = 'bluetooth_connect',
  BLUETOOTH_CONNECT_RESPONSE = 'bluetooth_connect_response',
  BLUETOOTH_DISCONNECT = 'bluetooth_disconnect',
  BLUETOOTH_SEND_DATA = 'bluetooth_send_data',
  BLUETOOTH_DATA_RECEIVED = 'bluetooth_data_received',

  // === WIFI ===
  WIFI_SCAN = 'wifi_scan',
  WIFI_SCAN_RESPONSE = 'wifi_scan_response',
  WIFI_CONNECT = 'wifi_connect',
  WIFI_CONNECT_RESPONSE = 'wifi_connect_response',
  WIFI_GET_INFO = 'wifi_get_info',
  WIFI_GET_INFO_RESPONSE = 'wifi_get_info_response',

  // === CONTACTOS ===
  GET_CONTACTS = 'get_contacts',
  GET_CONTACTS_RESPONSE = 'get_contacts_response',
  SAVE_CONTACT = 'save_contact',
  SAVE_CONTACT_RESPONSE = 'save_contact_response',

  // === CALENDARIO ===
  GET_CALENDAR_EVENTS = 'get_calendar_events',
  GET_CALENDAR_EVENTS_RESPONSE = 'get_calendar_events_response',
  CREATE_CALENDAR_EVENT = 'create_calendar_event',
  CREATE_CALENDAR_EVENT_RESPONSE = 'create_calendar_event_response',

  // === BIOMETRÍA ===
  BIOMETRIC_AUTH = 'biometric_auth',
  BIOMETRIC_AUTH_RESPONSE = 'biometric_auth_response',
  CHECK_BIOMETRIC_AVAILABLE = 'check_biometric_available',
  CHECK_BIOMETRIC_AVAILABLE_RESPONSE = 'check_biometric_available_response',

  // === DISPOSITIVO ===
  GET_DEVICE_INFO = 'get_device_info',
  GET_DEVICE_INFO_RESPONSE = 'get_device_info_response',
  GET_BATTERY_STATUS = 'get_battery_status',
  GET_BATTERY_STATUS_RESPONSE = 'get_battery_status_response',
  BATTERY_STATUS_CHANGED = 'battery_status_changed',
  GET_NETWORK_STATUS = 'get_network_status',
  GET_NETWORK_STATUS_RESPONSE = 'get_network_status_response',
  NETWORK_STATUS_CHANGED = 'network_status_changed',

  // === VIBRACIÓN Y HAPTICS ===
  VIBRATE = 'vibrate',
  VIBRATE_RESPONSE = 'vibrate_response',
  HAPTIC_FEEDBACK = 'haptic_feedback',
  HAPTIC_FEEDBACK_RESPONSE = 'haptic_feedback_response',

  // === COMPARTIR ===
  SHARE_CONTENT = 'share_content',
  SHARE_CONTENT_RESPONSE = 'share_content_response',
  SHARE_FILE = 'share_file',
  SHARE_FILE_RESPONSE = 'share_file_response',

  // === CLIPBOARD ===
  COPY_TO_CLIPBOARD = 'copy_to_clipboard',
  COPY_TO_CLIPBOARD_RESPONSE = 'copy_to_clipboard_response',
  READ_FROM_CLIPBOARD = 'read_from_clipboard',
  READ_FROM_CLIPBOARD_RESPONSE = 'read_from_clipboard_response',

  // === SENSORES ===
  START_ACCELEROMETER = 'start_accelerometer',
  STOP_ACCELEROMETER = 'stop_accelerometer',
  ACCELEROMETER_DATA = 'accelerometer_data',
  START_GYROSCOPE = 'start_gyroscope',
  STOP_GYROSCOPE = 'stop_gyroscope',
  GYROSCOPE_DATA = 'gyroscope_data',
  START_MAGNETOMETER = 'start_magnetometer',
  STOP_MAGNETOMETER = 'stop_magnetometer',
  MAGNETOMETER_DATA = 'magnetometer_data',

  // === QR / BARCODE ===
  SCAN_QR_CODE = 'scan_qr_code',
  SCAN_QR_CODE_RESPONSE = 'scan_qr_code_response',
  SCAN_BARCODE = 'scan_barcode',
  SCAN_BARCODE_RESPONSE = 'scan_barcode_response',

  // === APP STATE ===
  APP_STATE_CHANGED = 'app_state_changed',
  APP_WILL_TERMINATE = 'app_will_terminate',
  APP_DID_BECOME_ACTIVE = 'app_did_become_active',
  APP_WILL_RESIGN_ACTIVE = 'app_will_resign_active',

  // === DEEPLINKS ===
  DEEP_LINK_RECEIVED = 'deep_link_received',
  HANDLE_DEEP_LINK = 'handle_deep_link',

  // === ERRORES Y DEBUG ===
  ERROR = 'error',
  DEBUG_MESSAGE = 'debug_message',
  LOG_MESSAGE = 'log_message',

  // === EVENTOS PERSONALIZADOS ===
  CUSTOM_EVENT = 'custom_event',
  PWA_CUSTOM_EVENT = 'pwa_custom_event',
}

/**
 * Tipos de payload para eventos que EMITES (lo que envías cuando haces emit())
 */
export interface OutgoingEventPayloads {
  // === EVENTOS DE INICIALIZACIÓN ===
  [EventTypes.PWA_READY]: {
    timestamp: number;
    version?: string;
  };

  [EventTypes.NATIVE_READY]: {
    platform: string;
    version: string | number;
    timestamp: number;
  };

  // === PERMISOS ===
  [EventTypes.CAMERA_PERMISSION_REQUEST]: {
    reason?: string;
  };

  [EventTypes.LOCATION_PERMISSION_REQUEST]: {
    reason?: string;
    enableHighAccuracy?: boolean;
  };

  [EventTypes.MICROPHONE_PERMISSION_REQUEST]: {
    reason?: string;
  };

  [EventTypes.STORAGE_PERMISSION_REQUEST]: {
    reason?: string;
  };

  [EventTypes.CONTACTS_PERMISSION_REQUEST]: {
    reason?: string;
  };

  [EventTypes.TAKE_PHOTO]: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowEditing?: boolean;
    cameraType?: 'front' | 'back';
  };

  [EventTypes.GET_LOCATION]: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  };

  [EventTypes.START_LOCATION_TRACKING]: {
    enableHighAccuracy?: boolean;
    distanceFilter?: number;
    interval?: number;
  };

  [EventTypes.STOP_LOCATION_TRACKING]: {
    // No requiere parámetros
  };

  [EventTypes.LOCATION_UPDATE]: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    timestamp: number;
    success: boolean;
    error?: string;
  };

  [EventTypes.SAVE_FILE]: {
    filename: string;
    data: string | ArrayBuffer;
    mimeType?: string;
    directory?: 'documents' | 'downloads' | 'cache';
  };

  [EventTypes.SEND_LOCAL_NOTIFICATION]: {
    title: string;
    body: string;
    data?: Record<string, any>;
    scheduledTime?: Date;
    sound?: string;
  };

  [EventTypes.VIBRATE]: {
    pattern?: number[];
    duration?: number;
  };

  [EventTypes.SHARE_CONTENT]: {
    message?: string;
    title?: string;
    url?: string;
  };

  // CUSTOM EVENTS
  [EventTypes.CUSTOM_EVENT]: {
    [key: string]: any;
  };

  [EventTypes.PWA_CUSTOM_EVENT]: {
    [key: string]: any;
    test: string;
  };
}

/**
 * Tipos de respuesta que RECIBES después de emitir un evento (lo que esperas como respuesta)
 */
export interface IncomingEventResponses {
  // === EVENTOS DE INICIALIZACIÓN ===
  [EventTypes.PWA_READY]: {
    status: string;
    timestamp: number;
  };

  [EventTypes.NATIVE_READY]: {
    status: string;
    timestamp: number;
  };

  // === PERMISOS ===
  [EventTypes.CAMERA_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.LOCATION_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.MICROPHONE_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.STORAGE_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.CONTACTS_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.TAKE_PHOTO]: {
    uri: string;
    width: number;
    height: number;
    fileSize?: number;
  };

  [EventTypes.GET_LOCATION]: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    timestamp: number;
  };

  [EventTypes.LOCATION_UPDATE]: {
    received: boolean;
  };

  // CUSTOM EVENTS
  [EventTypes.CUSTOM_EVENT]: {
    [key: string]: any;
  };

  [EventTypes.PWA_CUSTOM_EVENT]: {
    [key: string]: any;
  };
}

/**
 * Tipos de payload para eventos que RECIBES (lo que recibes cuando alguien emite hacia ti)
 */
export interface IncomingEventPayloads {
  // === EVENTOS DE INICIALIZACIÓN ===
  [EventTypes.PWA_READY]: {
    timestamp: number;
    version?: string;
  };

  [EventTypes.NATIVE_READY]: {
    platform: string;
    version: string | number;
    timestamp: number;
  };

  // === HTTP REQUESTS ===

  [EventTypes.HTTP_REQUEST]: {
    url: string;
    headers?: Record<string, string>;
    timeout?: number;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  };

  // === CACHE ===
  [EventTypes.SET_IN_LOCAL_STORAGE]: {
    key: string;
    value: string;
  };

  [EventTypes.GET_FROM_LOCAL_STORAGE]: {
    key: string;
    requestId: string;
  };

  [EventTypes.DELETE_FROM_LOCAL_STORAGE]: {
    key: string;
  };

  [EventTypes.CLEAR_LOCAL_STORAGE]: {
    // No requiere parámetros
  };

  // === PERMISOS ===
  [EventTypes.CAMERA_PERMISSION_REQUEST]: {
    reason?: string;
  };

  [EventTypes.LOCATION_PERMISSION_REQUEST]: {
    reason?: string;
    enableHighAccuracy?: boolean;
  };

  [EventTypes.MICROPHONE_PERMISSION_REQUEST]: {
    reason?: string;
  };

  [EventTypes.STORAGE_PERMISSION_REQUEST]: {
    reason?: string;
  };

  [EventTypes.CONTACTS_PERMISSION_REQUEST]: {
    reason?: string;
  };

  [EventTypes.TAKE_PHOTO]: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowEditing?: boolean;
    cameraType?: 'front' | 'back';
  };

  [EventTypes.GET_LOCATION]: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  };

  [EventTypes.START_LOCATION_TRACKING]: {
    enableHighAccuracy?: boolean;
    distanceFilter?: number;
    interval?: number;
  };

  [EventTypes.STOP_LOCATION_TRACKING]: {
    // No requiere parámetros
  };

  // CUSTOM EVENTS
  [EventTypes.CUSTOM_EVENT]: {
    [key: string]: any;
  };

  [EventTypes.PWA_CUSTOM_EVENT]: {
    [key: string]: any;
    test: string;
  };
}

/**
 * Tipos de respuesta que ENVÍAS cuando respondes a un evento recibido (lo que debes retornar)
 *
 */
export interface OutgoingEventResponses {
  // === EVENTOS DE INICIALIZACIÓN ===
  [EventTypes.PWA_READY]: {
    status: string;
    timestamp: number;
  };

  [EventTypes.NATIVE_READY]: {
    status: string;
    timestamp: number;
  };

  // === HTTP REQUESTS ===

  [EventTypes.HTTP_REQUEST]: {
    status: number;
    data: any;
  };

  // === CACHE ===
  [EventTypes.SET_IN_LOCAL_STORAGE]: {
    success: boolean;
    error?: string;
  };

  [EventTypes.GET_FROM_LOCAL_STORAGE]: {
    requestId: string;
    value: string | null;
    success: boolean;
    error?: string;
  };

  [EventTypes.DELETE_FROM_LOCAL_STORAGE]: {
    success: boolean;
    error?: string;
  };

  [EventTypes.CLEAR_LOCAL_STORAGE]: {
    success: boolean;
    error?: string;
  };

  // === PERMISOS ===
  [EventTypes.CAMERA_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.LOCATION_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.MICROPHONE_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.STORAGE_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.CONTACTS_PERMISSION_REQUEST]: {
    granted: boolean;
    canAskAgain?: boolean;
  };

  [EventTypes.TAKE_PHOTO]: {
    uri: string;
    width: number;
    height: number;
    fileSize?: number;
  };

  [EventTypes.GET_LOCATION]: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    timestamp: number;
    success: boolean;
    error?: string;
  };

  [EventTypes.START_LOCATION_TRACKING]: {
    success: boolean;
    error?: string;
  };

  [EventTypes.STOP_LOCATION_TRACKING]: {
    success: boolean;
    error?: string;
  };

  [EventTypes.LOCATION_UPDATE]: {
    received: boolean;
  };

  // CUSTOM EVENTS
  [EventTypes.CUSTOM_EVENT]: {
    [key: string]: any;
  };

  [EventTypes.PWA_CUSTOM_EVENT]: {
    [key: string]: any;
  };
}
