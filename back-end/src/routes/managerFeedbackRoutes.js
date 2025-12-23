import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { isManager } from '../utils/managerUtils.js';
import {
  getManagerFeedbacks,
  getManagerFeedbackByOperatorAndMonth,
  saveManagerFeedback,
  deleteManagerFeedback,
  getManagerFeedbacksByOperator,
  getOperatorById,
} from '../database.js';

const router = express.Router();

// Middleware para verificar se é gestor
const requireManager = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      error: 'Acesso negado: Autenticação necessária',
      code: 'NOT_AUTHENTICATED'
    });
  }
  
  const email = req.user.email;
  if (!req.user.isManager && !isManager(email)) {
    return res.status(403).json({
      error: 'Acesso negado: Apenas gestores podem acessar esta funcionalidade',
      code: 'NOT_MANAGER'
    });
  }
  
  next();
};

// Todas as rotas requerem autenticação e ser gestor
router.use(authenticateToken);
router.use(requireManager);

/**
 * GET /api/manager/feedback/:operatorId
 * Busca feedbacks de um operador específico
 * Query params: month (opcional), year (opcional, padrão: ano atual)
 */
router.get('/feedback/:operatorId', async (req, res) => {
  try {
    const operatorId = parseInt(req.params.operatorId);
    const { month, year } = req.query;
    
    // Verificar se operador existe
    const operator = getOperatorById(operatorId);
    if (!operator) {
      return res.status(404).json({
        error: 'Operador não encontrado'
      });
    }
    
    // Se month e year foram fornecidos, buscar feedback específico
    if (month && year) {
      const feedback = await getManagerFeedbackByOperatorAndMonth(operatorId, month, parseInt(year));
      return res.json({
        success: true,
        feedback: feedback || null,
        operator: {
          id: operator.id,
          name: operator.name,
        },
      });
    }
    
    // Caso contrário, retornar todos os feedbacks do operador
    const feedbacks = await getManagerFeedbacksByOperator(operatorId);
    
    res.json({
      success: true,
      feedbacks: feedbacks,
      operator: {
        id: operator.id,
        name: operator.name,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar feedbacks do operador:', error);
    res.status(500).json({
      error: 'Erro ao buscar feedbacks do operador',
      details: error.message
    });
  }
});

/**
 * POST /api/manager/feedback
 * Cria ou atualiza feedback de um operador para um mês específico
 * Body: { operatorId, month, year, feedbackText }
 */
router.post('/feedback', async (req, res) => {
  try {
    const { operatorId, month, year, feedbackText } = req.body;
    
    // Validações
    if (!operatorId || !month || !year || !feedbackText) {
      return res.status(400).json({
        error: 'Campos obrigatórios: operatorId, month, year, feedbackText'
      });
    }
    
    if (typeof feedbackText !== 'string' || feedbackText.trim().length === 0) {
      return res.status(400).json({
        error: 'Feedback não pode estar vazio'
      });
    }
    
    // Verificar se operador existe
    const operator = getOperatorById(parseInt(operatorId));
    if (!operator) {
      return res.status(404).json({
        error: 'Operador não encontrado'
      });
    }
    
    // Validar mês
    const validMonths = ['Outubro', 'Novembro', 'Dezembro'];
    if (!validMonths.includes(month)) {
      return res.status(400).json({
        error: 'Mês inválido. Use: Outubro, Novembro ou Dezembro'
      });
    }
    
    // Salvar feedback
    const feedback = await saveManagerFeedback({
      operator_id: parseInt(operatorId),
      month: month,
      year: parseInt(year),
      feedback_text: feedbackText.trim(),
      manager_email: req.user.email,
      manager_name: req.user.operatorName || req.user.name,
    });
    
    res.status(201).json({
      success: true,
      message: 'Feedback salvo com sucesso',
      feedback: feedback,
    });
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    res.status(500).json({
      error: 'Erro ao salvar feedback',
      details: error.message
    });
  }
});

/**
 * PUT /api/manager/feedback/:id
 * Atualiza feedback existente
 * Body: { feedbackText }
 */
router.put('/feedback/:id', async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { feedbackText } = req.body;
    
    if (!feedbackText || typeof feedbackText !== 'string' || feedbackText.trim().length === 0) {
      return res.status(400).json({
        error: 'Feedback não pode estar vazio'
      });
    }
    
    // Buscar feedback existente
    const allFeedbacks = await getManagerFeedbacks();
    const existingFeedback = allFeedbacks.find(f => f.id === feedbackId);
    
    if (!existingFeedback) {
      return res.status(404).json({
        error: 'Feedback não encontrado'
      });
    }
    
    // Verificar se o gestor é o autor do feedback
    if (existingFeedback.manager_email !== req.user.email) {
      return res.status(403).json({
        error: 'Você não tem permissão para editar este feedback'
      });
    }
    
    // Atualizar feedback usando saveManagerFeedback (que faz UPSERT)
    const updatedFeedback = await saveManagerFeedback({
      operator_id: existingFeedback.operator_id,
      month: existingFeedback.month,
      year: existingFeedback.year,
      feedback_text: feedbackText.trim(),
      manager_email: existingFeedback.manager_email,
      manager_name: existingFeedback.manager_name,
    });
    
    res.json({
      success: true,
      message: 'Feedback atualizado com sucesso',
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error('Erro ao atualizar feedback:', error);
    res.status(500).json({
      error: 'Erro ao atualizar feedback',
      details: error.message
    });
  }
});

/**
 * DELETE /api/manager/feedback/:id
 * Remove feedback
 */
router.delete('/feedback/:id', async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    
    const allFeedbacks = await getManagerFeedbacks();
    const feedback = allFeedbacks.find(f => f.id === feedbackId);
    
    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback não encontrado'
      });
    }
    
    // Verificar se o gestor é o autor do feedback
    if (feedback.manager_email !== req.user.email) {
      return res.status(403).json({
        error: 'Você não tem permissão para excluir este feedback'
      });
    }
    
    const deleted = await deleteManagerFeedback(feedbackId);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Feedback excluído com sucesso',
      });
    } else {
      res.status(500).json({
        error: 'Erro ao excluir feedback'
      });
    }
  } catch (error) {
    console.error('Erro ao excluir feedback:', error);
    res.status(500).json({
      error: 'Erro ao excluir feedback',
      details: error.message
    });
  }
});

export default router;

