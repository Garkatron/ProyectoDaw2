import { db } from "../../libs/db";

export const EarningsQueries = {
    findProviderStats: db.query<
        {
            closed_appointments: number;
            cancelled_appointments: number;
            total_money: number;
            retained_money: number;
        },
        { provider_id: number }
    >(`
        SELECT
            COUNT(CASE WHEN status = 'Completed' THEN 1 END)                                         AS closed_appointments,
            COUNT(CASE WHEN status = 'Cancelled' THEN 1 END)                                         AS cancelled_appointments,
            COALESCE(SUM(CASE WHEN status = 'Completed' THEN price + app_commission END), 0)         AS total_money,
            COALESCE(SUM(CASE WHEN status IN ('Pending', 'In Process') THEN price + app_commission END), 0) AS retained_money
        FROM Appointments
        WHERE provider_id = :provider_id
    `),
};
