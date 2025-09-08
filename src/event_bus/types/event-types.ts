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
  CAMERA_PHOTO_BASE64_PROCESS = 'camera_photo_base64_process',
  CAMERA_PHOTO_BASE64_READY = 'camera_photo_base64_ready',

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

  TEST = 'test',
}
