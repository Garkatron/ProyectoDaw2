export interface Service {
  id: number;
  name: string;
  category: string;
}

// Representa la relación UserServices + Services
export interface ProviderService {
  user_id: number;
  service_id: number;
  price_per_h: number; // El precio que define el autónomo
  duration_minutes: number; // Duración del servicio en minutos (mínimo 15)
  is_active: number;
  created_at: string;
  updated_at: string;
  // Campos extra (Join con Services)
  service_name: string;
  category: string;
}
