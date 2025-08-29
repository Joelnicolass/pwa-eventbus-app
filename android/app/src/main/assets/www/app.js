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
