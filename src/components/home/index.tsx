import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNativeServices } from '../../event_bus/hooks/use_native_services';
import { useNativePermissions } from '../../event_bus/hooks/use_native_permissions';
import { useExternalUrl } from '../../event_bus/hooks/use_external_url';
import { usePwaReadyNotification } from '../../event_bus/hooks/use_pwa_ready_notification';
import NativeCamera from '../../event_bus/components/native_camera';
import NativeWebView, {
  NativeWebViewRef,
} from '../../event_bus/components/native_web_view';
import { useNativeCameraContext } from '../../event_bus/providers/native_camera_provider';
import Loader from '../loader';
import { useGlobalEventBus } from '../../event_bus/providers/event_bus_provider';

// 🌐 CONFIGURACIÓN DE URL EXTERNA
const EXTERNAL_PWA_CONFIG = {
  // TODO: Reemplazar con tu dominio real
  externalUrl: 'https://rnwebeventbus.vercel.app',

  // Opcional: verificar conectividad antes de cargar
  checkConnectivity: true,

  // Timeout para verificación de conectividad
  timeoutMs: 5000,
};

export default function HomeScreen() {
  const { isActive: isActiveCam } = useNativeCameraContext();

  const { isLoading: permissionsLoading } = useNativePermissions();
  const eventBus = useGlobalEventBus();

  // 🔄 CAMBIO PRINCIPAL: Usar URL externa en lugar de servidor embebido
  const {
    url,
    isServerReady,
    isLoading: urlLoading,
    error,
  } = useExternalUrl(EXTERNAL_PWA_CONFIG);

  usePwaReadyNotification({ isServerReady });
  useNativeServices();

  const webViewRef = useRef<NativeWebViewRef>(null);

  // Mostrar loader mientras se verifican permisos o se configura la URL
  if (permissionsLoading || urlLoading) {
    return <Loader fullscreen />;
  }

  // Mostrar error si no se puede cargar la URL externa
  if (error || !url || !isServerReady) {
    console.error('Error cargando PWA externa:', error);
    return <Loader fullscreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableHighlight
        onPress={() => {
          eventBus?.emit('test', 'Datos desde React Native');
        }}
      >
        <Text>Enviar datos a web</Text>
      </TouchableHighlight>

      {isActiveCam && <NativeCamera />}

      <NativeWebView ref={webViewRef} url={url} hide={isActiveCam} />
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
