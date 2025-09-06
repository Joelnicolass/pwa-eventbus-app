import { useEffect, useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

interface PermissionsState {
  isLoading: boolean;
  allPermissionsGranted: boolean;
  permissionsStatus: { [key: string]: boolean };
}

export const useNativePermissions = () => {
  const [permissionsState, setPermissionsState] = useState<PermissionsState>({
    isLoading: true,
    allPermissionsGranted: false,
    permissionsStatus: {},
  });

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      setPermissionsState(prev => ({ ...prev, isLoading: true }));

      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        console.log('Permisos otorgados:', granted);

        const criticalPermissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        const allGranted = criticalPermissions.every(
          permission =>
            granted[permission] === PermissionsAndroid.RESULTS.GRANTED,
        );

        const permissionsStatus: { [key: string]: boolean } = {};
        Object.entries(granted).forEach(([permission, status]) => {
          permissionsStatus[permission] =
            status === PermissionsAndroid.RESULTS.GRANTED;
        });

        setPermissionsState({
          isLoading: false,
          allPermissionsGranted: allGranted,
          permissionsStatus,
        });

        if (!allGranted) {
          Alert.alert(
            'Permisos necesarios',
            'La aplicación necesita permisos de cámara y ubicación para funcionar correctamente.',
          );
        }

        return allGranted;
      } catch (err) {
        console.warn('Error solicitando permisos:', err);
        setPermissionsState({
          isLoading: false,
          allPermissionsGranted: false,
          permissionsStatus: {},
        });
        return false;
      }
    } else {
      setPermissionsState({
        isLoading: false,
        allPermissionsGranted: true,
        permissionsStatus: {},
      });
      return true;
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const checkSpecificPermission = (permission: string): boolean => {
    return permissionsState.permissionsStatus[permission] || false;
  };

  const retryPermissions = () => {
    requestPermissions();
  };

  return {
    ...permissionsState,
    requestPermissions,
    checkSpecificPermission,
    retryPermissions,
  };
};
