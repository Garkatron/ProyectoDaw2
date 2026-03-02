import { db } from "../../libs/db";
import type {
    Appointment,
    AppointmentStatus,
    PaymentMethod,
} from "@limpora/common";

export const BookingQueries = {
    findByUserId: db.query<Appointment, { id: number }>(
        `SELECT *
         FROM Appointments
         WHERE user_id = :id
         ORDER BY date_time DESC`,
    ),

    findById: db.query<Appointment, { id: number }>(
        `SELECT *
         FROM Appointments
         WHERE id = :id
         ORDER BY date_time DESC`,
    ),

    findByProviderId: db.query<Appointment, { provider_id: number }>(
        `SELECT *
         FROM Appointments
         WHERE provider_id = :provider_id
         ORDER BY date_time DESC`,
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

    getEarnings: db.query<
        {
            closed_appointments: number;
            cancelled_appointments: number;
            total_money: number;
            retained_money: number;
        },
        { provider_id: number }
    >(
        `SELECT
           COUNT(CASE WHEN status = 'Completed' THEN 1 END)                              AS closed_appointments,
           COUNT(CASE WHEN status = 'Cancelled' THEN 1 END)                              AS cancelled_appointments,
           COALESCE(SUM(CASE WHEN status = 'Completed' THEN total_amount END), 0)        AS total_money,
           COALESCE(SUM(CASE WHEN status IN ('Pending', 'In Process') THEN total_amount END), 0) AS retained_money
         FROM Appointments
         WHERE provider_id = :provider_id`,
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
           a.total_amount,
           a.status,
           u.name AS requester_name
         FROM Appointments a
         JOIN Users u ON a.user_id = u.id
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
