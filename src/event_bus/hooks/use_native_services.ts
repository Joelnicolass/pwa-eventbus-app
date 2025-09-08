import { useGlobalEventBus } from '../providers/event_bus_provider';
import { useNativeStorage } from './use_native_storage';
import { useNativeLocation } from './use_native_location';
import { useNativeHttpRequest } from './use_native_http_request';
import { useNativeCamera } from './use_native_camera';
import { useCustomEvents } from './use_custom_events';

/**
 * Hook principal que inicializa todos los hooks nativos usando la instancia global del EventBus.
 *
 * Este hook centraliza la configuración de todos los servicios nativos disponibles,
 * incluyendo storage, localización, HTTP requests, cámara y eventos personalizados.
 *
 * Utiliza la instancia global del EventBus proporcionada por el EventBusProvider,
 * garantizando que todos los hooks compartan la misma instancia y puedan comunicarse
 * entre sí de manera consistente.
 *
 * @returns Un objeto vacío (los hooks internos manejan la lógica de suscripción)
 */
export const useNativeServices = () => {
  const eventBus = useGlobalEventBus();

  // Inicializar todos los servicios nativos
  useNativeStorage(eventBus);
  useNativeLocation(eventBus);
  useNativeHttpRequest(eventBus);
  useNativeCamera(eventBus);
  useCustomEvents(eventBus);

  return {};
};
