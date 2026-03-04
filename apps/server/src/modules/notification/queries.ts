import { db } from "../../libs/db";

export const NotificationQueries = {
    insert: db.query<
        void,
        { user_id: number; content: string,expires_at: string }
    >(
        `
        INSERT INTO Notifications (user_id, content, expires_at)
        VALUES (:user_id, :content, :expires_at, 0)
        `,
    ),
};
