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

        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    );

  return null;
};

export default NativeCamera;
