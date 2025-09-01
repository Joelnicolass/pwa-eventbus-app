import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useNativeCameraProvider } from '../../providers/native_camera_provider';

export const useVisionCamera = () => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [qrCodeDetected, setQrCodeDetected] = useState<boolean>(false);

  const { setIsActive } = useNativeCameraProvider();

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

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (qrCodeDetected) return;
      setQrCodeDetected(true);
      Alert.alert('Código escaneado', codes.map(c => c.value).join(', '), [
        {
          text: 'Confirmar',
          onPress: () => {
            setQrCodeDetected(false);
            setIsActive(false);
          },
        },
        {
          text: 'Cancelar',
          onPress: () => {
            setQrCodeDetected(false);
          },
        },
      ]);
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

  const goBack = () => {
    setIsActive(false);
  };

  return {
    camera,
    device,
    codeScanner,
    hasPermission,
    takePhoto,
    goBack,
  };
};
