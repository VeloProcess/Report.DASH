import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { enforceEmailFromToken } from '../middleware/emailValidationMiddleware.js';
import {
  getMetrics,
  getMetricByType,
  saveMetric,
  saveMultipleMetrics,
  getMetricsHistory,
  createMetricsSnapshot,
  getMetricChecks,
  getMetricCheck,
  setMetricCheck,
  getAIFeedbacks,
  getLatestAIFeedback,
  saveAIFeedback,
  logAction
} from '../services/metricsSupabaseService.js';
import { generateMetricFeedback, getOrGenerateMetricFeedback } from '../services/metricAIService.js';

const router = express.Router();

// Todas as rotas requerem autenticação e validação de email do token
router.use(authenticateToken);
router.use(enforceEmailFromToken);

/**
 * GET /api/metrics
 * Busca todas as métricas do operador autenticado
 */
router.get('/', async (req, res) => {
  try {
    const email = req.user.email;
    
    // Registrar ação
    await logAction(email, 'view_dashboard', { route: '/api/metrics' });

    const metrics = await getMetrics(email);
    
    res.json({
      success: true,
      metrics: metrics
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({
      error: 'Erro ao buscar métricas',
      details: error.message
    });
  }
});

// IMPORTANTE: Rotas específicas devem vir ANTES da rota genérica /:metricType
// Caso contrário, /history, /feedback, etc. serão capturadas por /:metricType

/**
 * GET /api/metrics/history
 * Busca histórico de métricas (sem tipo específico)
 * Query params: startDate, endDate
 */
router.get('/history', async (req, res) => {
  try {
    const email = req.user.email;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const history = await getMetricsHistory(email, null, start, end);
    
    res.json({
      success: true,
      history: history
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
 * GET /api/metrics/history/:metricType
 * Busca histórico de métricas por tipo específico
 * Query params: startDate, endDate
 */
router.get('/history/:metricType', async (req, res) => {
  try {
    const email = req.user.email;
    const metricType = req.params.metricType;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const history = await getMetricsHistory(email, metricType, start, end);
    
    res.json({
      success: true,
      history: history
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
 * GET /api/metrics/checks/all
 * Busca todos os checks de métricas do operador
 */
router.get('/checks/all', async (req, res) => {
  try {
    const email = req.user.email;

    const checks = await getMetricChecks(email);
    
    res.json({
      success: true,
      checks: checks
    });
  } catch (error) {
    console.error('Erro ao buscar checks:', error);
    res.status(500).json({
      error: 'Erro ao buscar checks',
      details: error.message
    });
  }
});

/**
 * GET /api/metrics/checks/:metricType
 * Busca check de uma métrica específica
 */
router.get('/checks/:metricType', async (req, res) => {
  try {
    const email = req.user.email;
    const metricType = req.params.metricType;

    const check = await getMetricCheck(email, metricType);
    
    res.json({
      success: true,
      check: check || { checked: false, metric_type: metricType }
    });
  } catch (error) {
    console.error('Erro ao buscar check:', error);
    res.status(500).json({
      error: 'Erro ao buscar check',
      details: error.message
    });
  }
});

/**
 * POST /api/metrics/checks
 * Marca ou desmarca uma métrica
 * Body: { metricType: string, checked: boolean }
 */
router.post('/checks', async (req, res) => {
  try {
    const email = req.user.email;
    const { metricType, checked } = req.body;

    console.log('📝 POST /api/metrics/checks - Recebido:', { email, metricType, checked, checkedType: typeof checked });

    if (!metricType) {
      return res.status(400).json({
        error: 'metricType é obrigatório',
        received: { metricType, checked }
      });
    }

    if (typeof checked !== 'boolean') {
      return res.status(400).json({
        error: 'checked deve ser um boolean',
        received: { metricType, checked, checkedType: typeof checked }
      });
    }

    console.log('✅ Validação passou, chamando setMetricCheck...');
    const check = await setMetricCheck(email, metricType, checked);
    console.log('✅ Check salvo com sucesso:', check);
    
    // Registrar ação (não bloquear se falhar)
    try {
      await logAction(email, checked ? 'check_metric' : 'uncheck_metric', { metricType });
    } catch (logError) {
      console.warn('⚠️ Erro ao registrar ação (não crítico):', logError.message);
    }

    res.json({
      success: true,
      check: check
    });
  } catch (error) {
    console.error('❌ Erro ao salvar check:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      error: 'Erro ao salvar check',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/metrics/feedback
 * Salva feedback I.A gerado manualmente
 * Body: { metricType: string, feedbackText: string }
 */
router.post('/feedback', async (req, res) => {
  try {
    const email = req.user.email;
    const { metricType, feedbackText } = req.body;

    if (!metricType || !feedbackText) {
      return res.status(400).json({
        error: 'metricType e feedbackText são obrigatórios'
      });
    }

    const feedback = await saveAIFeedback(email, metricType, feedbackText);
    
    // Resetar check da métrica quando um novo feedback é salvo
    // Isso garante que cada feedback tenha um check único
    try {
      await setMetricCheck(email, metricType, false);
      console.log(`✅ Check resetado para métrica ${metricType} após salvar novo feedback`);
    } catch (checkError) {
      console.warn(`⚠️ Erro ao resetar check (não crítico):`, checkError.message);
      // Não bloquear o salvamento do feedback se o reset do check falhar
    }
    
    // Registrar ação
    await logAction(email, 'save_ai_feedback', { metricType });

    res.json({
      success: true,
      feedback: feedback
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
 * GET /api/metrics/feedback
 * Busca todos os feedbacks I.A
 */
router.get('/feedback', async (req, res) => {
  try {
    const email = req.user.email;

    const feedbacks = await getAIFeedbacks(email, null);
    
    res.json({
      success: true,
      feedbacks: feedbacks
    });
  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error);
    res.status(500).json({
      error: 'Erro ao buscar feedbacks',
      details: error.message
    });
  }
});

/**
 * GET /api/metrics/feedback/:metricType/latest
 * Busca feedback I.A mais recente de uma métrica
 * IMPORTANTE: Esta rota deve vir ANTES da rota /feedback/:metricType
 */
router.get('/feedback/:metricType/latest', async (req, res) => {
  try {
    const email = req.user.email;
    const metricType = req.params.metricType;

    const feedback = await getLatestAIFeedback(email, metricType);
    
    res.json({
      success: true,
      feedback: feedback
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
 * GET /api/metrics/feedback/:metricType
 * Busca feedbacks I.A por tipo específico
 */
router.get('/feedback/:metricType', async (req, res) => {
  try {
    const email = req.user.email;
    const metricType = req.params.metricType;

    const feedbacks = await getAIFeedbacks(email, metricType);
    
    res.json({
      success: true,
      feedbacks: feedbacks
    });
  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error);
    res.status(500).json({
      error: 'Erro ao buscar feedbacks',
      details: error.message
    });
  }
});

/**
 * GET /api/metrics/:metricType
 * Busca uma métrica específica por tipo
 * IMPORTANTE: Esta rota genérica deve vir POR ÚLTIMO, após todas as rotas específicas
 */
router.get('/:metricType', async (req, res) => {
  try {
    const email = req.user.email;
    const metricType = req.params.metricType;

    const metric = await getMetricByType(email, metricType);
    
    if (!metric) {
      return res.status(404).json({
        error: 'Métrica não encontrada'
      });
    }

    res.json({
      success: true,
      metric: metric
    });
  } catch (error) {
    console.error('Erro ao buscar métrica:', error);
    res.status(500).json({
      error: 'Erro ao buscar métrica',
      details: error.message
    });
  }
});

/**
 * POST /api/metrics
 * Salva ou atualiza uma métrica
 * Body: { metricType: string, metricValue: Object }
 */
router.post('/', async (req, res) => {
  try {
    const email = req.user.email;
    const { metricType, metricValue } = req.body;

    if (!metricType || !metricValue) {
      return res.status(400).json({
        error: 'metricType e metricValue são obrigatórios'
      });
    }

    const metric = await saveMetric(email, metricType, metricValue);
    
    // Registrar ação
    await logAction(email, 'save_metric', { metricType });

    res.json({
      success: true,
      metric: metric
    });
  } catch (error) {
    console.error('Erro ao salvar métrica:', error);
    res.status(500).json({
      error: 'Erro ao salvar métrica',
      details: error.message
    });
  }
});

/**
 * POST /api/metrics/batch
 * Salva múltiplas métricas de uma vez
 * Body: { metrics: [{ type: string, value: Object }] }
 */
router.post('/batch', async (req, res) => {
  try {
    const email = req.user.email;
    const { metrics } = req.body;

    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        error: 'metrics deve ser um array'
      });
    }

    const savedMetrics = await saveMultipleMetrics(email, metrics);
    
    // Registrar ação
    await logAction(email, 'save_metrics_batch', { count: metrics.length });

    res.json({
      success: true,
      metrics: savedMetrics
    });
  } catch (error) {
    console.error('Erro ao salvar métricas:', error);
    res.status(500).json({
      error: 'Erro ao salvar métricas',
      details: error.message
    });
  }
});

/**
 * POST /api/metrics/snapshot
 * Cria um snapshot das métricas atuais no histórico
 * Body: { metricType: string, snapshotDate?: Date }
 */
router.post('/snapshot', async (req, res) => {
  try {
    const email = req.user.email;
    const { metricType, snapshotDate } = req.body;

    if (!metricType) {
      return res.status(400).json({
        error: 'metricType é obrigatório'
      });
    }

    // Buscar métrica atual
    const currentMetric = await getMetricByType(email, metricType);
    
    if (!currentMetric) {
      return res.status(404).json({
        error: 'Métrica atual não encontrada'
      });
    }

    const snapshot = await createMetricsSnapshot(
      email,
      metricType,
      currentMetric.metric_value,
      snapshotDate ? new Date(snapshotDate) : null
    );
    
    // Registrar ação
    await logAction(email, 'create_snapshot', { metricType });

    res.json({
      success: true,
      snapshot: snapshot
    });
  } catch (error) {
    console.error('Erro ao criar snapshot:', error);
    res.status(500).json({
      error: 'Erro ao criar snapshot',
      details: error.message
    });
  }
});

/**
 * POST /api/metrics/generate-feedback
 * Gera feedback I.A para uma métrica específica
 * Body: { metricType: string, forceRegenerate?: boolean }
 */
router.post('/generate-feedback', async (req, res) => {
  try {
    const email = req.user.email;
    const { metricType, forceRegenerate } = req.body;

    if (!metricType) {
      return res.status(400).json({
        error: 'metricType é obrigatório'
      });
    }

    // Gerar ou buscar feedback
    const feedbackText = await getOrGenerateMetricFeedback(
      email,
      metricType,
      forceRegenerate || false
    );

    // Buscar feedback salvo
    const savedFeedback = await getLatestAIFeedback(email, metricType);

    res.json({
      success: true,
      feedback: {
        text: feedbackText,
        ...savedFeedback
      }
    });
  } catch (error) {
    console.error('Erro ao gerar feedback:', error);
    res.status(500).json({
      error: 'Erro ao gerar feedback',
      details: error.message
    });
  }
});

export default router;

