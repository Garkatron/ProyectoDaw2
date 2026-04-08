import { PostStatus } from "@limpora/common";
import { db } from "../../libs/db";
import type { Post } from "@limpora/common/src/types/post";

export const PostQueries = {
    findById: db.query<Post, { id: number }>(
        `SELECT * FROM Posts WHERE id = :id`,
    ),

    findByUserId: db.query<Post, { user_id: number }>(
        `SELECT * FROM Posts WHERE user_id = :user_id`,
    ),

    findByStatus: db.query<Post, { status: string }>(
        `SELECT * FROM Posts WHERE status = :status`,
    ),

    getAll: db.query<Post, null>(`SELECT * FROM Posts`),

    create: db.query<
        void,
        { user_id: number; title: string; content: string; status: PostStatus }
    >(
        `INSERT INTO Posts (user_id, title, content)
     VALUES (:user_id, :title, :content, :status)`,
    ),

    update: db.query<
        void,
        { id: number; title?: string; content?: string; status?: PostStatus }
    >(
        `UPDATE Posts
     SET
       title   = COALESCE(:title, title),
       content = COALESCE(:content, content),
       status  = COALESCE(:status, status),
       updated_at = datetime('now')
     WHERE id = :id`,
    ),

    delete: db.query<void, { id: number }>(`DELETE FROM Posts WHERE id = :id`),

    findAll: db.query<Post, null>(`SELECT id, title, content FROM Posts`),
};
