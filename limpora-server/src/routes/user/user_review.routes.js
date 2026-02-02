import { Router } from 'express';
import { mw_role, mw_session } from '../../middlewares/auth.js';
import { addReview, getAllReviews, getAverageRating, getReviewsByProvider, getReviewsByUser, getReviewsByUsername } from '../../controllers/user/user_review.controller.js';
import { ROLES } from '../../constants.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './../../utils/sanitization';

const userReviewRouter = Router();

/**
 * @openapi
 * /user/reviews:
 *   get:
 *     summary: Get all reviews
 *     description: Returns all reviews in the system.
 *     tags:
 *       - Reviews
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *       500:
 *         description: Error getting reviews
 */
userReviewRouter.get('/', getAllReviews);

/**
 * @openapi
 * /user/reviews/user/{userId}:
 *   get:
 *     summary: Get reviews by user
 *     description: Returns all reviews written by a specific user.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Error getting reviews
 */
userReviewRouter.get(
    '/user/:userId',

    param("userId").trim().escape().isNumeric(),
    handleValidationErrors,

    getReviewsByUser
);


/**
 * @openapi
 * /user/reviews/provider/{providerId}:
 *   get:
 *     summary: Get reviews by provider
 *     description: Returns all reviews for a specific provider.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Provider ID
 *     responses:
 *       201:
 *         description: Reviews retrieved successfully
 *       500:
 *         description: Error getting reviews by provider
 */
userReviewRouter.get(
    '/provider/:providerId',

    param("providerId").trim().escape().isNumeric(),
    handleValidationErrors,

    getReviewsByProvider
);

/**
 * @openapi
 * /user/reviews/provider/{providerId}/average-rating:
 *   get:
 *     summary: Get provider average rating
 *     description: Returns the average rating for a provider.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Provider ID
 *     responses:
 *       201:
 *         description: Average rating retrieved successfully
 *       500:
 *         description: Error getting average rating
 */
userReviewRouter.get(
    '/provider/:providerId/average-rating',

    param("providerId").trim().escape().isNumeric(),
    handleValidationErrors,

    getAverageRating
);

/**
 * @openapi
 * /user/reviews:
 *   post:
 *     summary: Add review
 *     description: Creates a new review from a user to a provider.
 *     tags:
 *       - Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - rating
 *               - userId
 *               - providerId
 *             properties:
 *               content:
 *                 type: string
 *               rating:
 *                 type: number
 *               userId:
 *                 type: integer
 *               providerId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Review created successfully
 *       500:
 *         description: Error adding review
 */
userReviewRouter.post(
    '/',
    mw_session,
    mw_role([ROLES.ADMIN, ROLES.CLIENT]),

    body("content").trim().escape().isString(),
    body("rating").trim().escape().isNumeric(),
    body("userId").trim().escape().isNumeric(),
    body("providerId").trim().escape().isNumeric(),
    handleValidationErrors,

    addReview
);

/**
 * @openapi
 * /user/reviews/name/{username}:
 *   get:
 *     summary: Get reviews by username
 *     description: Returns reviews written by a user identified by username.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error getting reviews
 */
userReviewRouter.get(
    '/name/:username',
    
    
    param("username").trim().escape().isString(),
    handleValidationErrors,

    getReviewsByUsername
);

export default userReviewRouter;