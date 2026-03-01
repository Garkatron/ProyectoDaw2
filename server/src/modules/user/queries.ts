import { db } from '../../libs/db';
import type { User } from '@limpora/common/types/user'

export const UserQueries = {
    findById: db.query<User, { $id: number }>(`SELECT * FROM Users WHERE id = $id`),

    findByName: db.query<User, { $name: string }>(`SELECT * FROM Users WHERE name = $name`),

    findByRole: db.query<User, { $role: string }>(`SELECT * FROM Users WHERE role = $role`),

    getAll: db.query<User, null>(`SELECT * FROM Users`),
};
