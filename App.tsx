import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Server, {
  extractBundledAssets,
} from '@dr.pogodin/react-native-static-server';
import * as RNFS from '@dr.pogodin/react-native-fs';

export default function App() {
  const [url, setUrl] = useState<string | null>(null);
  const [isServerReady, setIsServerReady] = useState(false);
  const refServer = useRef<Server | null>(null);
  const webViewRef = useRef<WebView>(null);

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

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('Error en WebView:', nativeEvent);
    Alert.alert('Error WebView', `Error: ${nativeEvent.description}`);
  };

  const handleWebViewMessage = (event: any) => {
    const message = event.nativeEvent.data;
    console.log('Mensaje desde WebView:', message);
  };

  const handleNavigationStateChange = (navState: any) => {
    console.log('WebView navegación:', navState.url);
  };

  const handleLoadStart = () => {
    console.log('WebView: Iniciando carga...');
  };

  const handleLoadEnd = () => {
    console.log('WebView: Carga completada');
  };

  if (!url || !isServerReady) {
    return null; // Podríamos mostrar un loading spinner aquí
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webView: { flex: 1 },
});
