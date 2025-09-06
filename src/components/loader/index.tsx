import { View, ActivityIndicator } from 'react-native';
import React from 'react';
import { loaderStyles } from './styles';

interface LoaderProps {
  fullscreen?: boolean;
}

const Loader = ({ fullscreen = false }: LoaderProps) => {
  const styles = loaderStyles;

  return (
    <View style={[styles.container, fullscreen && styles.fullscreenContainer]}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
};

export default Loader;
