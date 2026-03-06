import { Notification } from "@limpora/common/*";
import { db } from "../../libs/db";

export const NotificationQueries = {
    insert: db.query<
        void,
        { user_id: number; content: string; expires_at: string }
    >(
        `INSERT INTO Notifications (user_id, content, expires_at)
        VALUES (:user_id, :content, :expires_at)`,
    ),

    findByUserId: db.query<Notification, { user_id: number }>(
        `SELECT id, content, read, created_at, expires_at
     FROM Notifications
     WHERE user_id = :user_id
       AND expires_at > datetime('now')
     ORDER BY created_at DESC`,
    ),

    markAsRead: db.query<void, { id: number }>(
        `UPDATE Notifications SET read = 1 WHERE id = :id`,
    ),

    markAllAsRead: db.query<void, { user_id: number }>(
        `UPDATE Notifications SET read = 1 WHERE user_id = :user_id`,
    ),
};
