import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { useVisionCamera } from './use_vision_camera';
import { nativeCameraStyles } from './styles';

const NativeCamera = () => {
  const styles = nativeCameraStyles;

  const { hasPermission, device, camera, takePhoto, codeScanner, goBack } =
    useVisionCamera();

  const isAvailable = device && hasPermission;

  // 🐛 DEBUG: Agregar logs para verificar que las funciones existen
  console.log('📷 NativeCamera render - Functions available:', {
    takePhoto: typeof takePhoto,
    goBack: typeof goBack,
    hasPermission,
    device: !!device,
  });

  if (isAvailable)
    return (
      <View style={styles.container}>
        <Camera
          ref={camera}
          photo={true}
          isActive={true}
          device={device}
          codeScanner={codeScanner}
          style={StyleSheet.absoluteFill}
        />

        {/* 🔧 Asegurar que los botones estén por encima con zIndex alto */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => {
              console.log('📷 Capture button pressed');
              takePhoto();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    );

  return null;
};

export default NativeCamera;
