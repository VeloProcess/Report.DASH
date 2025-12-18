import express from 'express';
import {
  createIndicators,
  generateFeedbackWithAI,
  getFeedbackByOperator,
  getAllFeedbacks,
  sendFeedbackByEmail,
} from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/indicators', createIndicators);
router.post('/generate', generateFeedbackWithAI);
router.post('/send-email', sendFeedbackByEmail);
router.get('/operator/:operatorId', getFeedbackByOperator);
router.get('/', getAllFeedbacks);

export default router;

