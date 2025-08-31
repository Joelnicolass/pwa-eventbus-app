import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

const NativeCamera = () => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission().then(result => {
        if (!result) {
          Alert.alert(
            'Permiso denegado',
            'No se pudo obtener permiso para la cámara',
          );
        }
      });
    }
  }, [hasPermission, requestPermission]);

  const isAvailable = device && hasPermission;

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      Alert.alert('Código escaneado', codes.map(c => c.value).join(', '));
    },
  });

  const takePhoto = async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({ flash: 'off' });
        console.log('Foto tomada:', photo.path);
        Alert.alert('Foto tomada', `Guardada en: ${photo.path}`);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

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
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    );

  return null;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default NativeCamera;
