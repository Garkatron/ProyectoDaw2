import { Router } from 'express';
import { deleteUserController, googleCallback, googleUrl, loginController, logoutController, meController, registerAdmin, registerController } from '../controllers/auth.controller.js';
import { mw_role, mw_session } from '../middlewares/auth.js';
import { ROLES } from '../constants.js';

const authRoutes = Router();

authRoutes.post('/register',registerController);
authRoutes.delete('/uid/:uid', mw_session, mw_role([ROLES.ADMIN]), deleteUserController);
authRoutes.get('/google-url', googleUrl);
authRoutes.get('/callback', googleCallback);
authRoutes.post('/login', loginController);
authRoutes.post('/logout', mw_session, logoutController);
authRoutes.post('/reg_admin', mw_session, mw_role([ROLES.ADMIN]), registerAdmin);
authRoutes.get('/me', mw_session, meController);

export default authRoutes;
