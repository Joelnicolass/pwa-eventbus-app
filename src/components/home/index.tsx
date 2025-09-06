import React, { useMemo, useRef } from 'react';
import { StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';
import { useNativeServices } from '../../event_bus/hooks/use_native_services';
import { usePermissions } from '../../event_bus/hooks/use_permissions';
import { useEmbeddedServer } from '../../event_bus/hooks/use_embedded_server';
import { usePwaReadyNotification } from '../../event_bus/hooks/use_pwa_ready_notification';
import NativeCamera from '../../event_bus/components/native_camera';
import { useNativeCameraProvider } from '../../event_bus/providers/native_camera_provider';

export default function HomeScreen() {
  const { isLoading: permissionsLoading, allPermissionsGranted } =
    usePermissions();

  const shouldStartServer = useMemo(
    () => !permissionsLoading && allPermissionsGranted,
    [permissionsLoading, allPermissionsGranted],
  );

  const { isActive: isActiveCamera, setIsActive: setIsActiveCamera } =
    useNativeCameraProvider();

  const webViewRef = useRef<WebView>(null);
  const { url, isServerReady } = useEmbeddedServer(shouldStartServer);
  const { eventBus } = usePwaReadyNotification({ isServerReady });

  useNativeServices();

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    Alert.alert('Error WebView', `Error: ${nativeEvent.description}`);
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    if (eventBus) eventBus.handleMessage(event);
  };

  const handleNavigationStateChange = (_state: WebViewNavigation) => null;
  const handleLoadStart = () => null;
  const handleLoadEnd = () => {
    if (webViewRef.current) eventBus?.setWebViewRef(webViewRef);
  };

  if (!url || !isServerReady) return null;

  if (isActiveCamera) return <NativeCamera />;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => setIsActiveCamera(true)}
      >
        <Text style={styles.testButtonText}>camera on</Text>
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
        cacheEnabled={false}
        incognito={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheMode="LOAD_NO_CACHE"
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
