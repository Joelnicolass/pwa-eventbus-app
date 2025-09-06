import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import Server, {
  extractBundledAssets,
} from '@dr.pogodin/react-native-static-server';
import * as RNFS from '@dr.pogodin/react-native-fs';

interface EmbeddedServerState {
  url: string | null;
  isServerReady: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useEmbeddedServer = (shouldStart: boolean = false) => {
  const [serverState, setServerState] = useState<EmbeddedServerState>({
    url: null,
    isServerReady: false,
    isLoading: false,
    error: null,
  });

  const refServer = useRef<Server | null>(null);
  const isInitialized = useRef(false);

  const startServer = useCallback(async () => {
    console.log('🚀 [useEmbeddedServer] Intentando iniciar servidor...');
    console.log('🚀 [useEmbeddedServer] refServer.current:', !!refServer.current);
    console.log('🚀 [useEmbeddedServer] isInitialized.current:', isInitialized.current);
    
    if (refServer.current || isInitialized.current) {
      console.log('🚀 [useEmbeddedServer] Servidor ya iniciado o inicializándose...');
      return serverState.url;
    }

    isInitialized.current = true;
    const webRoot = `${RNFS.DocumentDirectoryPath}/webroot`;
    console.log('🚀 [useEmbeddedServer] Iniciando servidor en:', webRoot);

    setServerState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Limpiar directorio anterior si existe
      const exists = await RNFS.exists(webRoot);
      console.log('🚀 [useEmbeddedServer] Directorio webRoot existe:', exists);
      
      if (exists) {
        await RNFS.unlink(webRoot);
        console.log('🚀 [useEmbeddedServer] Directorio anterior eliminado');
      }

      // Extrae assets de "www" (carpeta que empaquetamos en android/app/src/main/assets/www)
      console.log('🚀 [useEmbeddedServer] Extrayendo assets bundled...');
      await extractBundledAssets(webRoot, 'www');
      console.log('🚀 [useEmbeddedServer] Assets extraídos exitosamente');

      // Verificar que los archivos se extrajeron correctamente
      const files = await RNFS.readDir(webRoot);
      console.log('🚀 [useEmbeddedServer] Archivos en webRoot:', files.map(f => f.name));

      if (files.length === 0) {
        throw new Error('No se encontraron archivos PWA en el bundle');
      }

      console.log('🚀 [useEmbeddedServer] Creando servidor en puerto 8080...');
      const server = new Server({
        fileDir: webRoot,
        port: 8080,
        nonLocal: false,
      });

      console.log('🚀 [useEmbeddedServer] Iniciando servidor...');
      const startedUrl = await server.start();
      console.log('🚀 [useEmbeddedServer] Servidor estático iniciado en:', startedUrl);
      
      refServer.current = server;
      setServerState({
        url: startedUrl,
        isServerReady: true,
        isLoading: false,
        error: null,
      });

      return startedUrl;
    } catch (err) {
      console.error('❌ [useEmbeddedServer] Error iniciando server:', err);
      const errorMessage = 'No se pudo iniciar el servidor local: ' + (err as Error).message;
      
      isInitialized.current = false;
      setServerState({
        url: null,
        isServerReady: false,
        isLoading: false,
        error: errorMessage,
      });

      Alert.alert('Error', errorMessage);
      return null;
    }
  }, [serverState.url]);

  const stopServer = useCallback(() => {
    if (refServer.current) {
      refServer.current.stop();
      refServer.current = null;
      isInitialized.current = false;
      setServerState({
        url: null,
        isServerReady: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const restartServer = useCallback(async () => {
    stopServer();
    return await startServer();
  }, [stopServer, startServer]);

  useEffect(() => {
    if (shouldStart && !isInitialized.current) {
      startServer();
    }
  }, [shouldStart, startServer]);

  useEffect(() => {
    return () => {
      stopServer();
    };
  }, [stopServer]);

  return {
    ...serverState,
    startServer,
    stopServer,
    restartServer,
  };
};
