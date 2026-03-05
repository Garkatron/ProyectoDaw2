import { db } from "../../libs/db";
import type { User } from "@limpora/common/src/types/user";

export const AuthQueries = {
    findByFirebaseUid: db.query<User, { firebase_uid: string }>(`
        SELECT * FROM Users
        WHERE firebase_uid = :firebase_uid
        LIMIT 1
    `),

    findByEmail: db.query<User, { email: string }>(`
        SELECT * FROM Users
        WHERE email = :email
        LIMIT 1
    `),
    
    insert: db.query<
        void,
        {
            firebase_uid: string;
            name: string;
            email: string;
            role: string;
        }
    >(`
        INSERT INTO Users (firebase_uid, name, email, role)
        VALUES (:firebase_uid, :name, :email, :role)
    `),

    updateEmailVerified: db.query<void, { email: string }>(`
        UPDATE Users
        SET email_verified = 1
        WHERE email = :email
    `),
    
    insertVerificationCode: db.query<
        void,
        { email: string; hashed_code: string }
    >(`
        INSERT INTO EmailVerificationCodes (user_id, code, expires_at)
        VALUES (
            (SELECT id FROM Users WHERE email = :email),
            :hashed_code,
            datetime('now', '+15 minutes')
        )
    `),

    findVerificationCodeByEmail: db.query<
        { id: number; code: string; expires_at: string },
        { email: string }
    >(`
        SELECT * FROM EmailVerificationCodes
        WHERE user_id = (SELECT id FROM Users WHERE email = :email)
          AND used = 0
          AND expires_at > datetime('now')
        ORDER BY created_at DESC
        LIMIT 1
    `),


    markCodeAsUsed: db.query<void, { id: number }>(`
        UPDATE EmailVerificationCodes
        SET used = 1
        WHERE id = :id
    `),
};
