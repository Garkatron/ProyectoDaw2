import { Router } from 'express';
import userServices from './user_services.routes.js';
import userEarningsRouter from './user_earnings.routes.js';
import userAppointmentsRouter from './user_appointments.routes.js';
import userReviewRouter from './user_review.routes.js';
import { getUserById, getUserByName, getUserByUid, getUsers } from '../../controllers/user.controller.js';

const userIndexRouter = Router();


userIndexRouter.use('/services', userServices);
userIndexRouter.use('/earnings', userEarningsRouter);
userIndexRouter.use('/appointments', userAppointmentsRouter);
userIndexRouter.use('/reviews', userReviewRouter);
userIndexRouter.get("/id/:id", getUserById);
userIndexRouter.get("/uid/:uid", getUserByUid);
userIndexRouter.get("/name/:name", getUserByName);
userIndexRouter.get("/", getUsers);

export default userIndexRouter;