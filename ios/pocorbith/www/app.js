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

// Inicializar EventBus usando la clase del módulo
const eventBus = new window.PWAEventBus();
const EVENT = window.EventTypes;

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

  const res = await eventBus.emit(EVENT.HTTP_REQUEST, {
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/users/1',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  log('Respuesta del HTTP request recibido desde React Native', res);

  return res;
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

// INPUT Y EVENTO PARA GUARDAR EN STORAGE
// Los elementos ya están definidos en el HTML, solo necesitamos referenciarlos
const storageInput = document.getElementById('storage-input');
const saveStorageBtn = document.getElementById('save-storage-btn');
const storageResult = document.getElementById('storage-result');

// === FUNCIONALIDAD DE GEOLOCALIZACIÓN ===
// Referencias a los elementos de la UI de geolocalización
const getLocationBtn = document.getElementById('get-location-btn');
const startTrackingBtn = document.getElementById('start-tracking-btn');
const stopTrackingBtn = document.getElementById('stop-tracking-btn');
const locationData = document.getElementById('location-data');
const trackingData = document.getElementById('tracking-data');

let isTracking = false;

// Función para formatear datos de ubicación
function formatLocationData(locationResponse) {
  if (!locationResponse.success) {
    return `Error: ${locationResponse.error || 'Error desconocido'}`;
  }

  return `Ubicación obtenida exitosamente:
Latitud: ${locationResponse.latitude}°
Longitud: ${locationResponse.longitude}°
Precisión: ${locationResponse.accuracy ? locationResponse.accuracy.toFixed(2) + ' metros' : 'N/A'}
Altitud: ${locationResponse.altitude ? locationResponse.altitude.toFixed(2) + ' metros' : 'N/A'}
Velocidad: ${locationResponse.speed ? locationResponse.speed.toFixed(2) + ' m/s' : 'N/A'}
Dirección: ${locationResponse.heading ? locationResponse.heading.toFixed(2) + '°' : 'N/A'}
Timestamp: ${new Date(locationResponse.timestamp).toLocaleString()}`;
}

// Obtener ubicación actual
getLocationBtn.addEventListener('click', async () => {
  log('Solicitando ubicación actual...');
  locationData.textContent = 'Obteniendo ubicación...';
  
  try {
    const response = await eventBus.emit(EVENT.GET_LOCATION, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000
    });

    log('Respuesta de geolocalización recibida', response);
    locationData.textContent = formatLocationData(response);
  } catch (error) {
    log('Error obteniendo ubicación', error);
    locationData.textContent = `Error: ${error.message}`;
  }
});

// Iniciar seguimiento de ubicación
startTrackingBtn.addEventListener('click', async () => {
  log('Iniciando seguimiento de ubicación...');
  trackingData.textContent = 'Iniciando seguimiento...';
  
  try {
    const response = await eventBus.emit(EVENT.START_LOCATION_TRACKING, {
      enableHighAccuracy: true,
      distanceFilter: 10, // 10 metros
      interval: 5000 // 5 segundos
    });

    log('Respuesta de inicio de seguimiento', response);
    
    if (response.success) {
      isTracking = true;
      startTrackingBtn.disabled = true;
      stopTrackingBtn.disabled = false;
      trackingData.textContent = 'Seguimiento activo - Esperando actualizaciones de ubicación...';
    } else {
      trackingData.textContent = `Error iniciando seguimiento: ${response.error}`;
    }
  } catch (error) {
    log('Error iniciando seguimiento', error);
    trackingData.textContent = `Error: ${error.message}`;
  }
});

// Detener seguimiento de ubicación
stopTrackingBtn.addEventListener('click', async () => {
  log('Deteniendo seguimiento de ubicación...');
  trackingData.textContent = 'Deteniendo seguimiento...';
  
  try {
    const response = await eventBus.emit(EVENT.STOP_LOCATION_TRACKING, {});

    log('Respuesta de detener seguimiento', response);
    
    if (response.success) {
      isTracking = false;
      startTrackingBtn.disabled = false;
      stopTrackingBtn.disabled = true;
      trackingData.textContent = 'Seguimiento detenido.';
    } else {
      trackingData.textContent = `Error deteniendo seguimiento: ${response.error}`;
    }
  } catch (error) {
    log('Error deteniendo seguimiento', error);
    trackingData.textContent = `Error: ${error.message}`;
  }
});

// Suscribirse a actualizaciones de ubicación desde React Native
eventBus.subscribe('location_update', async (payload) => {
  log('Actualización de ubicación recibida', payload);
  
  if (isTracking) {
    trackingData.textContent = `Seguimiento activo - Última actualización:
${formatLocationData(payload)}`;
  }
  
  // No necesitamos devolver una respuesta para este evento
  return { received: true };
});

// Manejar clic para guardar en storage
saveStorageBtn.addEventListener('click', async () => {
  const text = storageInput.value.trim();
  if (!text) {
    alert('Por favor ingresa un texto para guardar.');
    return;
  }

  log('Guardando en storage:', text);

  try {
    const response = await eventBus.emit(EVENT.SET_IN_LOCAL_STORAGE, {
      key: 'pwa_saved_text',
      value: text,
    });

    log('Respuesta del guardado en storage', response);
    storageResult.textContent = `Guardado exitoso:\n${JSON.stringify(
      response,
      null,
      2,
    )}`;

    // Limpiar input
    storageInput.value = '';
  } catch (error) {
    log('Error guardando en storage', error);
    storageResult.textContent = `Error: ${error.message}`;
  }
});

// Al cargar, intentar leer valor guardado
window.addEventListener('load', async () => {
  try {
    const response = await eventBus.emit(EVENT.GET_FROM_LOCAL_STORAGE, {
      key: 'pwa_saved_text',
      requestId: 'initial_load',
    });

    log('Valor leído del storage al cargar', response);

    if (response.value) {
      storageResult.textContent = `Valor en storage:\n${JSON.stringify(
        response,
        null,
        2,
      )}`;
    } else {
      storageResult.textContent = 'No hay valor guardado en storage.';
    }
  } catch (error) {
    log('Error leyendo desde storage al cargar', error);
    storageResult.textContent = `Error: ${error.message}`;
  }
});
