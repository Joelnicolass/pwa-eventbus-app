/**
 * PWA EventBus Console - Aplicación Simplificada
 *
 * Consola simple para mostrar comunicación PWA ↔ React Native
 * @version 1.0.0
 */

// ========================================
// VARIABLES GLOBALES
// ========================================

let eventBus;
let messageCounter = 0;
let subscribedEvents = 0;

// Referencias DOM
const elements = {
  // Status y controles
  connectionStatus: document.getElementById('connection-status'),
  statusText: document.getElementById('status-text'),
  modeSelector: document.getElementById('mode-selector'),
  modeIndicator: document.getElementById('mode-indicator'),
  mockControls: document.getElementById('mock-controls'),

  // Botones de prueba
  testBtn: document.getElementById('test-btn'),
  deviceBtn: document.getElementById('device-btn'),
  locationBtn: document.getElementById('location-btn'),
  storageBtn: document.getElementById('storage-btn'),

  newEventBtn: document.getElementById('new-event-btn'),

  // Agregar referencia al botón de cámara
  cameraBtn: null, // Se creará dinámicamente

  // Mock controls
  simulateErrors: document.getElementById('simulate-errors'),
  statsBtn: document.getElementById('stats-btn'),

  // Consola
  console: document.getElementById('console'),
  clearBtn: document.getElementById('clear-btn'),
  autoScroll: document.getElementById('auto-scroll'),

  // Stats
  eventsCount: document.getElementById('events-count'),
  messagesCount: document.getElementById('messages-count'),
  footerMode: document.getElementById('footer-mode'),
};

// ========================================
// INICIALIZACIÓN
// ========================================

window.addEventListener('load', initializeApp);

function initializeApp() {
  log('🚀 Inicializando PWA EventBus Console...', 'info');

  // Registrar Service Worker
  registerServiceWorker();

  // Inicializar EventBus
  initializeEventBus();

  // Configurar event listeners
  setupEventListeners();

  // Configurar suscripciones
  setupSubscriptions();

  // Notificar PWA ready
  setTimeout(notifyPWAReady, 1000);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('service-worker.js')
      .then(() => log('✅ Service Worker registrado', 'success'))
      .catch(error =>
        log('❌ Error en Service Worker: ' + error.message, 'error'),
      );
  }
}

function initializeEventBus() {
  try {
    // Usar factory para auto-detección
    eventBus = window.PWAEventBusFactory.create();

    const isMock = eventBus.getStats && eventBus.getStats().mockMode;
    const mode = isMock ? 'mock' : 'real';

    updateConnectionStatus('connected');
    updateModeDisplay(mode);

    log(`🌉 EventBus inicializado (${mode.toUpperCase()})`, 'success');
  } catch (error) {
    log('❌ Error inicializando EventBus: ' + error.message, 'error');
    updateConnectionStatus('error');
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Cambio de modo
  elements.modeSelector.addEventListener('change', handleModeChange);

  // Botones de prueba
  elements.testBtn.addEventListener('click', () => testEvent('TEST'));
  elements.deviceBtn.addEventListener('click', () =>
    testEvent('GET_DEVICE_INFO'),
  );
  elements.locationBtn.addEventListener('click', () =>
    testEvent('GET_LOCATION'),
  );
  elements.storageBtn.addEventListener('click', () => testStorageEvent());

  elements.newEventBtn.addEventListener('click', async () => {
    const eventName = 'SHOW_NAME';

    const payload = {
      timestamp: Date.now(),
      eventType: eventName,
      data: { name: 'Nico' },
    };

    log(`🧪 Evento ${eventName} enviado`, 'info');
    const response = await eventBus.emit(eventName, payload);

    log(`✅ Respuesta de ${eventName}:`, 'success');
    logJson(response);

    updateMessageCounter();
  });

  // Crear y agregar botón de cámara dinámicamente
  createCameraButton();

  // Mock controls
  elements.simulateErrors.addEventListener('change', handleErrorSimulation);
  elements.statsBtn.addEventListener('click', showStats);

  // Consola
  elements.clearBtn.addEventListener('click', clearConsole);
}

// ========================================
// FUNCIONALIDAD DE CÁMARA SIMPLIFICADA
// ========================================

/**
 * Crea el botón de cámara y lo agrega al DOM
 */
function createCameraButton() {
  const buttonGroup = document.querySelector('.button-group');

  // Crear botón de cámara
  const cameraBtn = document.createElement('button');
  cameraBtn.id = 'camera-btn';
  cameraBtn.className = 'btn secondary';
  cameraBtn.innerHTML = '📷 Tomar Foto';

  // Agregar event listener
  cameraBtn.addEventListener('click', () => testCameraCapture());

  // Insertar después del botón de location
  const locationBtn = elements.locationBtn;
  locationBtn.parentNode.insertBefore(cameraBtn, locationBtn.nextSibling);

  // Guardar referencia
  elements.cameraBtn = cameraBtn;

  log('📷 Botón de cámara agregado al DOM', 'info');
}

/**
 * 📷 Función simplificada para captura de fotos
 *
 * Implementa el flujo deseado:
 * PWA emite TAKE_PHOTO -> React Native activa cámara -> retorna base64, width, height
 *
 * Usa el patrón Promise/async-await para un flujo limpio y directo
 * ACTUALIZADO: Maneja la convención estándar de respuesta de React Native
 */
async function testCameraCapture() {
  try {
    log('📷 Iniciando captura de foto...', 'info');

    // Deshabilitar botón temporalmente para evitar múltiples clicks
    if (elements.cameraBtn) {
      elements.cameraBtn.disabled = true;
      elements.cameraBtn.innerHTML = '📷 Capturando...';
    }

    // 🚀 FLUJO SIMPLIFICADO: Un solo evento que retorna todo lo necesario
    const response = await eventBus.emit(window.EventTypes.TAKE_PHOTO, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      cameraType: 'back',
      timestamp: Date.now(),
    });

    updateMessageCounter();

    // ✅ USAR CONVENCIÓN ESTÁNDAR: La respuesta viene en formato StandardResponse
    // response = { success: true, eventType: "TAKE_PHOTO", data: {...}, timestamp: ... }

    if (!response.success) {
      throw new Error(response.message || 'Error en la captura de foto');
    }

    // 🎯 LOS DATOS DE LA FOTO ESTÁN EN response.data
    const photoData = response.data;

    log('📷 ¡Foto capturada exitosamente!', 'success');
    log('📷 Respuesta completa recibida:', 'info');
    logJson(response);

    // Mostrar la información de la foto desde response.data
    const photoInfo = {
      success: photoData.success || false,
      width: photoData.width || 'No disponible',
      height: photoData.height || 'No disponible',
      base64Length: photoData.base64 ? photoData.base64.length : 0,
      base64Preview: photoData.base64
        ? photoData.base64.substring(0, 50) + '...'
        : 'No disponible',
      timestamp: photoData.timestamp || 'No disponible',
      eventTimestamp: response.timestamp,
    };

    log('📷 Datos extraídos de la foto:', 'info');
    logJson(photoInfo);

    // 🎯 AQUÍ TIENES ACCESO DIRECTO AL PAYLOAD COMO QUERÍAS:
    if (photoData.base64) {
      log(
        `📸 Base64 recibido (${photoData.base64.length} caracteres)`,
        'success',
      );
      log(`📐 Dimensiones: ${photoData.width}x${photoData.height}`, 'success');

      // Ejemplo de cómo usar los datos (como lo solicitas en el objetivo)
      console.log('📷 RESPUESTA COMPLETA:', response);
      console.log('📷 DATOS DE LA FOTO:', photoData);
      console.log('📷 BASE64:', photoData.base64);
      console.log('📷 WIDTH:', photoData.width);
      console.log('📷 HEIGHT:', photoData.height);
      console.log('📷 SUCCESS:', photoData.success);
      console.log('📷 TIMESTAMP:', photoData.timestamp);

      // Aquí podrías hacer lo que necesites con la foto:
      // - Mostrarla en un elemento <img>
      // - Enviarla a un servidor
      // - Procesar la imagen
      // - etc.

      // Ejemplo: Mostrar la foto en la consola como imagen
      try {
        const img = document.createElement('img');
        img.src = photoData.base64;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '150px';
        img.style.border = '2px solid #007bff';
        img.style.borderRadius = '8px';
        img.style.margin = '10px 0';

        const imageEntry = document.createElement('div');
        imageEntry.className = 'json-entry';
        imageEntry.innerHTML =
          '<p><strong>📸 Preview de la foto capturada:</strong></p>';
        imageEntry.appendChild(img);

        elements.console.appendChild(imageEntry);
        scrollConsole();

        log('📸 Preview de la imagen agregado a la consola', 'success');
      } catch (imgError) {
        log('⚠️ No se pudo mostrar preview de la imagen', 'warning');
      }
    } else {
      log('⚠️ No se recibió base64 en response.data', 'warning');
    }
  } catch (error) {
    log(`❌ Error capturando foto: ${error.message}`, 'error');
    console.error('📷 Error completo:', error);

    // Manejar errores específicos
    if (error.message.includes('timeout')) {
      log('⏱️ Timeout - La cámara tardó demasiado en responder', 'error');
    } else if (error.message.includes('permission')) {
      log('🔐 Error de permisos - Verifica los permisos de cámara', 'error');
    } else if (error.message.includes('not available')) {
      log('📵 Cámara no disponible en este dispositivo', 'error');
    } else if (error.message.includes('Camera is already active')) {
      log(
        '📷 La cámara ya está activa - intenta de nuevo en un momento',
        'error',
      );
    }
  } finally {
    // Rehabilitar botón
    if (elements.cameraBtn) {
      elements.cameraBtn.disabled = false;
      elements.cameraBtn.innerHTML = '📷 Tomar Foto';
    }
  }
}

// ========================================
// SUSCRIPCIONES A EVENTOS
// ========================================

function setupSubscriptions() {
  subscribedEvents = 0;

  // Native Ready - CORREGIDO: Hacer suscripción en lugar de emit
  eventBus.subscribe(window.EventTypes.NATIVE_READY, async payload => {
    log('🤖 NATIVE_READY recibido:', 'success');
    logJson(payload);
    return { pwaReady: true, timestamp: Date.now() };
  });

  // Location Updates
  eventBus.subscribe(window.EventTypes.LOCATION_UPDATE, async payload => {
    log('📍 LOCATION_UPDATE recibido:', 'success');
    logJson(payload);
    return { received: true };
  });

  // Custom Events
  eventBus.subscribe(window.EventTypes.CUSTOM_EVENT, async payload => {
    log('🔔 CUSTOM_EVENT recibido:', 'success');
    logJson(payload);
    return { processed: true, timestamp: Date.now() };
  });

  subscribedEvents = 3;
  elements.eventsCount.textContent = subscribedEvents;

  log(`✅ ${subscribedEvents} suscripciones configuradas`, 'success');
}

// ========================================
// FUNCIONES DE PRUEBA
// ========================================

async function testEvent(eventType) {
  try {
    log(`🧪 Enviando ${eventType}...`, 'info');

    const payload = {
      timestamp: Date.now(),
      test: true,
      eventType: eventType,
    };

    if (eventType === 'GET_DEVICE_INFO') {
      payload.includeHardware = true;
    } else if (eventType === 'GET_LOCATION') {
      payload.accuracy = 'high';
    }

    const response = await eventBus.emit(window.EventTypes[eventType], payload);
    updateMessageCounter();

    log(`✅ Respuesta de ${eventType}:`, 'success');
    logJson(response);
  } catch (error) {
    log(`❌ Error en ${eventType}: ${error.message}`, 'error');
  }
}

async function testStorageEvent() {
  try {
    const testData = {
      message: 'Test data',
      timestamp: Date.now(),
      random: Math.random(),
    };

    log('💾 Guardando en storage...', 'info');
    const saveResponse = await eventBus.emit(
      window.EventTypes.SET_IN_LOCAL_STORAGE,
      {
        key: 'pwa_test',
        value: JSON.stringify(testData),
      },
    );
    updateMessageCounter();

    log('✅ Respuesta SAVE:', 'success');
    logJson(saveResponse);

    log('📖 Leyendo desde storage...', 'info');
    const loadResponse = await eventBus.emit(
      window.EventTypes.GET_FROM_LOCAL_STORAGE,
      {
        key: 'pwa_test',
      },
    );
    updateMessageCounter();

    log('✅ Respuesta LOAD:', 'success');
    logJson(loadResponse);
  } catch (error) {
    log('❌ Error en storage test: ' + error.message, 'error');
  }
}

async function notifyPWAReady() {
  try {
    log('📱 Notificando PWA_READY...', 'info');

    const response = await eventBus.emit(window.EventTypes.PWA_READY, {
      timestamp: Date.now(),
      version: '1.0.0',
      ready: true,
    });
    updateMessageCounter();

    log('✅ PWA_READY confirmado:', 'success');
    logJson(response);
    updateConnectionStatus('ready');
  } catch (error) {
    log(
      '⚠️ PWA_READY timeout (normal en desarrollo): ' + error.message,
      'warning',
    );
  }
}

// ========================================
// UTILIDADES DE CONSOLA
// ========================================

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  entry.innerHTML = `
    <span class="timestamp">${timestamp}</span>
    <span class="icon">${icons[type]}</span>
    <span class="message">${message}</span>
  `;

  elements.console.appendChild(entry);
  scrollConsole();

  // También log en consola del navegador
  console.log(`[PWA Console] ${message}`);
}

function logJson(data) {
  const entry = document.createElement('div');
  entry.className = 'json-entry';

  const jsonStr = JSON.stringify(data, null, 2);
  entry.innerHTML = `<pre class="json-content">${jsonStr}</pre>`;

  elements.console.appendChild(entry);
  scrollConsole();
}

function clearConsole() {
  elements.console.innerHTML = '';
  log('🧹 Consola limpiada', 'info');
}

function scrollConsole() {
  if (elements.autoScroll.checked) {
    elements.console.scrollTop = elements.console.scrollHeight;
  }
}

// ========================================
// UTILIDADES DE UI
// ========================================

function updateConnectionStatus(status) {
  elements.connectionStatus.className = `status-indicator ${status}`;

  const statusMap = {
    connected: '🔗 Conectado',
    ready: '✅ Listo',
    error: '❌ Error',
  };

  elements.statusText.textContent = statusMap[status] || '⏳ Conectando...';
}

function updateModeDisplay(mode) {
  const badges = {
    auto: { text: 'AUTO', class: 'auto' },
    mock: { text: 'MOCK', class: 'mock' },
    real: { text: 'REAL', class: 'real' },
  };

  const badge = badges[mode] || badges.auto;
  elements.modeIndicator.textContent = badge.text;
  elements.modeIndicator.className = `mode-badge ${badge.class}`;

  // Mostrar/ocultar controles mock
  elements.mockControls.style.display = mode === 'mock' ? 'block' : 'none';

  // Actualizar footer
  elements.footerMode.textContent = `Modo: ${badge.text}`;
}

function updateMessageCounter() {
  messageCounter++;
  elements.messagesCount.textContent = messageCounter;
}

function handleModeChange() {
  const newMode = elements.modeSelector.value;
  log(`🔄 Cambiando a modo: ${newMode}`, 'info');

  try {
    if (newMode === 'auto') {
      eventBus = window.PWAEventBusFactory.create();
    } else if (newMode === 'mock') {
      eventBus = new window.PWAEventBusMock();
    } else if (newMode === 'real') {
      eventBus = new window.PWAEventBus();
    }

    const actualMode =
      eventBus.getStats && eventBus.getStats().mockMode ? 'mock' : 'real';
    updateModeDisplay(actualMode);
    setupSubscriptions();

    log(`✅ Modo cambiado a ${actualMode.toUpperCase()}`, 'success');
  } catch (error) {
    log('❌ Error cambiando modo: ' + error.message, 'error');
  }
}

function handleErrorSimulation() {
  if (eventBus.setErrorSimulation) {
    const enabled = elements.simulateErrors.checked;
    eventBus.setErrorSimulation(enabled, 0.1);
    log(`🎭 Simulación de errores ${enabled ? 'ON' : 'OFF'}`, 'info');
  }
}

function showStats() {
  if (eventBus.getStats) {
    const stats = eventBus.getStats();
    log('📊 ESTADÍSTICAS EventBus:', 'info');
    logJson(stats);
  } else {
    log('📊 Stats no disponibles (modo real)', 'warning');
  }
}
