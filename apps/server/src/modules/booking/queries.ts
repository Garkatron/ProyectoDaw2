import { db } from "../../libs/db";
import type {
    Appointment,
    AppointmentStatus,
    PaymentMethod,
} from "@limpora/common";

export const BookingQueries = {
    findByClientId: db.query<Appointment, { client_id: number }>(
        `SELECT a.*, s.name AS service_name
     FROM Appointments a
     JOIN Services s ON a.service_id = s.id
     WHERE client_id = :client_id
     ORDER BY a.date_time DESC`,
    ),

    findById: db.query<Appointment, { id: number }>(
        `SELECT a.*, s.name AS service_name
     FROM Appointments a
     JOIN Services s ON a.service_id = s.id
     WHERE a.id = :id`,
    ),

    findByProviderId: db.query<Appointment, { provider_id: number }>(
        `SELECT a.*, s.name AS service_name
     FROM Appointments a
     JOIN Services s ON a.service_id = s.id
     WHERE a.provider_id = :provider_id
     ORDER BY a.date_time DESC`,
    ),

    deleteById: db.query<void, { id: number }>(
        `DELETE FROM Appointments WHERE id = :id`,
    ),

    insert: db.query<
        void,
        {
            date_time: string;
            status: AppointmentStatus;
            price: number;
            app_commission: number;
            payment_method: PaymentMethod;
            client_id: number;
            provider_id: number;
            service_id: number;
        }
    >(
        `INSERT INTO Appointments
         (date_time, status, price, app_commission, payment_method, client_id, provider_id, service_id)
         VALUES (:date_time, :status, :price, :app_commission, :payment_method, :client_id, :provider_id, :service_id)`,
    ),


    updateStatus: db.query<void, { id: number; status: AppointmentStatus }>(
        `UPDATE Appointments SET status = :status WHERE id = :id`,
    ),
    getClosedByProvider: db.query<
        {
            id: number;
            date_time: number;
            total_amount: number;
            status: AppointmentStatus;
            requester_name: string;
        },
        { provider_id: number }
    >(
        `SELECT
           a.id,
           a.date_time,
           a.status,
           u.name AS requester_name
         FROM Appointments a
         JOIN Users u ON a.client_id = u.id
         WHERE a.provider_id = :provider_id
         ORDER BY a.date_time DESC`,
    ),

    findConflict: db.query<
        { id: number },
        { provider_id: number; date_time: string }
    >(
        `SELECT id
     FROM Appointments
     WHERE provider_id = :provider_id
       AND date_time = :date_time
       AND status NOT IN ('Cancelled')
     LIMIT 1`,
    ),
};
