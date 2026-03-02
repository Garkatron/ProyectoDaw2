import { db } from "../../libs/db";
import type { UserService } from "@limpora/common/src/types/user";

export const ProviderQueries = {
    getAll: db.query<UserService & { service_name: string }, null>(
        `
    SELECT 
        us.*,
        s.name AS service_name
    FROM UserServices us
    JOIN Services s ON us.service_id = s.id
    `,
    ),

    findByProviderId: db.query<
        UserService & { service_name: string },
        { user_id: number }
    >(
        `
    SELECT 
        us.*,
        s.name AS service_name
    FROM UserServices us
    JOIN Services s ON us.service_id = s.id
    WHERE us.user_id = :user_id
    `,
    ),

    findByProviderAndService: db.query<
        UserService & { service_name: string },
        { user_id: number; service_id: number }
    >(
        `
    SELECT 
        us.*,
        s.name AS service_name
    FROM UserServices us
    JOIN Services s ON us.service_id = s.id
    WHERE us.user_id = :user_id AND us.service_id = :service_id
    LIMIT 1
    `,
    ),

    insert: db.query<
        void,
        { user_id: number; service_id: number; price: number }
    >(
        `
    INSERT INTO UserServices (user_id, service_id, price)
    VALUES (:user_id, :service_id, :price)
    `,
    ),

    updatePrice: db.query<
        void,
        { user_id: number; service_id: number; price: number }
    >(
        `
    UPDATE UserServices SET price = :price
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
