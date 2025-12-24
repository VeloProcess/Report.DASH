import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { enforceEmailFromToken } from '../middleware/emailValidationMiddleware.js';
import { getManagerFeedbacksByOperator, getManagerFeedbacksByManager, getOperators } from '../database.js';
import { getOperatorNameByEmail } from '../utils/operatorUtils.js';
import { getOperatorConfirmation } from '../services/operatorConfirmationsService.js';
import { isManager } from '../utils/managerUtils.js';

const router = express.Router();

// Todas as rotas requerem autenticação e validação de email do token
router.use(authenticateToken);
router.use(enforceEmailFromToken);

/**
 * GET /api/operator/feedbacks
 * Busca feedbacks de gestores:
 * - Se o usuário é gestor: retorna feedbacks criados por ele
 * - Se o usuário é operador: retorna feedbacks recebidos por ele
 * Query params: month (opcional), year (opcional)
 */
router.get('/', async (req, res) => {
  try {
    const email = req.user.email;
    const { month, year } = req.query;
    const userIsManager = req.user.isManager || isManager(email);
    
    let allFeedbacks = [];
    let operatorInfo = null;
    
    if (userIsManager) {
      // Gestor: buscar feedbacks criados por ele
      allFeedbacks = await getManagerFeedbacksByManager(email);
      
      // Buscar informações do operador para cada feedback (para exibir nome do operador)
      const operators = getOperators();
      allFeedbacks = allFeedbacks.map(feedback => {
        const operator = operators.find(op => op.id === feedback.operator_id);
        return {
          ...feedback,
          operator_name: operator ? operator.name : `Operador #${feedback.operator_id}`
        };
      });
      
      operatorInfo = {
        isManager: true,
        email: email
      };
    } else {
      // Operador: buscar feedbacks recebidos por ele
      const operatorName = getOperatorNameByEmail(email);
      
      if (!operatorName) {
        return res.json({
          success: true,
          feedbacks: [],
          message: 'Operador não encontrado'
        });
      }
      
      // Buscar operador pelo nome
      const operators = getOperators();
      const operator = operators.find(op => 
        op.name.toLowerCase().trim() === operatorName.toLowerCase().trim()
      );
      
      if (!operator) {
        return res.json({
          success: true,
          feedbacks: [],
          message: 'Operador não encontrado'
        });
      }
      
      // Buscar todos os feedbacks do operador
      allFeedbacks = await getManagerFeedbacksByOperator(operator.id);
      
      operatorInfo = {
        id: operator.id,
        name: operator.name,
        email: email
      };
    }
    
    // Filtrar por mês e ano se fornecidos
    let filteredFeedbacks = allFeedbacks;
    if (month) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.month === month);
    }
    if (year) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.year === parseInt(year));
    }
    
    // Buscar confirmações para cada feedback (apenas para operadores)
    const feedbacksWithConfirmation = await Promise.all(
      filteredFeedbacks.map(async (feedback) => {
        // Se for gestor, não precisa buscar confirmação (ele não confirma seus próprios feedbacks)
        if (userIsManager) {
          return feedback;
        }
        
        // Se for operador, buscar confirmação
        const confirmation = await getOperatorConfirmation(
          email,
          feedback.month,
          feedback.year
        );
        
        return {
          ...feedback,
          confirmed: confirmation ? confirmation.understood : false,
          confirmationDate: confirmation ? confirmation.confirmed_at : null,
          observations: confirmation ? confirmation.observations : null
        };
      })
    );
    
    res.json({
      success: true,
      feedbacks: feedbacksWithConfirmation,
      operator: operatorInfo
    });
  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error);
    res.status(500).json({
      error: 'Erro ao buscar feedbacks',
      details: error.message
    });
  }
});

export default router;

