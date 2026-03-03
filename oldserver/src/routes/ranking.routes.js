import { Router } from 'express';
import { getTopUsers, getUserRanking } from '../controllers/ranking.controller.js';
import { param, query } from 'express-validator';
import { handleValidationErrors } from '../utils/sanitization.js';

const rankingRouter = Router();

rankingRouter.get(
  "/top",
  query("limit").optional().isNumeric().toInt(),
  handleValidationErrors,
  getTopUsers
);

rankingRouter.get(
  "/user/:userId",
  param("userId").trim().escape().isNumeric(),
  handleValidationErrors,
  getUserRanking
);

export default rankingRouter;