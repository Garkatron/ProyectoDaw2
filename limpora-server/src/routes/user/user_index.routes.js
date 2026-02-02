import { Router } from 'express';
import userServices from './user_services.routes.js';
import userEarningsRouter from './user_earnings.routes.js';
import userAppointmentsRouter from './user_appointments.routes.js';
import userReviewRouter from './user_review.routes.js';
import { getUserById, getUserByName, getUserByUid, getUsers } from '../../controllers/user.controller.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './../../utils/sanitization';

const userIndexRouter = Router();


userIndexRouter.use('/services', userServices);
userIndexRouter.use('/earnings', userEarningsRouter);
userIndexRouter.use('/appointments', userAppointmentsRouter);
userIndexRouter.use('/reviews', userReviewRouter);

userIndexRouter.get(
    "/id/:id",
    param("id").trim().escape().isNumeric(),
    handleValidationErrors,
    getUserById
);

userIndexRouter.get(
    "/uid/:uid",
    param("uid").trim().isString(),
    handleValidationErrors,
    getUserByUid
);

userIndexRouter.get(
    "/name/:name", 
    param("name").trim().escape().isString(),
    handleValidationErrors,
    getUserByName
);

userIndexRouter.get("/", getUsers);

export default userIndexRouter;