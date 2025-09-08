import { createContext, useContext, useMemo, useState } from 'react';

interface NativeCameraContextProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
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

  const values = useMemo(
    () => ({
      isActive,
      setIsActive,
    }),
    [isActive],
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
