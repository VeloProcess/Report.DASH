import express from 'express';
import {
  createIndicators,
  generateFeedbackWithAI,
  getFeedbackByOperator,
  getAllFeedbacks,
  sendFeedbackByEmail,
} from '../controllers/feedbackController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeOperatorAccess, enforceOperatorFilter } from '../middleware/authorizationMiddleware.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);
router.use(enforceOperatorFilter);

router.post('/indicators', createIndicators);
router.post('/generate', generateFeedbackWithAI);
router.post('/send-email', sendFeedbackByEmail);
router.get('/operator/:operatorId', authorizeOperatorAccess, getFeedbackByOperator);
router.get('/', getAllFeedbacks);

export default router;

