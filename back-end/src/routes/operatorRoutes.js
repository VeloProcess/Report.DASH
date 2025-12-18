import express from 'express';
import {
  createOperator,
  getAllOperators,
  getOperatorById,
  getAvailableNames,
} from '../controllers/operatorController.js';

const router = express.Router();

router.post('/', createOperator);
router.get('/available-names', getAvailableNames);
router.get('/', getAllOperators);
router.get('/:id', getOperatorById);

export default router;

