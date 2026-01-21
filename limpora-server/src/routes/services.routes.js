import { Router } from 'express';
import { createService, deleteService, getAllServices, getServiceById } from '../controllers/services.controller.js';
import { mw_role, mw_session } from '../middlewares/auth.js';

const servicesRouter = Router();

servicesRouter.get("/", getAllServices);
servicesRouter.get("/:serviceId", getServiceById);

servicesRouter.post("/", mw_session, mw_role(["admin"]), createService);
servicesRouter.delete("/:serviceId", mw_session, mw_role(["admin"]), deleteService);


export default servicesRouter;