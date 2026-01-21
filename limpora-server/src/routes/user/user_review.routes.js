import { Router } from 'express';
import { mw_role, mw_session } from '../../middlewares/auth.js';
import { addReview, getAllReviews, getAverageRating, getReviewsByProvider, getReviewsByUser, getReviewsByUsername } from '../../controllers/user/user_review.controller.js';
import { ROLES } from '../../constants.js';

const userReviewRouter = Router();

userReviewRouter.get('/', getAllReviews);

userReviewRouter.get('/user/:userId', getReviewsByUser);

userReviewRouter.get('/provider/:providerId', getReviewsByProvider);

userReviewRouter.get('/provider/:providerId/average-rating', getAverageRating);

userReviewRouter.post('/', mw_session, mw_role([ROLES.ADMIN, ROLES.CLIENT]), addReview);

userReviewRouter.get('/name/:username', getReviewsByUsername);

export default userReviewRouter;