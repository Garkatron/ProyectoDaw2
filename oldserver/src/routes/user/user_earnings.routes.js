import { Router } from 'express';
import { getUserEarnings } from '../../controllers/user/user_earnings.controller.js';
import { mw_role, mw_session } from '../../middlewares/auth.js';
import { ROLES } from '../../constants.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../utils/sanitization.js';

const userEarningsRouter = Router();

userEarningsRouter.use(mw_session, mw_role([ROLES.ADMIN, ROLES.PROVIDER]));

/**
 * @openapi
 * /user/earnings:
 *   get:
 *     summary: Get user earnings
 *     description: Returns earnings data for a specific user.
 *     tags:
 *       - User Earnings
 *     parameters:
 *       - in: param
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User identifier
 *     responses:
 *       201:
 *         description: Earnings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Error getting earnings
 */
userEarningsRouter.get(
    "/", 
    param("userId").trim().escape().isNumeric(),
    handleValidationErrors,
    getUserEarnings);

export default userEarningsRouter;