import { Router } from 'express';
import { addUserAppointment, getUserAppointments } from '../../controllers/user/user_appointments.controller.js';
import { mw_session } from '../../middlewares/auth.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './../../utils/sanitization';


const userAppointmentsRouter = Router();

userAppointmentsRouter.use(mw_session);

userAppointmentsRouter.get(
    '/:userId', 
    param("userId").trim().escape(),
    getUserAppointments
);

userAppointmentsRouter.post(
    '/', 
    body("date").trim(),
    body("clientId").trim().isNumeric(),
    body("serviceId").trim().isNumeric(),
    body("providerId").trim().isNumeric(),
    body("price").trim(),
    body("pricepaymentMethod").trim(),
    body("totalAmount").trim().isNumeric(),
    handleValidationErrors,
    addUserAppointment
);

export default userAppointmentsRouter;