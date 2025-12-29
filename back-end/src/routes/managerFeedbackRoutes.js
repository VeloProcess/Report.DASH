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

// Middleware de debug para todas as requisições (ANTES de autenticação para ver todas as requisições)
router.use((req, res, next) => {
  console.log(`🔍 managerFeedbackRoutes recebeu: ${req.method} ${req.path}`);
  console.log(`🔍 Query params:`, req.query);
  console.log(`🔍 Params:`, req.params);
  next();
});

// Todas as rotas requerem autenticação e ser gestor
router.use(authenticateToken);
router.use(requireManager);

// Log de rotas registradas
console.log('📋 Rotas de managerFeedbackRoutes registradas:');
console.log('  - GET /api/manager/history/complete');
console.log('  - GET /api/manager/feedback/by-id/:id');
console.log('  - GET /api/manager/feedback/:operatorId');
console.log('  - POST /api/manager/feedback');
console.log('  - PUT /api/manager/feedback/:id');
console.log('  - DELETE /api/manager/feedback/:id');

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
        
        // Buscar confirmação do operador por feedback_id
        let confirmation = null;
        const { getOperatorConfirmationByFeedbackId } = await import('../services/operatorConfirmationsService.js');
        confirmation = await getOperatorConfirmationByFeedbackId(feedback.id);
        
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
 * GET /api/manager/feedback/by-id/:id
 * Busca um feedback específico por ID
 * Esta rota deve vir ANTES da rota /feedback/:operatorId para evitar conflitos
 */
router.get('/feedback/by-id/:id', async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    console.log(`📥 GET /api/manager/feedback/by-id/${feedbackId}`);
    
    if (!feedbackId || isNaN(feedbackId)) {
      return res.status(400).json({
        error: 'ID do feedback inválido'
      });
    }
    
    const allFeedbacks = await getManagerFeedbacks();
    const feedback = allFeedbacks.find(f => f.id === feedbackId);
    
    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback não encontrado'
      });
    }
    
    res.json({
      success: true,
      feedback: feedback
    });
  } catch (error) {
    console.error('Erro ao buscar feedback por ID:', error);
    res.status(500).json({
      error: 'Erro ao buscar feedback',
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
    console.log(`📥 GET /api/manager/feedback/${operatorId}`, { month, year });
    
    // Verificar se operador existe
    // IMPORTANTE: Usar getAllOperatorsComplete() para incluir operadores criados dinamicamente
    let operator = getOperatorById(operatorId);
    
    // Se não encontrou no DB, tentar buscar na lista completa (inclui operadores dinâmicos)
    if (!operator) {
      console.log(`🔄 Operador não encontrado no DB, buscando na lista completa...`);
      const { getAllOperatorsComplete } = await import('./managerRoutes.js');
      const allOperators = getAllOperatorsComplete();
      operator = allOperators.find(op => op.id === operatorId);
    }
    
    if (!operator) {
      console.log(`❌ Operador não encontrado: ${operatorId}`);
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
 * Cria um NOVO feedback (sempre cria novo ID) ou atualiza um feedback existente (se id for fornecido)
 * Body: { operatorId, month, year, feedbackText, id? (opcional para atualização) }
 */
router.post('/feedback', async (req, res) => {
  console.log(`🚀 ROTA POST /feedback EXECUTADA!`);
  console.log(`📥 Body recebido:`, req.body);
  console.log(`📥 Headers:`, req.headers);
  try {
    console.log(`📥 POST /api/manager/feedback`, req.body);
    const { operatorId, month, year, feedbackText, id } = req.body;
    
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
    // IMPORTANTE: Usar getAllOperatorsComplete() para incluir operadores criados dinamicamente
    console.log(`🔍 Verificando operador ID: ${operatorId}`);
    let operator = getOperatorById(parseInt(operatorId));
    
    // Se não encontrou no DB, tentar buscar na lista completa (inclui operadores dinâmicos)
    if (!operator) {
      console.log(`🔄 Operador não encontrado no DB, buscando na lista completa...`);
      const { getAllOperatorsComplete } = await import('./managerRoutes.js');
      const allOperators = getAllOperatorsComplete();
      operator = allOperators.find(op => op.id === parseInt(operatorId));
      console.log(`🔍 Total de operadores na lista completa: ${allOperators.length}`);
      console.log(`🔍 IDs disponíveis:`, allOperators.map(op => op.id).join(', '));
    }
    
    console.log(`🔍 Operador encontrado:`, operator ? `Sim - ${operator.name}` : 'Não');
    if (!operator) {
      console.log(`❌ Operador ID ${operatorId} não encontrado, retornando 404`);
      return res.status(404).json({
        error: 'Operador não encontrado',
        operatorId: operatorId
      });
    }
    console.log(`✅ Operador válido: ${operator.name} (ID: ${operator.id})`);
    
    // Validar mês
    const validMonths = ['Outubro', 'Novembro', 'Dezembro'];
    if (!validMonths.includes(month)) {
      return res.status(400).json({
        error: 'Mês inválido. Use: Outubro, Novembro ou Dezembro'
      });
    }
    
    // Se ID foi fornecido, é uma atualização explícita
    const isUpdate = !!id;
    
    // Salvar feedback
    // Se id for fornecido, atualiza o feedback existente
    // Se id não for fornecido, sempre cria um NOVO feedback (novo ID)
    const feedback = await saveManagerFeedback({
      id: id ? parseInt(id) : undefined, // Passar ID apenas se for atualização
      operator_id: parseInt(operatorId),
      month: month,
      year: parseInt(year),
      feedback_text: feedbackText.trim(),
      manager_email: req.user.email,
      manager_name: req.user.operatorName || req.user.name,
    });
    
    // IMPORTANTE: Sempre que um feedback é criado ou atualizado,
    // excluir a confirmação existente para forçar uma nova confirmação do operador
    // Isso garante que cada vez que o gestor cria/atualiza um feedback,
    // o operador precisa confirmar novamente
    if (feedback && feedback.id) {
      try {
        const { deleteOperatorConfirmationByFeedbackId } = await import('../services/operatorConfirmationsService.js');
        const confirmationDeleted = await deleteOperatorConfirmationByFeedbackId(feedback.id);
        if (confirmationDeleted) {
          console.log(`✅ Confirmação do feedback (ID ${feedback.id}) excluída para forçar nova confirmação após ${isUpdate ? 'atualização' : 'criação'} do feedback`);
        } else {
          console.log(`ℹ️ Nenhuma confirmação existente para feedback ID ${feedback.id} (normal para feedback novo)`);
        }
      } catch (confirmationError) {
        console.warn(`⚠️ Erro ao excluir confirmação (não crítico):`, confirmationError.message);
      }
    }
    
    res.status(201).json({
      success: true,
      message: isUpdate ? 'Feedback atualizado com sucesso' : 'Feedback criado com sucesso',
      feedback: feedback,
    });
  } catch (error) {
    console.error('❌ Erro ao salvar feedback na rota:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Detalhes completos:', JSON.stringify(error, null, 2));
    res.status(500).json({
      error: 'Erro ao salvar feedback',
      details: error.message,
      code: error.code || error.error?.code,
      hint: error.hint || error.error?.hint
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
    console.log(`🗑️ Tentando excluir feedback ID: ${feedbackId}`);
    
    const allFeedbacks = await getManagerFeedbacks();
    const feedback = allFeedbacks.find(f => f.id === feedbackId);
    
    if (!feedback) {
      console.log(`⚠️ Feedback ID ${feedbackId} não encontrado na lista`);
      return res.status(404).json({
        error: 'Feedback não encontrado'
      });
    }
    
    // Verificar se o gestor é o autor do feedback
    if (feedback.manager_email !== req.user.email) {
      console.log(`⚠️ Tentativa de excluir feedback de outro gestor. Email do usuário: ${req.user.email}, Email do feedback: ${feedback.manager_email}`);
      return res.status(403).json({
        error: 'Você não tem permissão para excluir este feedback'
      });
    }
    
    console.log(`✅ Permissão confirmada. Excluindo feedback ID: ${feedbackId}`);
    
    // Buscar email do operador antes de excluir o feedback
    const { getOperatorEmailById } = await import('../utils/operatorUtils.js');
    const operatorEmail = getOperatorEmailById(feedback.operator_id);
    
    // Excluir feedback
    const deleted = await deleteManagerFeedback(feedbackId);
    
    if (deleted) {
      // Excluir também a confirmação do operador vinculada a este feedback
      // Isso garante que cada feedback tenha sua própria confirmação única
      const { deleteOperatorConfirmationByFeedbackId } = await import('../services/operatorConfirmationsService.js');
      try {
        const confirmationDeleted = await deleteOperatorConfirmationByFeedbackId(feedbackId);
        if (confirmationDeleted) {
          console.log(`✅ Confirmação do operador também foi excluída para feedback ID ${feedbackId}`);
        } else {
          console.warn(`⚠️ Confirmação não encontrada ou já foi excluída para feedback ID ${feedbackId}`);
        }
      } catch (confirmationError) {
        console.warn(`⚠️ Erro ao excluir confirmação (não crítico):`, confirmationError.message);
        // Não bloquear a exclusão do feedback se a confirmação não for excluída
      }
      
      // Verificar se realmente foi excluído
      const verifyFeedbacks = await getManagerFeedbacks();
      const stillExists = verifyFeedbacks.find(f => f.id === feedbackId);
      
      if (stillExists) {
        console.error(`❌ Feedback ID ${feedbackId} ainda existe após exclusão!`);
        return res.status(500).json({
          error: 'Erro ao excluir feedback: feedback ainda existe após tentativa de exclusão'
        });
      }
      
      console.log(`✅ Feedback ID ${feedbackId} excluído com sucesso`);
      res.json({
        success: true,
        message: 'Feedback excluído com sucesso',
      });
    } else {
      console.error(`❌ Erro ao excluir feedback ID ${feedbackId}`);
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

