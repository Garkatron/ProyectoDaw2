import { Router } from 'express';
import { deleteUserController, googleCallback, googleUrl, loginController, logoutController, meController, registerAdmin, registerController } from '../controllers/auth.controller.js';
import { mw_role, mw_session } from '../middlewares/auth.js';
import { ROLES } from '../constants.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './../../utils/sanitization';

const authRoutes = Router();

authRoutes.post(
    '/register',

    body("name").trim().escape().isString(),
    body("email").trim().escape().isString(),
    body("password").trim().escape().isString(),
    body("role").trim().escape().isString(),
    handleValidationErrors,

    registerController
);

authRoutes.delete(
    '/uid/:uid',
    mw_session, 
    mw_role([ROLES.ADMIN]), 
    
    
    param("uid").trim().isString(),
    handleValidationErrors,
    
    deleteUserController);

authRoutes.post(
    '/login', 

    body("email").trim().escape().isString(),
    body("password").trim().escape().isString(),
    handleValidationErrors,

    loginController
);

authRoutes.post('/logout', mw_session, logoutController);

authRoutes.get('/google-url', googleUrl);

authRoutes.get('/callback', googleCallback);



authRoutes.post(
    '/reg_admin', 
    mw_session, 
    mw_role([ROLES.ADMIN]), 
    
    body("name").trim().escape().isString(),
    body("email").trim().escape().isString(),
    body("password").trim().escape().isString(),
    handleValidationErrors,
    
    registerAdmin);

authRoutes.get('/me', mw_session, meController);


export default authRoutes;
