import React from 'react';
import HomeScreen from './src/components/home';
import NativeCameraProvider from './src/event_bus/providers/native_camera_provider';
import { EventBusProvider } from './src/event_bus/providers/event_bus_provider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <EventBusProvider>
      <NativeCameraProvider>
        <SafeAreaProvider>
          <HomeScreen />
        </SafeAreaProvider>
      </NativeCameraProvider>
    </EventBusProvider>
  );
}
