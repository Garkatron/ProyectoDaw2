export interface User {
    id:                     number;
    firebase_uid:           string;
    name:                   string;
    email:                  string;
    email_verified:         number; 
    role:                   UserRole;
    
    // Ubicación (Útil para ambos roles)
    address?:               string;
    postal_code?:           string;
    city?:                  string;
    latitude?:              number;
    longitude?:             number;

    total_points:           number;
    completed_appointments: number;
    cancelled_appointments: number;
    member_since:           string;
    created_at:             string;
}

// Provider's data
export interface ProviderProfile {
    user_id:           number;
    bio:               string | null;
    has_vehicle:       number; // 0 | 1
    transport_type:    'Car' | 'Public Transport' | 'Bike' | 'Walk';
    service_radius_km: number;
    provides_supplies:  number; // 0 | 1
    avg_rating:        number;
}