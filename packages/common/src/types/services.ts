export interface Service {
  id: number;
  name: string;
  category: string; 
}

export interface ProviderService {
  user_id: number;
  service_id: number;
  price_per_h: number;
  duration_minutes: number;
  is_active: boolean;
  created_at?: string; 
  updated_at: string;
  service_name: string;
}

/*
interface UserService {
  service_id: number;
  user_id: number;
  price_per_h: number;
  duration_minutes: number;
  is_active: boolean;
  updated_at: string;
  category?: string;
}

interface Service {
  id: number;
  name: string;
}

*/