import { db } from "../../libs/db";
import type { Review } from "@limpora/common";

export const ReviewsQueries = {
    findById: db.query<Review & { reviewer_name: string }, { id: number }>(
        `SELECT r.*, u.name AS reviewer_name 
         FROM Reviews r
         JOIN Users u ON r.reviewer_id = u.id
         WHERE r.id = :id`,
    ),

    findByReviewerId: db.query<Review, { reviewer_id: number }>(
        `SELECT * FROM Reviews WHERE reviewer_id = :reviewer_id`,
    ),

    findByReviewedId: db.query<
        Review & { reviewer_name: string },
        { reviewed_id: number }
    >(
        `SELECT r.*, u.name AS reviewer_name 
         FROM Reviews r
         JOIN Users u ON r.reviewer_id = u.id
         WHERE r.reviewed_id = :reviewed_id
         ORDER BY r.created_at DESC`,
    ),

    findExistingByAppointment: db.query<
        { id: number },
        { reviewer_id: number; appointment_id: number }
    >(
        `SELECT id FROM Reviews 
         WHERE reviewer_id = :reviewer_id 
         AND appointment_id = :appointment_id
         LIMIT 1`,
    ),

    getAll: db.query<
        Review & { reviewer_name: string; reviewed_name: string },
        null
    >(
        `SELECT r.*, ur.name AS reviewer_name, ud.name AS reviewed_name
         FROM Reviews r
         JOIN Users ur ON r.reviewer_id = ur.id
         JOIN Users ud ON r.reviewed_id = ud.id
         ORDER BY r.created_at DESC`,
    ),

    insert: db.query<
        void,
        {
            content: string | null;
            rating: number;
            reviewer_id: number;
            reviewed_id: number;
            appointment_id: number;
        }
    >(
        `INSERT INTO Reviews (content, rating, reviewer_id, reviewed_id, appointment_id)
         VALUES (:content, :rating, :reviewer_id, :reviewed_id, :appointment_id)`,
    ),

    getAverageRating: db.query<
        { avg_rating: number; total_reviews: number },
        { reviewed_id: number }
    >(
        `SELECT AVG(rating) as avg_rating, COUNT(id) as total_reviews 
         FROM Reviews 
         WHERE reviewed_id = :reviewed_id`,
    ),

    delete: db.query<void, { id: number }>(
        `DELETE FROM Reviews WHERE id = :id`,
    ),

    findByAppointmentId: db.query<Review, { appointment_id: number }>(
        `SELECT r.*, u.name as reviewer_name
     FROM Reviews r
     JOIN Users u ON r.reviewer_id = u.id
     WHERE r.appointment_id = :appointment_id`,
    ),
};
