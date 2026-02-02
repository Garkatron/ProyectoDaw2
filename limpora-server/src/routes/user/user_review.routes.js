import { Router } from 'express';
import { mw_role, mw_session } from '../../middlewares/auth.js';
import { addReview, getAllReviews, getAverageRating, getReviewsByProvider, getReviewsByUser, getReviewsByUsername } from '../../controllers/user/user_review.controller.js';
import { ROLES } from '../../constants.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './../../utils/sanitization';

const userReviewRouter = Router();

userReviewRouter.get('/', getAllReviews);

userReviewRouter.get(
    '/user/:userId',

    param("userId").trim().escape().isNumeric(),
    handleValidationErrors,

    getReviewsByUser
);

userReviewRouter.get(
    '/provider/:providerId',

    param("providerId").trim().escape().isNumeric(),
    handleValidationErrors,

    getReviewsByProvider
);

userReviewRouter.get(
    '/provider/:providerId/average-rating',

    param("providerId").trim().escape().isNumeric(),
    handleValidationErrors,

    getAverageRating
);

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

userReviewRouter.get(
    '/name/:username',
    
    
    param("username").trim().escape().isString(),
    handleValidationErrors,

    getReviewsByUsername
);

export default userReviewRouter;