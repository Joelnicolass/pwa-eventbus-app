import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { TakePhotoDirectResponse } from '../types/camera-types';

interface NativeCameraContextProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  pendingPhotoPromise: {
    resolve: (value: TakePhotoDirectResponse) => void;
    reject: (error: Error) => void;
  } | null;
  setPendingPhotoPromise: (
    promise: {
      resolve: (value: TakePhotoDirectResponse) => void;
      reject: (error: Error) => void;
    } | null,
  ) => void;
  resolvePhoto: (photoData: TakePhotoDirectResponse) => void;
  rejectPhoto: (error: Error) => void;
}

export const NativeCameraContext = createContext<NativeCameraContextProps>(
  {} as NativeCameraContextProps,
);

interface NativeCameraProviderProps {
  children: React.ReactNode;
}

export const NativeCameraProvider = ({
  children,
}: NativeCameraProviderProps) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [pendingPhotoPromise, setPendingPhotoPromise] = useState<{
    resolve: (value: TakePhotoDirectResponse) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const resolvePhoto = useCallback(
    (photoData: TakePhotoDirectResponse) => {
      if (pendingPhotoPromise) {
        pendingPhotoPromise.resolve(photoData);
        setPendingPhotoPromise(null);
        setIsActive(false);
      }
    },
    [pendingPhotoPromise],
  );

  const rejectPhoto = useCallback(
    (error: Error) => {
      if (pendingPhotoPromise) {
        pendingPhotoPromise.reject(error);
        setPendingPhotoPromise(null);
        setIsActive(false);
      }
    },
    [pendingPhotoPromise],
  );

  const values = useMemo(
    () => ({
      isActive,
      setIsActive,
      pendingPhotoPromise,
      setPendingPhotoPromise,
      resolvePhoto,
      rejectPhoto,
    }),
    [isActive, pendingPhotoPromise, resolvePhoto, rejectPhoto],
  );

  return (
    <NativeCameraContext.Provider value={values}>
      {children}
    </NativeCameraContext.Provider>
  );
};

export const useNativeCameraContext = () => {
  const context = useContext(NativeCameraContext);

  if (!context)
    throw new Error(
      'useNativeCameraProvider must be used within a NativeCameraProvider',
    );

  return context;
};

export default NativeCameraProvider;
