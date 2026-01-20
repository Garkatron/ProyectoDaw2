import { Router } from 'express';
import { getUserEarnings } from '../../controllers/user/user_earnings_controller.js';
import { mw_role, mw_session } from '../../middlewares/auth.js';
import { ROLES } from '../../constants.js';

const userEarningsRouter = Router();

userEarningsRouter.use(mw_session, mw_role([ROLES.ADMIN, ROLES.PROVIDER]));

userEarningsRouter.get("/", getUserEarnings)

export default userEarningsRouter;