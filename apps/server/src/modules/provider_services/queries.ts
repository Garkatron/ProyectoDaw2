import { ProviderService } from "@limpora/common";
import { db } from "../../libs/db";

export const ProviderQueries = {
    getAll: db.query<ProviderService, null>(
        `
        SELECT 
            us.*,
            s.name AS service_name,
            s.category
        FROM UserServices us
        JOIN Services s ON us.service_id = s.id
        `,
    ),

    findByProviderId: db.query<ProviderService, { user_id: number }>(
        `
        SELECT 
            us.*,
            s.name AS service_name,
            s.category
        FROM UserServices us
        JOIN Services s ON us.service_id = s.id
        WHERE us.user_id = :user_id
        `,
    ),

    findByProviderAndService: db.query<
        ProviderService,
        { user_id: number; service_id: number }
    >(
        `
        SELECT 
            us.*,
            s.name AS service_name,
            s.category
        FROM UserServices us
        JOIN Services s ON us.service_id = s.id
        WHERE us.user_id = :user_id AND us.service_id = :service_id
        LIMIT 1
        `,
    ),

    insert: db.query<
        void,
        {
            user_id: number;
            service_id: number;
            price_per_h: number;
            duration_hours: number;
        }
    >(
        `INSERT INTO UserServices (user_id, service_id, price_per_h, duration_hours)
     VALUES (:user_id, :service_id, :price_per_h, :duration_hours)`,
    ),
    updatePrice: db.query<
        void,
        { user_id: number; service_id: number; price_per_h: number }
    >(
        `
        UPDATE UserServices 
        SET price_per_h = :price_per_h, 
            updated_at = datetime('now')
        WHERE user_id = :user_id AND service_id = :service_id
        `,
    ),

    toggleActive: db.query<
        void,
        { user_id: number; service_id: number; is_active: number }
    >(
        `
        UPDATE UserServices SET is_active = :is_active
        WHERE user_id = :user_id AND service_id = :service_id
        `,
    ),

    delete: db.query<void, { user_id: number; service_id: number }>(
        `
        DELETE FROM UserServices
        WHERE user_id = :user_id AND service_id = :service_id
        `,
    ),
};
