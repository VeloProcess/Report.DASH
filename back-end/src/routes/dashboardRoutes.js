import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
  getLatestIndicatorByOperatorId, 
  getLatestFeedbackByOperatorId,
  getIndicators,
  getFeedbacks,
  getOperators
} from '../database.js';
import { getOperatorByEmail } from '../utils/operatorUtils.js';
import { 
  getMetricsByEmail, 
  convertMetricsToDashboardFormat,
  getAvailableMonths
} from '../services/metricsService.js';
import { compareMonthsForTopics } from '../services/monthComparisonService.js';
import { generateThreeMonthsFeedbackDirect } from '../services/threeMonthsAIService.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * GET /api/dashboard/metrics
 * Retorna métricas/indicadores do operador autenticado
 * Query params:
 *   - month (opcional): "Outubro", "Novembro", "Dezembro" - retorna métricas do mês específico
 */
router.get('/metrics', async (req, res) => {
  try {
    const operatorId = req.user.operatorId;
    const email = req.user.email;
    const month = req.query.month || null; // Mês solicitado via query param
    
    console.log(`📊 Buscando métricas para operador ID: ${operatorId}, Email: ${email}${month ? `, Mês: ${month}` : ''}`);
    
    // PRIORIDADE 1: Buscar no Metrics.json (nova estrutura)
    let metricsData = getMetricsByEmail(email, month);
    let indicators = null;
    
    if (metricsData) {
      console.log(`✅ Métricas encontradas no Metrics.json para: ${email}${month ? ` (mês: ${month})` : ''}`);
      indicators = convertMetricsToDashboardFormat(metricsData, month);
      
      if (indicators) {
        console.log(`✅ Métricas convertidas: ${Object.keys(indicators).filter(k => indicators[k] !== null).length} campos preenchidos`);
        
        // Incluir informações sobre meses disponíveis
        const availableMonths = getAvailableMonths(email);
        
        return res.json({
          hasData: true,
          indicators,
          source: 'Metrics.json',
          lastUpdated: metricsData.metricas_atualizadas_em || null,
          month: month || 'atual',
          availableMonths: availableMonths,
        });
      }
    }
    
    // PRIORIDADE 2: Buscar no sistema antigo (indicators.json) se não encontrou no Metrics.json
    if (!indicators && operatorId && operatorId !== 0) {
      console.log(`🔄 Buscando métricas no sistema antigo (indicators.json)...`);
      indicators = getLatestIndicatorByOperatorId(operatorId);
      
      if (indicators) {
        console.log(`✅ Métricas encontradas no sistema antigo`);
        return res.json({
          hasData: true,
          indicators,
          source: 'indicators.json',
        });
      }
    }
    
    // PRIORIDADE 3: Tentar buscar por IDs alternativos
    if (!indicators && operatorId && operatorId !== 0) {
      console.log(`🔄 Tentando buscar por IDs alternativos...`);
      const operator = getOperatorByEmail(email);
      if (operator && operator.id !== operatorId) {
        indicators = getLatestIndicatorByOperatorId(operator.id);
        if (indicators) {
          console.log(`✅ Métricas encontradas com ID alternativo: ${operator.id}`);
          return res.json({
            hasData: true,
            indicators,
            source: 'indicators.json (ID alternativo)',
          });
        }
      }
    }
    
    // PRIORIDADE 4: Buscar por nome
    if (!indicators) {
      console.log(`🔄 Tentando buscar por nome do operador...`);
      const operator = getOperatorByEmail(email);
      if (operator) {
        const allIndicators = getIndicators();
        const operatorIndicators = allIndicators
          .filter(i => {
            const op = getOperators().find(o => o.id === i.operator_id);
            return op && op.name?.toLowerCase().trim() === operator.name?.toLowerCase().trim();
          })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        if (operatorIndicators.length > 0) {
          indicators = operatorIndicators[0];
          console.log(`✅ Métricas encontradas por nome: ${operatorIndicators.length} registro(s)`);
          return res.json({
            hasData: true,
            indicators,
            source: 'indicators.json (por nome)',
          });
        }
      }
    }

    // Nenhuma métrica encontrada
    console.log(`❌ Nenhuma métrica encontrada para operador ID: ${operatorId}, Email: ${email}`);
    return res.json({
      hasData: false,
      message: 'Nenhuma métrica encontrada para este operador',
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar métricas',
      details: error.message 
    });
  }
});

/**
 * GET /api/dashboard/indicators
 * Alias para /metrics (compatibilidade)
 */
router.get('/indicators', async (req, res) => {
  try {
    const operatorId = req.user.operatorId;
    const indicators = getLatestIndicatorByOperatorId(operatorId);

    if (!indicators) {
      return res.json(null);
    }

    res.json(indicators);
  } catch (error) {
    console.error('Erro ao buscar indicadores:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar indicadores',
      details: error.message 
    });
  }
});

/**
 * GET /api/dashboard/feedback
 * Retorna feedback do operador autenticado
 */
router.get('/feedback', async (req, res) => {
  try {
    const operatorId = req.user.operatorId;
    const feedback = getLatestFeedbackByOperatorId(operatorId);

    if (!feedback) {
      return res.json({
        hasData: false,
        message: 'Nenhum feedback encontrado para este operador',
      });
    }

    res.json({
      hasData: true,
      feedback,
    });
  } catch (error) {
    console.error('Erro ao buscar feedback:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar feedback',
      details: error.message 
    });
  }
});

/**
 * GET /api/dashboard/history
 * Retorna histórico de métricas e feedbacks do operador autenticado
 */
router.get('/history', async (req, res) => {
  try {
    const operatorId = req.user.operatorId;
    
    // Buscar todos os indicadores do operador (ordenados por data)
    const allIndicators = getIndicators()
      .filter(i => i.operator_id === parseInt(operatorId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Buscar todos os feedbacks do operador (ordenados por data)
    const allFeedbacks = getFeedbacks()
      .filter(f => f.operator_id === parseInt(operatorId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      indicators: allIndicators,
      feedbacks: allFeedbacks,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar histórico',
      details: error.message 
    });
  }
});

/**
 * GET /api/dashboard/months
 * Retorna lista de meses disponíveis para o operador autenticado
 */
router.get('/months', async (req, res) => {
  try {
    const email = req.user.email;
    const months = getAvailableMonths(email);
    
    res.json({
      availableMonths: months,
      total: months.length,
    });
  } catch (error) {
    console.error('Erro ao buscar meses disponíveis:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar meses disponíveis',
      details: error.message 
    });
  }
});

/**
 * GET /api/dashboard/operator
 * Retorna dados completos do operador autenticado
 */
router.get('/operator', async (req, res) => {
  try {
    const email = req.user.email;
    console.log(`👤 Buscando dados do operador por email: ${email}`);
    
    const operator = getOperatorByEmail(email);

    if (!operator) {
      console.log(`❌ Operador não encontrado para email: ${email}`);
      // Retornar dados básicos do usuário mesmo sem operador cadastrado
      return res.json({
        id: null,
        name: req.user.operatorName || req.user.email,
        email: email,
        position: null,
        team: null,
        reference_month: null,
        notFound: true,
        message: 'Operador não encontrado no banco de dados'
      });
    }

    console.log(`✅ Operador encontrado: ID ${operator.id} - "${operator.name}"`);
    res.json(operator);
  } catch (error) {
    console.error('Erro ao buscar dados do operador:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar dados do operador',
      details: error.message 
    });
  }
});

/**
 * GET /api/dashboard/comparison
 * Retorna comparação entre meses para os tópicos específicos
 * Query params:
 *   - month (opcional): "Outubro", "Novembro", "Dezembro" - mês atual para comparação
 */
router.get('/comparison', async (req, res) => {
  try {
    // Se operatorEmail for fornecido (gestor visualizando operador), usar esse email
    // Caso contrário, usar o email do usuário autenticado
    const email = req.query.operatorEmail || req.user.email;
    const month = req.query.month || 'Dezembro';
    
    // Verificar se é gestor tentando ver outro operador
    const isManagerViewingOperator = req.query.operatorEmail && req.user.isManager;
    
    console.log(`📊 Buscando comparação de meses para: ${email}, Mês: ${month}${isManagerViewingOperator ? ' (visualização de gestor)' : ''}`);
    
    const comparison = compareMonthsForTopics(email, month);
    
    console.log(`📊 Resultado da comparação:`, comparison ? 'Dados encontrados' : 'null');
    
    if (!comparison) {
      console.log(`⚠️ Comparação retornou null - dados insuficientes`);
      return res.json({
        success: false,
        message: 'Dados insuficientes para comparação. É necessário ter dados de pelo menos 2 meses.'
      });
    }
    
    console.log(`✅ Comparação calculada com ${Object.keys(comparison.comparison || {}).length} tópicos`);
    
    res.json({
      success: true,
      comparison
    });
  } catch (error) {
    console.error('❌ Erro ao buscar comparação:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar comparação',
      details: error.message 
    });
  }
});

/**
 * GET /api/dashboard/three-months-feedback
 * Retorna feedback de IA dos últimos 3 meses do operador
 * Query params:
 *   - operatorEmail (opcional): Email do operador (para gestores visualizando outro operador)
 *   - forceRegenerate (opcional): true para forçar regeneração do feedback
 */
router.get('/three-months-feedback', async (req, res) => {
  try {
    // Se operatorEmail for fornecido (gestor visualizando operador), usar esse email
    // Caso contrário, usar o email do usuário autenticado
    const email = req.query.operatorEmail || req.user.email;
    const forceRegenerate = req.query.forceRegenerate === 'true';
    
    console.log(`📥 GET /api/dashboard/three-months-feedback - Email: ${email}, ForceRegenerate: ${forceRegenerate}`);
    
    // Gerar feedback de 3 meses
    const feedback = await generateThreeMonthsFeedbackDirect(email);
    
    res.json({
      success: true,
      feedback: feedback,
      email: email
    });
  } catch (error) {
    console.error('❌ Erro ao gerar feedback de 3 meses:', error);
    res.status(500).json({
      error: 'Erro ao gerar feedback de 3 meses',
      details: error.message
    });
  }
});

export default router;

