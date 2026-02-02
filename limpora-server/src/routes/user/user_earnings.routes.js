import { Router } from 'express';
import { getUserEarnings } from '../../controllers/user/user_earnings.controller.js';
import { mw_role, mw_session } from '../../middlewares/auth.js';
import { ROLES } from '../../constants.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './../../utils/sanitization';

const userEarningsRouter = Router();

userEarningsRouter.use(mw_session, mw_role([ROLES.ADMIN, ROLES.PROVIDER]));

userEarningsRouter.get(
    "/", 
    param("userId").trim().escape().isNumeric(),
    handleValidationErrors,
    getUserEarnings)

export default userEarningsRouter;