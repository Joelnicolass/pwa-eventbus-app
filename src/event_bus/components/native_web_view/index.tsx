import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useGlobalEventBus } from '../../providers/event_bus_provider';
import {
  WebViewErrorEvent,
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes';
import { nativeWebViewStyles } from './styles';

// 🌐 User Agent optimizado para dominios externos
const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 PWANative/1.0';

interface NativeWebViewProps {
  url: string;
  hide?: boolean;
  onLoadEnd?: () => void;
  onLoadStart?: () => void;
  onNavigationStateChange?: (navState: any) => void;
}

export interface NativeWebViewRef {
  reload: () => void;
  goBack: () => void;
  goForward: () => void;
}

const NativeWebView = forwardRef<NativeWebViewRef, NativeWebViewProps>(
  (
    { url, onLoadEnd, onLoadStart, onNavigationStateChange, hide = false },
    ref,
  ) => {
    const styles = nativeWebViewStyles;

    const eventBus = useGlobalEventBus();
    const webViewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      reload: () => webViewRef.current?.reload(),
      goBack: () => webViewRef.current?.goBack(),
      goForward: () => webViewRef.current?.goForward(),
    }));

    const handleWebViewError = (syntheticEvent: WebViewErrorEvent) => {
      const { nativeEvent } = syntheticEvent;
      console.error('WebView Error:', nativeEvent);

      // 🌐 Manejo específico de errores para dominios externos
      if (nativeEvent.code === -1009) {
        Alert.alert(
          'Sin conexión',
          'No se puede conectar al servidor. Verifica tu conexión a internet.',
        );
      } else if (nativeEvent.code === -1001) {
        Alert.alert(
          'Timeout',
          'La conexión tardó demasiado. Intenta nuevamente.',
        );
      } else {
        Alert.alert(
          'Error de red',
          `No se pudo cargar la aplicación: ${nativeEvent.description}`,
        );
      }
    };

    const handleWebViewMessage = (event: WebViewMessageEvent) => {
      if (eventBus) eventBus.handleMessage(event);
    };

    const handleLoadEnd = () => {
      if (webViewRef.current) eventBus?.setWebViewRef(webViewRef);
      onLoadEnd?.();
    };

    const handleLoadStart = () => onLoadStart?.();

    const handleNavigationStateChange = (navState: WebViewNavigation) =>
      onNavigationStateChange?.(navState);

    // 🔒 Headers adicionales para dominios externos (opcional)
    const customHeaders = {
      'X-App-Version': '1.0.0',
      'X-Platform': 'ReactNative',
    };

    return (
      <WebView
        ref={webViewRef}
        source={{
          uri: url,
          headers: customHeaders,
        }}
        style={hide ? styles.hide : styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        onShouldStartLoadWithRequest={request => {
          try {
            // Validación básica de URL
            if (!url || !request.url) return false;

            // Permitir URL inicial
            if (request.url === url) return true;

            // Extraer dominio de forma segura
            const urlParts = url.split('/');
            const requestParts = request.url.split('/');

            if (urlParts.length < 3 || requestParts.length < 3) return false;

            const allowedDomain = urlParts[2]; // protocolo://dominio/...
            const requestDomain = requestParts[2];

            // Permitir el dominio principal y subdominios
            if (
              requestDomain === allowedDomain ||
              requestDomain.endsWith(`.${allowedDomain}`)
            ) {
              return true;
            }

            // Permitir esquemas especiales (tel:, mailto:, etc.)
            if (
              ['tel:', 'mailto:', 'sms:'].some(scheme =>
                request.url.startsWith(scheme),
              )
            ) {
              return true;
            }

            console.warn('Blocked external navigation to:', request.url);
            return false;
          } catch (error) {
            console.warn('Error validating navigation request:', error);
            return false;
          }
        }}
        onError={handleWebViewError}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        userAgent={USER_AGENT}
        cacheEnabled={true}
        incognito={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheMode="LOAD_DEFAULT"
        // 🔧 Props específicos por plataforma
        {...(Platform.OS === 'ios' && {
          decelerationRate: 'normal' as const,
          bounces: false,
          scrollEnabled: true,
          allowsLinkPreview: false,
        })}
        {...(Platform.OS === 'android' && {
          overScrollMode: 'never' as const,
          nestedScrollEnabled: true,
        })}
      />
    );
  },
);

export default NativeWebView;
