import { Router } from 'express';
import { googleCallback, googleUrl, loginController, logoutController, meController, registerController } from '../controllers/auth_controller.js';
import { mw_role, mw_session } from '../middlewares/auth.js';

const authRoutes = Router();

authRoutes.post('/register', registerController);
authRoutes.get('/google-url', googleUrl);
authRoutes.get('/callback', googleCallback);
authRoutes.post('/login', loginController);
authRoutes.post('/logout', mw_session, logoutController);
authRoutes.post('/reg_admin', mw_session, mw_role(["admin"]), registerController);
authRoutes.get('/me', mw_session, meController);

export default authRoutes;
