import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { enforceEmailFromToken } from '../middleware/emailValidationMiddleware.js';
import { getActionHistory, logAction } from '../services/metricsSupabaseService.js';

const router = express.Router();

// Todas as rotas requerem autenticação e validação de email do token
router.use(authenticateToken);
router.use(enforceEmailFromToken);

/**
 * GET /api/history
 * Busca histórico de ações do operador autenticado
 * Query params: startDate, endDate, actionType
 */
router.get('/', async (req, res) => {
  try {
    const email = req.user.email;
    const { startDate, endDate, actionType } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const history = await getActionHistory(email, start, end, actionType || null);
    
    // Filtrar ações técnicas que não devem ser exibidas ao usuário
    const relevantActions = history.filter(action => 
      action.action !== 'view_history' // Não mostrar ações de visualização do histórico
    );
    
    // Registrar ação de visualização do histórico (silenciosamente, sem retornar)
    await logAction(email, 'view_history', { 
      startDate: startDate || null,
      endDate: endDate || null,
      actionType: actionType || null
    }).catch(() => {
      // Ignorar erros de RLS ao registrar ação técnica
    });

    res.json({
      success: true,
      history: relevantActions,
      count: relevantActions.length
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      details: error.message
    });
  }
});

export default router;

