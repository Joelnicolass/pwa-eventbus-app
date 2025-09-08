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
import { useGlobalEventBus } from '../../providers/event_bus_provider';
import { EventTypes } from '../../types';

export const useVisionCamera = () => {
  const eventBus = useGlobalEventBus();

  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [qrCodeDetected, setQrCodeDetected] = useState<boolean>(false);

  const { setIsActive } = useNativeCameraContext();

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
      if (!eventBus) return;
      if (camera.current) {
        const photo = await camera.current.takePhoto({ flash: 'off' });

        const base64String = await RNFS.readFile(photo.path, 'base64');

        eventBus.emit(EventTypes.CAMERA_PHOTO_BASE64_PROCESS, {
          base64: `data:image/jpeg;base64,${base64String}`,
          width: photo.width,
          height: photo.height,
        });
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const goBack = () => setIsActive(false);

  return {
    camera,
    device,
    codeScanner,
    hasPermission,
    takePhoto,
    goBack,
  };
};
