import React, { useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNativeServices } from '../../event_bus/hooks/use_native_services';
import { useNativePermissions } from '../../event_bus/hooks/use_native_permissions';
import { useEmbeddedServer } from '../../event_bus/hooks/use_embedded_server';
import { usePwaReadyNotification } from '../../event_bus/hooks/use_pwa_ready_notification';
import NativeCamera from '../../event_bus/components/native_camera';
import NativeWebView, {
  NativeWebViewRef,
} from '../../event_bus/components/native_web_view';
import { useNativeCameraContext } from '../../event_bus/providers/native_camera_provider';
import Loader from '../loader';

export default function HomeScreen() {
  const { isActive: isActiveCam } = useNativeCameraContext();

  const { isLoading: permissionsLoading, allPermissionsGranted } =
    useNativePermissions();

  const shouldStartServer = useMemo(
    () => !permissionsLoading && allPermissionsGranted,
    [permissionsLoading, allPermissionsGranted],
  );

  const { url, isServerReady } = useEmbeddedServer(shouldStartServer);
  usePwaReadyNotification({ isServerReady });

  useNativeServices();

  const webViewRef = useRef<NativeWebViewRef>(null);

  if (!url || !isServerReady) return <Loader fullscreen />;

  if (isActiveCam) return <NativeCamera />;

  return (
    <SafeAreaView style={styles.container}>
      <NativeWebView ref={webViewRef} url={url} />
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
