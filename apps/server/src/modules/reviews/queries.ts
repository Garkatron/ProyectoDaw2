import { db } from '../../libs/db';
import type { Review } from '@limpora/common/src/types/user'

export const ReviewsQueries = {

    findById: db.query<Review, { id: number }>(
        `SELECT * FROM Reviews WHERE id = :id`
    ),

    findByReviewerId: db.query<Review, { reviewer_id: number }>(
        `SELECT * FROM Reviews WHERE reviewer_id = :reviewer_id`
    ),

    findByReviewedId: db.query<Review, { reviewed_id: number }>(
        `SELECT * FROM Reviews WHERE reviewed_id = :reviewed_id`
    ),

    findExisting: db.query<Review, { reviewer_id: number; reviewed_id: number }>(
        `SELECT * FROM Reviews 
         WHERE reviewer_id = :reviewer_id 
         AND reviewed_id = :reviewed_id
         LIMIT 1`
    ),

    getAll: db.query<Review, null>(
        `SELECT * FROM Reviews`
    ),

    insert: db.query<void, {
        content:     string
        rating:      number
        reviewer_id: number
        reviewed_id: number
    }>(
        `INSERT INTO Reviews (content, rating, reviewer_id, reviewed_id)
         VALUES (:content, :rating, :reviewer_id, :reviewed_id)`
    ),

    delete: db.query<void, { id: number }>(
        `DELETE FROM Reviews WHERE id = :id`
    ),

}