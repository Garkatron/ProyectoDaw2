import { Router } from 'express';
import { createService, deleteService, getAllServices, getServiceById } from '../controllers/services.controller.js';
import { mw_role, mw_session } from '../middlewares/auth.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from './../../utils/sanitization';

const servicesRouter = Router();

/**
 * @openapi
 * /services:
 *   get:
 *     summary: Get all services
 *     description: Returns all available services.
 *     tags:
 *       - Services
 *     responses:
 *       201:
 *         description: Services retrieved successfully
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
 *         description: Error getting services
 */
servicesRouter.get("/", getAllServices);


/**
 * @openapi
 * /services/{serviceId}:
 *   get:
 *     summary: Get service by ID
 *     description: Returns a service by numeric ID.
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       201:
 *         description: Service retrieved successfully
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
 *         description: Error getting service by ID
 */
servicesRouter.get(
    "/:serviceId", 

    param("serviceId").trim().escape().isNumeric(),
    handleValidationErrors,

    getServiceById
);

/**
 * @openapi
 * /services:
 *   post:
 *     summary: Create service
 *     description: Creates a new service.
 *     tags:
 *       - Services
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created successfully
 *       500:
 *         description: Error creating service
 */
servicesRouter.post(
    "/", 
    mw_session, 
    mw_role(["admin"]), 
    
    body("name").trim().escape().isString(),
    handleValidationErrors,

    createService
);


/**
 * @openapi
 * /services/{serviceId}:
 *   get:
 *     summary: Get service by ID
 *     description: Returns a service by numeric ID.
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service ID
 *     responses:
 *       201:
 *         description: Service retrieved successfully
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
 *         description: Error getting service by ID
 */
servicesRouter.delete(
    "/:serviceId", 
    mw_session, 
    mw_role(["admin"]), 

    param("serviceId").trim().escape().isNumeric(),
    handleValidationErrors,
    
    deleteService
);


export default servicesRouter;