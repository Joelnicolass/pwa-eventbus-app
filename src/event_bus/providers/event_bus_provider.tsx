import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  ReactNode,
  useState,
} from 'react';
import EventBus from '../hooks/use_event_bus';

interface EventBusContextValue {
  eventBus: EventBus | null;
  setWebViewRef: (ref: any) => void;
}

const EventBusContext = createContext<EventBusContextValue | undefined>(
  undefined,
);

interface EventBusProviderProps {
  children: ReactNode;
}

/**
 * Provider que proporciona una instancia global del EventBus a toda la aplicación.
 *
 * Permite acceder al EventBus desde cualquier componente hijo sin prop drilling,
 * manteniendo una única instancia global que puede ser configurada con la referencia
 * del WebView cuando esté disponible.
 *
 * @param children - Los componentes hijos que tendrán acceso al EventBus
 */
export const EventBusProvider: React.FC<EventBusProviderProps> = ({
  children,
}) => {
  const eventBusRef = useRef<EventBus | null>(null);
  const [eventBus, setEventBus] = useState<EventBus | null>(null);

  useEffect(() => {
    // Crear la instancia del EventBus una sola vez
    eventBusRef.current = new EventBus();
    setEventBus(eventBusRef.current);

    return () => {
      // Limpiar al desmontar
      eventBusRef.current?.destroy();
      eventBusRef.current = null;
      setEventBus(null);
    };
  }, []);

  const setWebViewRef = (ref: any) => {
    console.log('🔧 Configurando WebView ref en EventBus global');
    if (eventBusRef.current) {
      eventBusRef.current.setWebViewRef(ref);
    }
  };

  const value: EventBusContextValue = {
    eventBus,
    setWebViewRef,
  };

  return (
    <EventBusContext.Provider value={value}>
      {children}
    </EventBusContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al EventBus desde cualquier componente.
 *
 * @returns El contexto del EventBus con la instancia y métodos de configuración
 * @throws Error si se usa fuera del EventBusProvider
 */
export const useEventBusContext = (): EventBusContextValue => {
  const context = useContext(EventBusContext);

  if (context === undefined) {
    throw new Error(
      'useEventBusContext debe ser usado dentro de un EventBusProvider',
    );
  }

  return context;
};

/**
 * Hook simplificado para obtener solo la instancia del EventBus.
 *
 * @returns La instancia del EventBus o null si no está disponible
 */
export const useGlobalEventBus = (): EventBus | null => {
  const { eventBus } = useEventBusContext();
  return eventBus;
};
