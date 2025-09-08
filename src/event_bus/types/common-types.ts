// === TIPOS GENÉRICOS Y COMUNES ===
export type GenericResponse = {
  [key: string]: any;
};

// === TIPOS DE INICIALIZACIÓN ===
export interface InitializationEvent {
  timestamp: number;
  version?: string;
}

export interface NativeReadyEvent {
  platform: string;
  version: string | number;
  timestamp: number;
}

export interface InitializationResponse {
  status: string;
  timestamp: number;
}

// === TIPOS DE VIBRACIÓN ===
export interface VibrationRequest {
  pattern?: number[];
  duration?: number;
}

// === TIPOS DE COMPARTIR ===
export interface ShareContentRequest {
  message?: string;
  title?: string;
  url?: string;
}

// === TIPOS DE NOTIFICACIONES ===
export interface NotificationRequest {
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduledTime?: Date;
  sound?: string;
}
