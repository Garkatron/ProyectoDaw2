import { Router } from 'express';
import { addUserAppointment, getUserAppointments } from '../../controllers/user/user_appointments_controller.js';
import { mw_session } from '../../middlewares/auth.js';

const userAppointmentsRouter = Router();

userAppointmentsRouter.use(mw_session);

userAppointmentsRouter.get('/:userId', getUserAppointments);
userAppointmentsRouter.post('/', addUserAppointment);

export default userAppointmentsRouter;