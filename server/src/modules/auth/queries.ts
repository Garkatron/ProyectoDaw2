import { db } from "../../libs/db"
import { User } from "../../types/user"

export const AuthQueries = {
    findByFirebaseUid: db.query<User, { $firebase_uid: string }>(`
        SELECT * FROM Users
        WHERE firebase_uid = $firebase_uid
        LIMIT 1
    `),

    findByEmail: db.query<User, { $email: string }>(`
        SELECT * FROM Users
        WHERE email = $email
        LIMIT 1
    `),

    insert: db.query<void, {
        $firebase_uid:  string
        $name:          string
        $email:         string
        $role:          string
    }>(`
        INSERT INTO Users (firebase_uid, name, email, role)
        VALUES ($firebase_uid, $name, $email, $role)
    `),

    updateEmailVerified: db.query<void, { $firebase_uid: string }>(`
        UPDATE Users
        SET email_verified = 1
        WHERE firebase_uid = $firebase_uid
    `),
}