import { Router } from 'express';
import { addUserAppointment, getUserAppointments } from '../../controllers/user/user_appointments.controller.js';
import { mw_session } from '../../middlewares/auth.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../utils/sanitization.js';


const userAppointmentsRouter = Router();

userAppointmentsRouter.use(mw_session);

/**
 * @openapi
 * /user/appointments/{userId}:
 *   get:
 *     summary: Get user appointments
 *     description: Returns all appointments for a specific user.
 *     tags:
 *       - User Appointments
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       201:
 *         description: Appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *       500:
 *         description: Error getting appointments
 */
userAppointmentsRouter.get(
    '/:userId', 
    param("userId").trim().escape(),
    getUserAppointments
);


/**
 * @openapi
 * /user/appointments:
 *   post:
 *     summary: Create user appointment
 *     description: Creates a new appointment for a user.
 *     tags:
 *       - User Appointments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - clientId
 *               - serviceId
 *               - providerId
 *               - price
 *               - paymentMethod
 *               - totalAmount
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               clientId:
 *                 type: integer
 *               serviceId:
 *                 type: integer
 *               providerId:
 *                 type: integer
 *               price:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Error creating appointment
 */
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