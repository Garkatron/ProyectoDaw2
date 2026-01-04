import { Router } from 'express';
import { loginController, logoutController, registerController } from '../controllers/auth_controller.js';
import { mw_role, mw_session } from '../middlewares/auth.js';

const authRoutes = Router();

authRoutes.post('/register', registerController);
authRoutes.post('/login', loginController);
authRoutes.post('/logout', mw_session, logoutController);
authRoutes.post('/reg_admin', mw_session, mw_role(["admin"]), registerController);

export default authRoutes;
