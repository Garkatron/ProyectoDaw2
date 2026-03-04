import { AppointmentStatus } from '../enums/AppointmentStatus.enum';
import { PaymentMethod } from '../enums/PaymentMethod.enum';
export interface Appointment {
    id:                number;
    client_id:           number;
    provider_id:       number;
    service_id:        number;
    
    // Time
    start_time:         string; // start_time
    end_time:          string; 
    travel_buffer_min: number; 
    
    status:            AppointmentStatus;
    
    // Conomy
    total_price:       number; // Lo que paga el cliente
    provider_net:      number; // Lo que recibe el autónomo
    app_commission:    number; // Lo que se queda la app
    payment_method:    PaymentMethod;
    
    // UI Fields
    service_name:     string;
    provider_name?:    string;
    client_name?:      string;
    created_at:        string;
}