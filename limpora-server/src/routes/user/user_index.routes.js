import { Router } from 'express';
import userServices from './user_services.routes.js';
import userEarningsRouter from './user_earnings.routes.js';
import userAppointmentsRouter from './user_appointments.routes.js';
import userReviewRouter from './user_review.routes.js';
import { getUserById, getUserByName, getUserByUid, getUsers } from '../../controllers/user.controller.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../utils/sanitization.js';

const userIndexRouter = Router();


userIndexRouter.use('/services', userServices);
userIndexRouter.use('/earnings', userEarningsRouter);
userIndexRouter.use('/appointments', userAppointmentsRouter);
userIndexRouter.use('/reviews', userReviewRouter);

/**
 * @openapi
 * /user/id/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns a user by numeric ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
userIndexRouter.get(
    "/id/:id",
    param("id").trim().escape().isNumeric(),
    handleValidationErrors,
    getUserById
);

/**
 * @openapi
 * /user/uid/{uid}:
 *   get:
 *     summary: Get user by UID
 *     description: Returns a user by unique UID string.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User UID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid UID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
userIndexRouter.get(
    "/uid/:uid",
    param("uid").trim().isString(),
    handleValidationErrors,
    getUserByUid
);

/**
 * @openapi
 * /user/name/{name}:
 *   get:
 *     summary: Get user by name
 *     description: Returns a user matching the given name.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: User name
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid name
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
userIndexRouter.get(
    "/name/:name", 
    param("name").trim().escape().isString(),
    handleValidationErrors,
    getUserByName
);

/**
 * @openapi
 * /user:
 *   get:
 *     summary: Get users
 *     description: Returns all users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *       404:
 *         description: Users not found
 *       500:
 *         description: Server error
 */
userIndexRouter.get("/", getUsers);

export default userIndexRouter;