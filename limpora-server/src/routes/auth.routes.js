import { Router } from 'express';
import { deleteUserController, emailVerificationController, googleCallback, googleUrl, loginController, logoutController, meController, registerAdmin, registerController, sendVerificationEmailController } from '../controllers/auth.controller.js';
import { mw_role, mw_session } from '../middlewares/auth.js';
import { ROLES } from '../constants.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../utils/sanitization.js';

const authRoutes = Router();

// Verify Email Code
authRoutes.post(
    '/vec',
    body("code").trim().escape().isString(),
    handleValidationErrors,
    emailVerificationController
);

// Send Email Verifycation Code
authRoutes.post(
    '/sevcode',
    body("email").trim().escape().isString(),
    body("id").trim().escape().isNumeric(),
    handleValidationErrors,
    sendVerificationEmailController
);


authRoutes.post(
    '/register',

    body("name").trim().notEmpty().isString(),
    body("email").trim().normalizeEmail().isEmail(),
    body("password").notEmpty().isString().isLength({ min: 6 }),
    body("role").optional().trim().isString().isIn(['client', 'admin', 'photographer']),
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
