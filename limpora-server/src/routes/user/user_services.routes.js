import { Router } from 'express';
import {
  getUserServices,
  getUserServiceById,
  addUserService,
  updateUserService,
  deleteUserService
} from "../../controllers/user/user_services.controller.js";
import { mw_role, mw_session } from '../../middlewares/auth.js';
import { ROLES } from '../../constants.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './../../utils/sanitization';

const userServices = Router();


userServices.get(
  '/:userId', 
  param("userId").trim().escape().isNumeric(),
  handleValidationErrors,
  getUserServices
);


userServices.get(
  '/:userId/:serviceId', 
  param("userId").trim().escape().isNumeric(),
  param("serviceId").trim().escape().isNumeric(),
  handleValidationErrors,
  getUserServiceById
);



userServices.post(
  '/:userId',

  param("userId").trim().escape().isNumeric(),
  handleValidationErrors,

  mw_session,
  mw_role([ROLES.ADMIN, ROLES.PROVIDER]),
  addUserService
);

userServices.patch(
  '/:userId/:serviceId',
  mw_session,
  mw_role([ROLES.ADMIN, ROLES.PROVIDER]),


  param("userId").trim().escape().isNumeric(),
  param("serviceId").trim().escape().isNumeric(),
  handleValidationErrors,

  updateUserService
);

/**
 * DELETE /users/{userId}/services/{serviceId}
 * Removes a service from the user's profile.
 * Requires an active session and "client" role.
 */
userServices.delete(
  '/:userId/:serviceId',
  mw_session,
  mw_role([ROLES.ADMIN, ROLES.PROVIDER]),
  
  param("userId").trim().escape().isNumeric(),
  param("serviceId").trim().escape().isNumeric(),
  handleValidationErrors,
  
  deleteUserService
);

export default userServices;