import { db } from '../../libs/db';
import type { UserService } from '@limpora/common/src/types/user'

export const ProviderQueries = {

    getAll: db.query<UserService, null>(
        `SELECT * FROM UserServices`
    ),

    findByProviderId: db.query<UserService, { user_id: number }>(
        `SELECT * FROM UserServices WHERE user_id = :user_id`
    ),

    findByProviderAndService: db.query<UserService, { user_id: number; service_id: number }>(
        `SELECT * FROM UserServices 
         WHERE user_id = :user_id AND service_id = :service_id
         LIMIT 1`
    ),

    insert: db.query<void, {
        user_id:    number
        service_id: number
        price:      number
    }>(
        `INSERT INTO UserServices (user_id, service_id, price)
         VALUES (:user_id, :service_id, :price)`
    ),

    updatePrice: db.query<void, { user_id: number; service_id: number; price: number }>(
        `UPDATE UserServices SET price = :price
         WHERE user_id = :user_id AND service_id = :service_id`
    ),

    delete: db.query<void, { user_id: number; service_id: number }>(
        `DELETE FROM UserServices
         WHERE user_id = :user_id AND service_id = :service_id`
    ),
}