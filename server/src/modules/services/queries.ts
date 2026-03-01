import { db } from '../../libs/db';
import { Service } from '../../types/user';

export const ServicesQueries = {
    insert: db.query<
        void,
        {
            $name: string;
            $duration: number;
        }
    >(`INSERT INTO Services (name, duration) VALUES ($name, $duration)`),

    findById: db.query<
        void,
        {
            $id: number;
        }
    >(`SELECT * FROM Services WHERE id = $id`),

    findByName: db.query<Service, { $name: string }>(`SELECT * FROM Services WHERE name = $name`),

    getAll: db.query<Service, null>(`SELECT * FROM Services`),
};
