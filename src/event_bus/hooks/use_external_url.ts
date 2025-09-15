import { useEffect, useState } from 'react';

interface ExternalUrlState {
  url: string | null;
  isServerReady: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseExternalUrlConfig {
  /** URL del dominio externo donde está alojada la PWA */
  externalUrl: string;
  /** Tiempo de timeout para verificar que la URL está disponible (opcional) */
  timeoutMs?: number;
  /** Si debe verificar conectividad antes de marcar como ready (opcional) */
  checkConnectivity?: boolean;
}

/**
 * Hook para manejar URLs externas en lugar del servidor embebido.
 *
 * @param config Configuración para la URL externa
 * @returns Estado de la URL externa
 *
 * @example
 * ```typescript
 * const { url, isServerReady } = useExternalUrl({
 *   externalUrl: 'https://mipwa.midominio.com',
 *   checkConnectivity: true
 * });
 * ```
 */
export const useExternalUrl = (config: UseExternalUrlConfig) => {
  const { externalUrl, timeoutMs = 5000, checkConnectivity = false } = config;

  const [state, setState] = useState<ExternalUrlState>({
    url: null,
    isServerReady: false,
    isLoading: checkConnectivity,
    error: null,
  });

  useEffect(() => {
    const initializeExternalUrl = async () => {
      try {
        // Validar que la URL esté bien formada usando regex simple
        const urlPattern = /^https?:\/\/.+/i;

        if (!urlPattern.test(externalUrl)) {
          throw new Error('La URL debe usar protocolo HTTP o HTTPS');
        }

        if (checkConnectivity) {
          setState(prev => ({ ...prev, isLoading: true, error: null }));

          // Verificar conectividad con timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

          try {
            await fetch(externalUrl, {
              method: 'HEAD',
              signal: controller.signal,
              mode: 'no-cors', // Para evitar problemas de CORS en la verificación
            });
            clearTimeout(timeoutId);
          } catch (fetchError) {
            clearTimeout(timeoutId);
            // Si falla el fetch, aún así intentamos cargar (podría ser CORS)
            console.warn(
              'No se pudo verificar conectividad, pero continuando:',
              fetchError,
            );
          }
        }

        setState({
          url: externalUrl,
          isServerReady: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error configurando URL externa:', error);
        setState({
          url: null,
          isServerReady: false,
          isLoading: false,
          error: `URL externa inválida: ${(error as Error).message}`,
        });
      }
    };

    if (externalUrl) {
      initializeExternalUrl();
    } else {
      setState({
        url: null,
        isServerReady: false,
        isLoading: false,
        error: 'URL externa no proporcionada',
      });
    }
  }, [externalUrl, checkConnectivity, timeoutMs]);

  return state;
};
