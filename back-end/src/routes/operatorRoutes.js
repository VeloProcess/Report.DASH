import express from 'express';
import {
  getMyOperator,
  getOperatorById,
} from '../controllers/operatorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rota para obter dados do próprio operador autenticado
router.get('/me', getMyOperator);

// Rota para obter operador por ID (apenas se for o próprio)
router.get('/:id', getOperatorById);

export default router;

