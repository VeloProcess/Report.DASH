import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { enforceEmailFromToken } from '../middleware/emailValidationMiddleware.js';
import { getOperatorConfirmation, saveOperatorConfirmation } from '../services/operatorConfirmationsService.js';

const router = express.Router();

// Todas as rotas requerem autenticação e validação de email do token
router.use(authenticateToken);
router.use(enforceEmailFromToken);

/**
 * GET /api/operator/confirmation
 * Busca confirmação do operador para um mês específico
 * Query params: month, year
 */
router.get('/', async (req, res) => {
  try {
    const email = req.user.email;
    const month = req.query.month || 'Dezembro';
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const confirmation = await getOperatorConfirmation(email, month, year);

    res.json({
      success: true,
      confirmation: confirmation || {
        understood: false,
        observations: '',
        month: month,
        year: year
      }
    });
  } catch (error) {
    console.error('Erro ao buscar confirmação:', error);
    res.status(500).json({
      error: 'Erro ao buscar confirmação',
      details: error.message
    });
  }
});

/**
 * POST /api/operator/confirmation
 * Salva ou atualiza confirmação do operador
 * Body: { month: string, year: number, understood: boolean, observations: string }
 */
router.post('/', async (req, res) => {
  try {
    const email = req.user.email;
    const { month, year, understood, observations } = req.body;

    if (!month) {
      return res.status(400).json({
        error: 'month é obrigatório'
      });
    }

    if (typeof understood !== 'boolean') {
      return res.status(400).json({
        error: 'understood deve ser um boolean'
      });
    }

    const confirmationYear = year || new Date().getFullYear();
    const confirmationObservations = observations || '';

    const confirmation = await saveOperatorConfirmation(
      email,
      month,
      confirmationYear,
      understood,
      confirmationObservations
    );

    res.json({
      success: true,
      confirmation: confirmation
    });
  } catch (error) {
    console.error('Erro ao salvar confirmação:', error);
    res.status(500).json({
      error: 'Erro ao salvar confirmação',
      details: error.message
    });
  }
});

export default router;

