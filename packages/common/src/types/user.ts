import { AppointmentStatus } from "../enums/AppointmentStatus.enum"
import { UserRole } from "../enums/Role.enum"
import { PaymentMethod } from '@limpora/common';

export interface User {
    id:                    number
    firebase_uid:          string
    name:                  string
    email:                 string
    email_verified:        number          // 0 | 1 en SQLite
    role:                  UserRole
    total_points:          number
    completed_appointments: number
    cancelled_appointments: number
    member_since:          string
    created_at:            string
}

export interface Badge {
    id:   number
    name: string
}

export interface Service {
    id:       number
    name:     string
    duration: string
}

export interface Appointment {
    id:             number
    date_time:      string
    status:         AppointmentStatus,
    price:          number
    app_commission: number
    payment_method: PaymentMethod,
    service_name:   string
    user_id:        number
    provider_id:    number
    service_id:     number
    created_at:     string
}

export interface Review {
    id:          number
    content:     string | null
    rating:      number
    reviewer_id: number
    reviewed_id: number
    created_at:  string
}

export interface UserService {
    user_id:    number
    service_id: number
    price:      number
    is_active:  number  // 0 | 1
    created_at: string
    updated_at: string
    service_name: string
}

export interface EmailVerificationCode {
    id:         number
    user_id:    number
    code:       string
    expires_at: string
    used:       number  // 0 | 1
    created_at: string
}