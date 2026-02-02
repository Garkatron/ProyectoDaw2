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

/**
 * User Services (Freelancer / Provider)
 * Base path: /api/v1/users/{userId}/services
 */

/**
 * GET /users/{userId}/services
 * Retrieves the list of services offered by a user.
 */
userServices.get(
  '/:userId', 
  param("userId").trim().escape().isNumeric(),
  handleValidationErrors,
  getUserServices
);

/**
 * GET /users/{userId}/services/{serviceId}
 * Retrieves detailed information about a specific service offered by the user.
 */
userServices.get(
  '/:userId/:serviceId', 
  param("userId").trim().escape().isNumeric(),
  param("serviceId").trim().escape().isNumeric(),
  handleValidationErrors,
  getUserServiceById
);

/**
 * POST /users/{userId}/services
 * Adds a service from the global catalog to the user's profile.
 * Requires an active session and "client" role.
 */
userServices.post(
  '/:userId',

  param("userId").trim().escape().isNumeric(),
  handleValidationErrors,

  mw_session,
  mw_role([ROLES.ADMIN, ROLES.PROVIDER]),
  addUserService
);

/**
 * PATCH /users/{userId}/services/{serviceId}
 * Updates user-specific service data
 * (price, availability, extras, etc.).
 * Requires an active session and "client" role.
 */
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