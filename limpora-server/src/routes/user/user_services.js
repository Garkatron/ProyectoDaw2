import { Router } from 'express';
import {
  getUserServices,
  getUserServiceById,
  addUserService,
  updateUserService,
  deleteUserService
} from "../../controllers/user/user_services_controller.js";

const router = Router();

router.get('/:userId', getUserServices);
router.get('/:userId/:serviceId', getUserServiceById);
router.post('/:userId', addUserService);
router.patch('/:userId/:serviceId', updateUserService);
router.delete('/:userId/:serviceId', deleteUserService);

export default router;
