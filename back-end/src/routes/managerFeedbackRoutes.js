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
 * GET /api/manager/history/complete
 * Retorna histórico completo de todos os feedbacks de gestores com confirmações dos operadores
 * IMPORTANTE: Esta rota deve vir ANTES das rotas com parâmetros dinâmicos
 */
router.get('/history/complete', async (req, res) => {
  console.log('✅ Rota /api/manager/history/complete chamada (managerFeedbackRoutes)');
  try {
    const { getOperatorEmailById } = await import('../utils/operatorUtils.js');
    const { getOperatorConfirmation } = await import('../services/operatorConfirmationsService.js');
    const { getOperators } = await import('../database.js');
    
    // Função para carregar email mapping
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const loadEmailMapping = () => {
      const possiblePaths = [
        path.join(__dirname, '../controllers/send_email.JSON'),
        path.join(process.cwd(), 'src/controllers/send_email.JSON'),
        path.join(process.cwd(), 'back-end/src/controllers/send_email.JSON'),
        path.join(__dirname, '../../src/controllers/send_email.JSON'),
      ];

      for (const emailMappingPath of possiblePaths) {
        try {
          if (fs.existsSync(emailMappingPath)) {
            const emailMappingContent = fs.readFileSync(emailMappingPath, 'utf-8');
            return JSON.parse(emailMappingContent);
          }
        } catch (error) {
          console.error(`Erro ao carregar email mapping:`, error.message);
        }
      }
      return {};
    };
    
    // Buscar todos os feedbacks de gestores
    const allFeedbacks = await getManagerFeedbacks();
    console.log(`📊 Total de feedbacks encontrados: ${allFeedbacks.length}`);
    
    // Buscar informações dos operadores e gestores
    const operators = getOperators();
    const emailMapping = loadEmailMapping();
    
    const completeHistory = await Promise.all(
      allFeedbacks.map(async (feedback) => {
        // Buscar informações do operador
        const operator = operators.find(op => op.id === feedback.operator_id);
        const operatorEmail = getOperatorEmailById(feedback.operator_id);
        
        // Buscar informações do gestor (pelo email)
        let managerName = feedback.manager_email;
        for (const [name, email] of Object.entries(emailMapping)) {
          if (email.toLowerCase().trim() === feedback.manager_email.toLowerCase().trim()) {
            managerName = name;
            break;
          }
        }
        
        // Buscar confirmação do operador
        let confirmation = null;
        if (operatorEmail) {
          confirmation = await getOperatorConfirmation(
            operatorEmail,
            feedback.month,
            feedback.year
          );
        }
        
        return {
          id: feedback.id,
          feedback_text: feedback.feedback_text,
          month: feedback.month,
          year: feedback.year,
          created_at: feedback.created_at,
          updated_at: feedback.updated_at,
          // Informações do gestor
          manager_email: feedback.manager_email,
          manager_name: managerName,
          // Informações do operador
          operator_id: feedback.operator_id,
          operator_name: operator ? operator.name : `Operador #${feedback.operator_id}`,
          operator_email: operatorEmail || null,
          // Confirmação do operador
          confirmed: confirmation ? confirmation.understood : false,
          confirmation_date: confirmation ? confirmation.confirmed_at : null,
          observations: confirmation ? confirmation.observations : null
        };
      })
    );
    
    // Ordenar por data de criação (mais recente primeiro)
    completeHistory.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    });
    
    res.json({
      success: true,
      history: completeHistory,
      count: completeHistory.length
    });
  } catch (error) {
    console.error('Erro ao buscar histórico completo:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico completo',
      details: error.message
    });
  }
});

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

