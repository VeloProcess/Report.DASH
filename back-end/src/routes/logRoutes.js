import express from 'express';
import { getLogs } from '../controllers/logController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota requer autenticação
router.use(authenticateToken);

router.get('/', getLogs);

export default router;

