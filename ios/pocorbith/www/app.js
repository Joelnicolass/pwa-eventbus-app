let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let btn = document.getElementById('take-photo');
let gallery = document.getElementById('gallery');

// Función de logging mejorada
function log(message, data = null) {
  console.log(`[PWA Camera] ${message}`, data || '');
}

// Iniciar cámara con mejor manejo de errores
log('Iniciando aplicación PWA');
navigator.mediaDevices
  .getUserMedia({
    video: {
      facingMode: 'environment', // Usar cámara trasera si está disponible
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  })
  .then(stream => {
    log('Cámara iniciada exitosamente');
    video.srcObject = stream;
    // Verificar que el video esté cargado
    video.addEventListener('loadedmetadata', () => {
      log(`Video cargado: ${video.videoWidth}x${video.videoHeight}`);
    });
  })
  .catch(err => {
    log('Error al acceder a la cámara', err);
    alert('No se pudo acceder a la cámara: ' + err.message);
  });

btn.addEventListener('click', async () => {
  log('Botón tomar foto presionado');

  try {
    // Verificar que el video esté funcionando
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error('Video no está listo');
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    log(`Canvas configurado: ${canvas.width}x${canvas.height}`);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    let imgData = canvas.toDataURL('image/jpeg', 0.8);
    log(`Imagen capturada, tamaño: ${imgData.length} caracteres`);

    // Obtener geolocalización con timeout
    const coords = await getCurrentPosition();
    log('Ubicación obtenida', coords);

    saveAndShowImage(imgData, coords);
    saveToIndexedDB(imgData, coords);
    log('Imagen guardada correctamente');
  } catch (error) {
    log('Error al tomar foto', error);
    alert('Error al tomar foto: ' + error.message);
  }
});

// Función para obtener posición con Promise
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no disponible'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        resolve(coords);
      },
      error => {
        log('Error de geolocalización', error);
        // Usar coordenadas por defecto si falla
        resolve({ lat: -34.6037, lon: -58.3816 });
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  });
}

function saveAndShowImage(dataUrl, coords) {
  log('Mostrando imagen en galería');
  let container = document.createElement('div');
  container.classList.add('gallery-item');

  let img = document.createElement('img');
  img.src = dataUrl;
  img.alt = 'Foto tomada';
  img.classList.add('thumbnail');
  img.addEventListener('click', () => showFullImage(dataUrl, coords));

  let p = document.createElement('p');
  p.textContent = `Lat: ${coords.lat.toFixed(5)}, Lon: ${coords.lon.toFixed(
    5,
  )}`;

  container.appendChild(img);
  container.appendChild(p);

  gallery.prepend(container);
}

function showFullImage(src, coords) {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  const img = document.createElement('img');
  img.src = src;
  img.classList.add('full-image');

  const p = document.createElement('p');
  p.textContent = `Lat: ${coords.lat.toFixed(5)}, Lon: ${coords.lon.toFixed(
    5,
  )}`;
  p.classList.add('image-coords');

  overlay.appendChild(img);
  overlay.appendChild(p);

  overlay.addEventListener('click', () => document.body.removeChild(overlay));
  document.body.appendChild(overlay);
}

function saveToIndexedDB(imageData, coords) {
  return new Promise((resolve, reject) => {
    log('Guardando en IndexedDB');
    let request = indexedDB.open('PhotoDB', 1);

    request.onupgradeneeded = () => {
      log('Creando base de datos IndexedDB');
      request.result.createObjectStore('photos', { autoIncrement: true });
    };

    request.onsuccess = () => {
      try {
        let db = request.result;
        let tx = db.transaction('photos', 'readwrite');
        let store = tx.objectStore('photos');
        let addRequest = store.add({
          imageData,
          coords,
          timestamp: Date.now(),
        });

        addRequest.onsuccess = () => {
          log('Imagen guardada en IndexedDB exitosamente');
          resolve();
        };

        addRequest.onerror = () => {
          log('Error al guardar en IndexedDB', addRequest.error);
          reject(addRequest.error);
        };
      } catch (error) {
        log('Error en transacción IndexedDB', error);
        reject(error);
      }
    };

    request.onerror = () => {
      log('Error al abrir IndexedDB', request.error);
      reject(request.error);
    };
  });
}

window.addEventListener('load', () => {
  log('Ventana cargada, registrando service worker');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('service-worker.js')
      .then(registration => {
        log('Service Worker registrado exitosamente');
      })
      .catch(error => {
        log('Error al registrar Service Worker', error);
      });
  }

  // Cargar fotos existentes
  loadExistingPhotos();
});

function loadExistingPhotos() {
  log('Cargando fotos existentes');
  let request = indexedDB.open('PhotoDB', 1);

  request.onsuccess = () => {
    let db = request.result;
    let tx = db.transaction('photos', 'readonly');
    let store = tx.objectStore('photos');
    let cursor = store.openCursor();

    cursor.onsuccess = () => {
      let cur = cursor.result;
      if (cur) {
        log('Cargando foto desde IndexedDB');
        saveAndShowImage(cur.value.imageData, cur.value.coords);
        cur.continue();
      } else {
        log('Todas las fotos cargadas');
      }
    };

    cursor.onerror = () => {
      log('Error al cargar fotos', cursor.error);
    };
  };
}

// Consulta a API local
document.getElementById('api-btn').addEventListener('click', () => {
  // "http://192.168.1.1/cgi-bin/cgiclient?request={"FunctionName":"GetBeamData","Params":{"BeamId":8}}"

  //fetch('https://127.0.0.1') // Cambiar por la ruta real
  //fetch('https://127.0.0.1')
  //fetch('https://portalbackup.orbith.com') // Cambiar por la ruta real
  fetch(
    'http://192.168.1.1/cgi-bin/cgiclient?request={"FunctionName":"GetBeamData","Params":{"BeamId":8}}',
  )
    .then(res => res.json())
    .then(data => {
      document.getElementById('api-result').textContent = JSON.stringify(
        data,
        null,
        2,
      );
    })
    .catch(err => {
      document.getElementById('api-result').textContent =
        'ErrOR al consultar la API local';
    });
});

// Consulta a API remota
document.getElementById('api-btn2').addEventListener('click', () => {
  // http://192.168.1.1/cgi-bin/cgiclient?request={"FunctionName":"GetBeamData","Params":{"BeamId":8}}

  //fetch('http://192.168.1.1/html/login_inter.html') // Cambiar por la ruta real
  fetch(
    'https://api.openweathermap.org/data/2.5/weather?lang=es&units=metric&lat=-34.6037&lon=-58.3816&cnt=12&appid=059b4798edc77a61d9344ec2f33a1251',
  ) // Cambiar por la ruta real
    .then(res => res.json())
    .then(data => {
      document.getElementById('api-result2').textContent = JSON.stringify(
        data,
        null,
        2,
      );
    })
    .catch(err => {
      document.getElementById('api-result2').textContent =
        'ErrOR al consultar la API local';
    });
});

// === CLASE EVENTBUS PARA PWA ===
class PWAEventBus {
  constructor() {
    this.subscribers = new Map();
    this.pendingRequests = new Map();
    this.messageIdCounter = 0;

    // Múltiples listeners para diferentes entornos
    this.setupMessageListeners();

    log('PWAEventBus inicializado');
  }

  setupMessageListeners() {
    // Listener para React Native WebView
    if (window.ReactNativeWebView) {
      // Para React Native, usar el objeto global
      window.addEventListener('message', this.handleMessage.bind(this));
      log('Listener configurado para ReactNativeWebView');
    } else {
      // Fallback para desarrollo/testing
      window.addEventListener('message', this.handleMessage.bind(this));
      log('Listener configurado para entorno de desarrollo');
    }

    // Listener adicional para document
    document.addEventListener('message', this.handleMessage.bind(this));

    // Listener global para capturar todos los mensajes
    window.onmessage = this.handleMessage.bind(this);

    // Debug: Mostrar todos los eventos de mensaje
    const originalAddEventListener = window.addEventListener;
    const self = this;
    window.addEventListener = function (type, listener, options) {
      if (type === 'message') {
        log('Nuevo listener de mensaje registrado');
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  handleMessage(event) {
    try {
      log('Evento de mensaje recibido:', event);

      let messageData;

      // Intentar múltiples formas de extraer los datos
      if (event.data) {
        messageData = event.data;
      } else if (event.detail) {
        messageData = event.detail;
      } else {
        log('No se encontraron datos en el evento');
        return;
      }

      // Parsear el mensaje
      let message;
      if (typeof messageData === 'string') {
        try {
          message = JSON.parse(messageData);
        } catch (parseError) {
          log('Error parsing JSON:', parseError);
          return;
        }
      } else if (typeof messageData === 'object') {
        message = messageData;
      } else {
        log('Tipo de datos no reconocido:', typeof messageData);
        return;
      }

      log('Mensaje procesado desde React Native:', message);

      if (message.isResponse && message.responseToMessageId) {
        this.handleResponse(message);
      } else {
        this.handleIncomingEvent(message);
      }
    } catch (error) {
      log('Error general en handleMessage:', error);
    }
  }

  handleResponse(message) {
    const pendingRequest = this.pendingRequests.get(
      message.responseToMessageId,
    );
    if (pendingRequest) {
      pendingRequest.resolve(message.payload);
      this.pendingRequests.delete(message.responseToMessageId);
      log('Respuesta procesada para messageId:', message.responseToMessageId);
    }
  }

  async handleIncomingEvent(message) {
    const subscribers = this.subscribers.get(message.type);
    if (subscribers && subscribers.size > 0) {
      try {
        log(`Procesando evento: ${message.type}`, message.payload);

        const promises = Array.from(subscribers).map(callback =>
          callback(message.payload),
        );

        const responses = await Promise.all(promises);
        const response = responses[0]; // Tomar la primera respuesta

        if (message.messageId) {
          this.sendResponse(message.messageId, response);
        }
      } catch (error) {
        log(`Error handling event ${message.type}:`, error);

        if (message.messageId) {
          this.sendResponse(message.messageId, {
            code: 'HANDLER_ERROR',
            message: error.message,
            details: error,
          });
        }
      }
    } else {
      log(`No hay suscriptores para el evento: ${message.type}`);
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
    log('Respuesta enviada para messageId:', messageId);
  }

  generateMessageId() {
    return `pwa_${Date.now()}_${++this.messageIdCounter}`;
  }

  postMessageToReactNative(message) {
    try {
      const messageString = JSON.stringify(message);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(messageString);
        log('Mensaje enviado a React Native via ReactNativeWebView');
      } else {
        // Fallback para development/testing
        window.parent.postMessage(messageString, '*');
        log('Mensaje enviado via window.parent.postMessage');
      }
    } catch (error) {
      log('Error sending message to React Native', error);
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
      log(`Evento emitido: ${eventType}`, payload);

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
    log(`Suscrito al evento: ${eventType}`);

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
    log(`Desuscrito del evento: ${eventType}`);
  }
}

// Inicializar EventBus
const eventBus = new PWAEventBus();

// === IMPLEMENTACIÓN DE CUSTOM EVENTS ===

// Botón para enviar custom event a React Native
const customEventBtn = document.createElement('button');
customEventBtn.textContent = 'Enviar Custom Event';
customEventBtn.id = 'custom-event-btn';
document.body.appendChild(customEventBtn);

// Área para mostrar respuestas de custom events
const customEventResult = document.createElement('pre');
customEventResult.id = 'custom-event-result';
customEventResult.style.cssText = `
  background: #e8f4fd;
  border: 1px solid #007acc;
  padding: 10px;
  margin: 10px auto;
  width: 90%;
  max-width: 500px;
  white-space: pre-wrap;
  text-align: left;
  font-family: monospace;
  color: #333;
`;
document.body.appendChild(customEventResult);

// Suscribirse a custom events de React Native
eventBus.subscribe('custom_event', async payload => {
  log('Custom event recibido desde React Native', payload);
  customEventResult.textContent = `Evento recibido desde React Native:\n${JSON.stringify(
    payload,
    null,
    2,
  )}`;

  // Responder con otro custom event
  return {
    message: 'Custom event procesado exitosamente por PWA',
    timestamp: Date.now(),
    originalData: payload,
    pwaInfo: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
    },
  };
});

// Enviar custom event al hacer clic en el botón
customEventBtn.addEventListener('click', async () => {
  log('Enviando custom event a React Native');

  try {
    const response = await eventBus.emit('pwa_custom_event', {
      message: 'Hola desde PWA!',
      timestamp: Date.now(),
      randomNumber: Math.floor(Math.random() * 1000),
      coords: await getCurrentPosition(),
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
      },
    });

    log('Respuesta del custom event recibida', response);
    customEventResult.textContent = `Respuesta de React Native:\n${JSON.stringify(
      response,
      null,
      2,
    )}`;
  } catch (error) {
    log('Error enviando custom event', error);
    customEventResult.textContent = `Error: ${error.message}`;
  }
});

// Notificar que la PWA está lista
window.addEventListener('load', () => {
  // ...existing code...

  // Notificar a React Native que PWA está lista
  setTimeout(() => {
    eventBus
      .emit('pwa_ready', {
        timestamp: Date.now(),
        version: '1.0.0',
        features: ['camera', 'geolocation', 'indexeddb', 'custom-events'],
      })
      .catch(error => {
        log(
          'React Native aún no está listo para recibir eventos:',
          error.message,
        );
      });
  }, 1000);
});
