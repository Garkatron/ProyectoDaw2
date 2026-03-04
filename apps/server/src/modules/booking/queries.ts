import { db } from "../../libs/db";
import type {
    Appointment,
    AppointmentStatus,
    PaymentMethod,
} from "@limpora/common";

export const BookingQueries = {
    findByClientId: db.query<
        Appointment & { provider_name: string; client_name: string },
        { client_id: number }
    >(
        `SELECT a.*, s.name AS service_name,
            up.name AS provider_name,
            uc.name AS client_name
     FROM Appointments a
     JOIN Services s  ON a.service_id  = s.id
     JOIN Users up    ON a.provider_id = up.id
     JOIN Users uc    ON a.client_id   = uc.id
     WHERE a.client_id = :client_id
     ORDER BY a.start_time DESC`,
    ),

    findByProviderId: db.query<
        Appointment & { provider_name: string; client_name: string },
        { provider_id: number }
    >(
        `SELECT a.*, s.name AS service_name,
            up.name AS provider_name,
            uc.name AS client_name
     FROM Appointments a
     JOIN Services s  ON a.service_id  = s.id
     JOIN Users up    ON a.provider_id = up.id
     JOIN Users uc    ON a.client_id   = uc.id
     WHERE a.provider_id = :provider_id
     ORDER BY a.start_time DESC`,
    ),
    findById: db.query<Appointment & { service_name: string }, { id: number }>(
        `SELECT a.*, s.name AS service_name
         FROM Appointments a
         JOIN Services s ON a.service_id = s.id
         WHERE a.id = :id`,
    ),
    insert: db.query<
        void,
        {
            start_time: string;
            end_time: string;
            travel_buffer_min: number;
            status: AppointmentStatus;
            total_price: number;
            provider_net: number;
            app_commission: number;
            payment_method: PaymentMethod;
            client_id: number;
            provider_id: number;
            service_id: number;
        }
    >(
        `INSERT INTO Appointments
         (start_time, end_time, travel_buffer_min, status, total_price, provider_net, app_commission, payment_method, client_id, provider_id, service_id)
         VALUES (:start_time, :end_time, :travel_buffer_min, :status, :total_price, :provider_net, :app_commission, :payment_method, :client_id, :provider_id, :service_id)`,
    ),

        findConflict: db.query<
            { id: number },
            { provider_id: number; new_start: string; new_end: string }
        >(
            `SELECT id
            FROM Appointments
            WHERE provider_id = :provider_id
            AND status NOT IN ('Cancelled')
            AND :new_start < end_time
            AND :new_end   > start_time
            LIMIT 1`,
        ),

    updateStatus: db.query<void, { id: number; status: AppointmentStatus }>(
        `UPDATE Appointments SET status = :status WHERE id = :id`,
    ),

    deleteById: db.query<void, { id: number }>(
        `DELETE FROM Appointments WHERE id = :id`,
    ),

    findOccupiedSlots: db.query<
        { start_time: string },
        { provider_id: number; day_start: string; day_end: string }
    >(
        `SELECT start_time
     FROM Appointments
     WHERE provider_id = :provider_id
       AND status NOT IN ('Cancelled')
       AND start_time >= :day_start
       AND start_time <= :day_end
     ORDER BY start_time ASC`,
    ),
};
