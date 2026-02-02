import { Router } from 'express';
import { createService, deleteService, getAllServices, getServiceById } from '../controllers/services.controller.js';
import { mw_role, mw_session } from '../middlewares/auth.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './../../utils/sanitization';

const servicesRouter = Router();

servicesRouter.get("/", getAllServices);

servicesRouter.get(
    "/:serviceId", 

    param("serviceId").trim().escape().isNumeric(),
    handleValidationErrors,

    getServiceById
);

servicesRouter.post(
    "/", 
    mw_session, 
    mw_role(["admin"]), 
    
    body("name").trim().escape().isString(),
    handleValidationErrors,

    createService
);


servicesRouter.delete(
    "/:serviceId", 
    mw_session, 
    mw_role(["admin"]), 

    param("serviceId").trim().escape().isNumeric(),
    handleValidationErrors,
    
    deleteService
);


export default servicesRouter;