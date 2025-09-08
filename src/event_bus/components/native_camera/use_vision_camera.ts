import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { useNativeCameraContext } from '../../providers/native_camera_provider';
import { TakePhotoDirectResponse } from '../../types';

export const useVisionCamera = () => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [qrCodeDetected, setQrCodeDetected] = useState<boolean>(false);

  const { setIsActive, resolvePhoto, rejectPhoto } = useNativeCameraContext();

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
      console.log('📷 Iniciando captura de foto...');

      if (!camera.current) {
        const error = new Error('Camera reference not available');
        console.error('📷 Error:', error.message);
        rejectPhoto(error);
        return;
      }

      const photo = await camera.current.takePhoto({ flash: 'off' });
      console.log('📷 Foto capturada, procesando base64...');

      const base64String = await RNFS.readFile(photo.path, 'base64');

      const photoData: TakePhotoDirectResponse = {
        base64: `data:image/jpeg;base64,${base64String}`,
        width: photo.width,
        height: photo.height,
        success: true,
        timestamp: Date.now(),
      };

      console.log('📸 Foto procesada exitosamente:', {
        width: photoData.width,
        height: photoData.height,
        base64Length: photoData.base64.length,
        timestamp: photoData.timestamp,
      });

      resolvePhoto(photoData);
    } catch (error) {
      console.error('📷 Error al tomar la foto:', error);

      Alert.alert('Error', 'No se pudo tomar la foto');

      rejectPhoto(error as Error);
    }
  };

  const goBack = () => {
    console.log('📷 Usuario canceló la captura');
    rejectPhoto(new Error('User cancelled photo capture'));
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
