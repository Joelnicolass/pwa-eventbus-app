import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Server, {
  extractBundledAssets,
} from '@dr.pogodin/react-native-static-server';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { useNativeServices } from '../../event_bus/hooks/use_native_services';
import { useEventBusContext } from '../../event_bus/providers/event_bus_provider';
import NativeCamera from '../../event_bus/components/native_camera';
import { EventTypes } from '../../event_bus/types';
import { useNativeCameraProvider } from '../../event_bus/providers/native_camera_provider';

export default function HomeScreen() {
  const { isActive, setIsActive } = useNativeCameraProvider();
  const { eventBus, setWebViewRef } = useEventBusContext();

  const [url, setUrl] = useState<string | null>(null);
  const [isServerReady, setIsServerReady] = useState(false);
  const refServer = useRef<Server | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Configurar el WebView ref en el provider global
  useEffect(() => {
    if (webViewRef.current) {
      console.log('🔗 Configurando WebView ref en el provider global');
      setWebViewRef(webViewRef); // Pasar el ref completo, no .current
    }
  }, [setWebViewRef]);

  // Inicializar todos los servicios nativos usando el hook centralizado
  useNativeServices();

  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);

          console.log('Permisos otorgados:', granted);

          // Verificar que todos los permisos críticos estén otorgados
          const criticalPermissions = [
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];

          const allGranted = criticalPermissions.every(
            permission =>
              granted[permission] === PermissionsAndroid.RESULTS.GRANTED,
          );

          if (!allGranted) {
            Alert.alert(
              'Permisos necesarios',
              'La aplicación necesita permisos de cámara y ubicación para funcionar correctamente.',
            );
          }
        } catch (err) {
          console.warn('Error solicitando permisos:', err);
        }
      }
    }

    async function startServer() {
      const webRoot = `${RNFS.DocumentDirectoryPath}/webroot`;
      console.log('Iniciando servidor en:', webRoot);

      try {
        // Limpiar directorio anterior si existe
        const exists = await RNFS.exists(webRoot);
        if (exists) {
          await RNFS.unlink(webRoot);
          console.log('Directorio anterior eliminado');
        }

        // Extrae assets de "www" (carpeta que empaquetamos en android/app/src/main/assets/www)
        await extractBundledAssets(webRoot, 'www');
        console.log('Assets extraídos exitosamente');

        // Listar archivos extraídos para debug
        const files = await RNFS.readDir(webRoot);
        console.log(
          'Archivos en webRoot:',
          files.map(f => f.name),
        );

        const server = new Server({
          fileDir: webRoot,
          port: 8080,
          nonLocal: false, // accesible solo desde localhost
        });

        const startedUrl = await server.start();
        console.log('Servidor estático en:', startedUrl);
        setUrl(startedUrl);
        setIsServerReady(true);
        refServer.current = server;
      } catch (err) {
        console.error('Error iniciando server:', err);
        Alert.alert(
          'Error',
          'No se pudo iniciar el servidor local: ' + (err as Error).message,
        );
      }
    }

    requestPermissions().then(() => {
      startServer();
    });

    return () => {
      if (refServer.current) {
        console.log('Deteniendo servidor...');
        refServer.current.stop();
        refServer.current = null;
      }
    };
  }, []);

  // Configurar suscripciones a eventos de la PWA
  useEffect(() => {
    if (!eventBus) return;

    // Ejemplo: Suscribirse a eventos de la PWA
    const unsubscribeInitialization = eventBus.subscribe(
      EventTypes.PWA_READY,
      async payload => {
        console.log('PWA está lista:', payload);
        // Responder que React Native también está listo
        return { status: 'native_ready', timestamp: Date.now() };
      },
    );

    // Cleanup de suscripciones
    return () => {
      unsubscribeInitialization();
    };
  }, [eventBus]);

  // Notificar a la PWA cuando React Native está listo
  useEffect(() => {
    if (eventBus && isServerReady) {
      // Pequeño delay para asegurar que la PWA esté cargada
      setTimeout(() => {
        eventBus
          .emit(EventTypes.NATIVE_READY, {
            platform: Platform.OS,
            version: Platform.Version,
            timestamp: Date.now(),
          })
          .catch(error => {
            console.log(
              'PWA aún no está lista para recibir eventos:',
              error.message,
            );
          });
      }, 2000);
    }
  }, [eventBus, isServerReady]);

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('Error en WebView:', nativeEvent);
    Alert.alert('Error WebView', `Error: ${nativeEvent.description}`);
  };

  const handleWebViewMessage = (event: any) => {
    const message = event.nativeEvent.data;
    console.log('📨 Mensaje desde WebView:', message);

    // ¡IMPORTANTE! Conectar el EventBus con los mensajes del WebView
    if (eventBus) {
      console.log('🔄 Procesando mensaje con EventBus global');
      eventBus.handleMessage(event);
    } else {
      console.warn('⚠️ EventBus no disponible para procesar mensaje');
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    console.log('WebView navegación:', navState.url);
  };

  const handleLoadStart = () => {
    console.log('WebView: Iniciando carga...');
  };

  const handleLoadEnd = () => {
    console.log('WebView: Carga completada');
    if (webViewRef.current) {
      console.log('🔗 Re-configurando WebView ref después de carga completa');
      setWebViewRef(webViewRef); // Asegurar que el ref esté configurado
    }
  };

  if (!url || !isServerReady) {
    return null; // Podríamos mostrar un loading spinner aquí
  }

  if (isActive) return <NativeCamera />;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => setIsActive(true)}
      >
        <Text style={styles.testButtonText}>camera on</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.testButton}
        onPress={async () => {
          try {
            const response = await eventBus?.emit(EventTypes.CUSTOM_EVENT, {
              test: 'Mensaje de prueba desde React Native',
            });
            console.log(
              'Respuesta de la PWA al evento personalizado:',
              response,
            );
          } catch (error) {
            console.error('Error enviando evento personalizado:', error);
          }
        }}
      >
        <Text style={styles.testButtonText}>
          Enviar mensaje de prueba a la PWA
        </Text>
      </TouchableOpacity>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="compatibility"
        onError={handleWebViewError}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        // Configuraciones adicionales para mejorar compatibilidad
        cacheEnabled={false} // Deshabilitar cache para desarrollo
        incognito={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheMode="LOAD_NO_CACHE" // Para Android
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webView: { flex: 1 },
  testButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
