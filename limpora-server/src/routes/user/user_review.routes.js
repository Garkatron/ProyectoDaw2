import { Router } from 'express';
import { mw_role, mw_session } from '../../middlewares/auth.js';
import {
  addReview,
  getAllReviews,
  getAverageRating,
  getReviewsByReviewed,
  getReviewsByReviewer,
  getReviewsByUsername
} from '../../controllers/user/user_review.controller.js';
import { ROLES } from '../../constants.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../utils/sanitization.js';

const userReviewRouter = Router();

/**
 * GET all reviews
 */
userReviewRouter.get('/', getAllReviews);

/**
 * GET reviews written by a user (reviewer)
 */
userReviewRouter.get(
  '/reviewer/:reviewerId',
  param('reviewerId').isInt(),
  handleValidationErrors,
  getReviewsByReviewer
);

/**
 * GET average rating of a reviewed user
 */
userReviewRouter.get(
  '/reviewed/:reviewedId/average-rating',
  param('reviewedId').isInt(),
  handleValidationErrors,
  getAverageRating
);
/**
 * GET reviews received by a user (reviewed)
 */
userReviewRouter.get(
  '/reviewed/:reviewedId',
  param('reviewedId').isInt(),
  handleValidationErrors,
  getReviewsByReviewed
);


/**
 * POST add review
 */
userReviewRouter.post(
  '/',
  mw_session,
  mw_role([ROLES.ADMIN, ROLES.CLIENT]),

  body('content')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 }),

  body('rating')
    .isInt({ min: 1, max: 5 }),

  body('reviewedId')
    .isInt(),

  handleValidationErrors,
  addReview
);

/**
 * GET reviews by username
 */
userReviewRouter.get(
  '/username/:username',
  param('username').isString().trim(),
  handleValidationErrors,
  getReviewsByUsername
);

export default userReviewRouter;