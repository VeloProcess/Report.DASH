import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { enforceEmailFromToken } from '../middleware/emailValidationMiddleware.js';
import { 
  getOperatorConfirmation, 
  saveOperatorConfirmation,
  getOperatorConfirmationByFeedbackId,
  saveOperatorConfirmationByFeedbackId
} from '../services/operatorConfirmationsService.js';

const router = express.Router();

// Todas as rotas requerem autenticação e validação de email do token
router.use(authenticateToken);
router.use(enforceEmailFromToken);

/**
 * GET /api/operator/confirmation
 * Busca confirmação do operador
 * Query params: feedbackId (prioritário) ou month, year (deprecated)
 */
router.get('/', async (req, res) => {
  try {
    const email = req.user.email;
    const feedbackId = req.query.feedbackId ? parseInt(req.query.feedbackId) : null;
    
    let confirmation = null;
    
    if (feedbackId) {
      // Buscar por feedback_id (novo método)
      confirmation = await getOperatorConfirmationByFeedbackId(feedbackId);
    } else {
      // Buscar por month/year (método antigo, deprecated)
      const month = req.query.month || 'Dezembro';
      const year = parseInt(req.query.year) || new Date().getFullYear();
      confirmation = await getOperatorConfirmation(email, month, year);
    }

    res.json({
      success: true,
      confirmation: confirmation || {
        understood: false,
        observations: '',
        feedback_id: feedbackId || null,
        month: req.query.month || null,
        year: req.query.year ? parseInt(req.query.year) : null
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
 * Body: { feedbackId: number (obrigatório), month: string, year: number, understood: boolean, observations: string }
 */
router.post('/', async (req, res) => {
  try {
    const email = req.user.email;
    const { feedbackId, month, year, understood, observations } = req.body;

    console.log(`📥 POST /api/operator/confirmation - Body recebido:`, { feedbackId, month, year, understood, observations: observations?.substring(0, 50) });

    if (!feedbackId) {
      console.warn('⚠️ feedbackId não fornecido');
      return res.status(400).json({
        error: 'feedbackId é obrigatório'
      });
    }

    if (typeof understood !== 'boolean') {
      console.warn('⚠️ understood não é boolean:', typeof understood);
      return res.status(400).json({
        error: 'understood deve ser um boolean'
      });
    }

    if (!month || !year) {
      console.warn('⚠️ month ou year não fornecidos');
      return res.status(400).json({
        error: 'month e year são obrigatórios'
      });
    }

    const confirmationYear = parseInt(year) || new Date().getFullYear();
    const confirmationObservations = observations || '';

    console.log(`✅ Chamando saveOperatorConfirmationByFeedbackId com feedbackId=${feedbackId}`);

    // Usar novo método que vincula confirmação ao feedback_id
    const confirmation = await saveOperatorConfirmationByFeedbackId(
      parseInt(feedbackId),
      email,
      month,
      confirmationYear,
      understood,
      confirmationObservations
    );

    console.log(`✅ Confirmação salva com sucesso para feedbackId=${feedbackId}`);

    res.json({
      success: true,
      confirmation: confirmation
    });
  } catch (error) {
    console.error('❌ Erro ao salvar confirmação na rota:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      error: 'Erro ao salvar confirmação',
      details: error.message
    });
  }
});

export default router;

