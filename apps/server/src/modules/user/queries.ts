import { db } from "../../libs/db";
import type { User, UserRole } from "@limpora/common/src/types/user";

export const UserQueries = {
  findById: db.query<User, { id: number }>(
    `SELECT * FROM Users WHERE id = :id`,
  ),

  findByName: db.query<User, { name: string }>(
    `SELECT * FROM Users WHERE name = :name`,
  ),

  findRoleById: db.query<UserRole, { id: number }>(
    `SELECT role FROM Users WHERE id = :id`,
  ),

  findByRole: db.query<User, { role: string }>(
    `SELECT * FROM Users WHERE role = :role`,
  ),

  getAll: db.query<User, null>(`SELECT * FROM Users`),

  getProviderProfile: db.query<
    { travel_buffer_min: number },
    { user_id: number }
  >(
    `SELECT COALESCE(travel_buffer_min, 30) AS travel_buffer_min
     FROM ProviderProfiles
     WHERE user_id = :user_id`,
  ),

  upsertProviderProfile: db.query<
    void,
    { user_id: number; travel_buffer_min: number }
  >(
    `INSERT INTO ProviderProfiles (user_id, travel_buffer_min)
     VALUES (:user_id, :travel_buffer_min)
     ON CONFLICT(user_id) DO UPDATE SET travel_buffer_min = :travel_buffer_min`,
  ),
};
