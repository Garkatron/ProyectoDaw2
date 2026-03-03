import { db } from '../../libs/db';
import type { Service } from '@limpora/common/src/types/user'

export const ServicesQueries = {
    insert: db.query<
        void,
        {
            name: string;
            category: string;
        }
    >(`INSERT INTO Services (name, category) VALUES (:name, :category)`),

    findById: db.query<
        Service,
        {
            id: number;
        }
    >(`SELECT * FROM Services WHERE id = :id`),

    findByName: db.query<Service, { name: string }>(
        `SELECT * FROM Services WHERE name = :name`
    ),

    getAll: db.query<Service, null>(`SELECT * FROM Services`),

    delete: db.query<void, { id: number }>(`DELETE FROM Services WHERE id = :id`),
};