import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useGlobalEventBus } from '../../providers/event_bus_provider';
import {
  WebViewErrorEvent,
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes';
import { nativeWebViewStyles } from './styles';

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36';

interface NativeWebViewProps {
  url: string;
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
  ({ url, onLoadEnd, onLoadStart, onNavigationStateChange }, ref) => {
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
      Alert.alert('Error WebView', `Error: ${nativeEvent.description}`);
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

    return (
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
        userAgent={USER_AGENT}
        cacheEnabled={false}
        incognito={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheMode="LOAD_NO_CACHE"
      />
    );
  },
);

export default NativeWebView;
