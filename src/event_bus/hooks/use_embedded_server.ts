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

const EMBEDDED_INITIAL_STATE: EmbeddedServerState = {
  url: null,
  isServerReady: false,
  isLoading: false,
  error: null,
};

const createEmbeddedSuccesState = (url: string): EmbeddedServerState => ({
  url,
  isServerReady: true,
  isLoading: false,
  error: null,
});

const createEmbeddedErrorState = (
  errorMessage: string,
): EmbeddedServerState => ({
  url: null,
  isServerReady: false,
  isLoading: false,
  error: errorMessage,
});

export const useEmbeddedServer = (shouldStart: boolean = false) => {
  const [serverState, setServerState] = useState<EmbeddedServerState>(
    EMBEDDED_INITIAL_STATE,
  );

  const refServer = useRef<Server | null>(null);
  const isInitialized = useRef(false);

  const startServer = useCallback(async () => {
    if (refServer.current || isInitialized.current) return serverState.url;

    isInitialized.current = true;
    const webRoot = `${RNFS.DocumentDirectoryPath}/webroot`;

    setServerState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const exists = await RNFS.exists(webRoot);
      if (exists) await RNFS.unlink(webRoot);

      await extractBundledAssets(webRoot, 'www');
      const files = await RNFS.readDir(webRoot);

      if (files.length === 0)
        throw new Error('No se encontraron archivos PWA en el bundle');

      const server = new Server({
        fileDir: webRoot,
        port: 8080,
        nonLocal: false,
      });

      const startedUrl = await server.start();

      refServer.current = server;
      setServerState(createEmbeddedSuccesState(startedUrl));

      return startedUrl;
    } catch (err) {
      console.error('Error iniciando server:', err);
      const errorMessage =
        'No se pudo iniciar el servidor local: ' + (err as Error).message;

      isInitialized.current = false;
      setServerState(createEmbeddedErrorState(errorMessage));

      Alert.alert('Error', errorMessage);
      return null;
    }
  }, [serverState.url]);

  const stopServer = useCallback(() => {
    if (refServer.current) {
      refServer.current.stop();
      refServer.current = null;
      isInitialized.current = false;
      setServerState(EMBEDDED_INITIAL_STATE);
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
