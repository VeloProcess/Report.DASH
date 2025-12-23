import { 
  getOperatorById, 
  addIndicator, 
  getLatestIndicatorByOperatorId,
  addFeedback,
  getLatestFeedbackByOperatorId,
  getAllFeedbacksWithOperators
} from '../database.js';
import { generateFeedback } from '../integrations/ai/aiService.js';
import { createLog } from '../services/logService.js';
import { sendFeedbackEmail } from '../services/emailService.js';
import { generateFeedbackPDF } from '../services/pdfService.js';
import { getMetricsByEmail, convertMetricsToDashboardFormat, getAvailableMonths } from '../services/metricsService.js';
import { compareMonths, formatComparisonForPrompt } from '../services/monthComparisonService.js';

export const createIndicators = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    const { 
      calls, 
      tma, 
      qualityScore, 
      absenteeism,
      // Campos adicionais
      qtdPesqTelefone,
      tickets,
      tmt,
      pesquisaTicket,
      qtdPesqTicket,
      totalEscalado,
      totalLogado,
      percentLogado,
      pausaEscalada,
      totalPausas,
      percentPausas,
      almocoEscalado,
      almocoRealizado,
      percentAlmoco,
      pausa10Escalada,
      pausa10Realizado,
      percentPausa10,
      pausaBanheiro,
      percentPausaBanheiro,
      pausaFeedback,
      percentPausaFeedback,
      treinamento,
      percentTreinamento,
    } = req.body;

    // Usar operatorId do usuário autenticado
    const operatorId = req.user.operatorId;

    const operator = getOperatorById(operatorId);

    if (!operator) {
      return res.status(404).json({ error: 'Operador não encontrado' });
    }

    addIndicator({
      operator_id: parseInt(operatorId),
      // Campos principais
      calls: calls || null,
      tma: tma || null,
      quality_score: qualityScore || null,
      absenteeism: absenteeism || null,
      // Campos adicionais
      qtd_pesq_telefone: qtdPesqTelefone || null,
      tickets: tickets || null,
      tmt: tmt || null,
      pesquisa_ticket: pesquisaTicket || null,
      qtd_pesq_ticket: qtdPesqTicket || null,
      total_escalado: totalEscalado || null,
      total_logado: totalLogado || null,
      percent_logado: percentLogado || null,
      pausa_escalada: pausaEscalada || null,
      total_pausas: totalPausas || null,
      percent_pausas: percentPausas || null,
      almoco_escalado: almocoEscalado || null,
      almoco_realizado: almocoRealizado || null,
      percent_almoco: percentAlmoco || null,
      pausa_10_escalada: pausa10Escalada || null,
      pausa_10_realizado: pausa10Realizado || null,
      percent_pausa_10: percentPausa10 || null,
      pausa_banheiro: pausaBanheiro || null,
      percent_pausa_banheiro: percentPausaBanheiro || null,
      pausa_feedback: pausaFeedback || null,
      percent_pausa_feedback: percentPausaFeedback || null,
      treinamento: treinamento || null,
      percent_treinamento: percentTreinamento || null,
    });

    createLog(operator.name, operator.reference_month, 'Inserção de indicadores', 'success', `Indicadores inseridos para ${operator.name}`);

    res.status(201).json({ message: 'Indicadores cadastrados com sucesso' });
  } catch (error) {
    createLog(null, null, 'Inserção de indicadores', 'error', error.message);
    res.status(500).json({ error: 'Erro ao cadastrar indicadores', details: error.message });
  }
};

export const generateFeedbackWithAI = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    // Usar operatorId do usuário autenticado
    const operatorId = req.user.operatorId;

    console.log('=== DEBUG: Gerar Feedback ===');
    console.log('operatorId do usuário autenticado:', operatorId);

    const operator = getOperatorById(operatorId);

    if (!operator) {
      console.log('Operador não encontrado para ID:', operatorId);
      return res.status(404).json({ error: 'Operador não encontrado' });
    }

    console.log('Operador encontrado:', operator.name);

    // Buscar métricas do Metrics.json (prioridade) ou do sistema antigo
    const email = req.user.email;
    let indicators = null;
    let currentMonth = null;
    
    // Tentar buscar do Metrics.json primeiro
    const metricsData = getMetricsByEmail(email);
    if (metricsData && metricsData.dados) {
      console.log('✅ Métricas encontradas no Metrics.json');
      indicators = convertMetricsToDashboardFormat(metricsData);
      currentMonth = metricsData.mes_atual || 'Dezembro'; // Usar mês atual ou padrão Dezembro
      
      // Adicionar dados adicionais para compatibilidade
      indicators.additionalData = {
        ...indicators,
        ...metricsData.dados
      };
    } else {
      // Fallback para sistema antigo
      indicators = getLatestIndicatorByOperatorId(operatorId);
      console.log('⚠️ Usando sistema antigo (indicators.json)');
    }

    console.log('Indicadores encontrados:', indicators ? 'Sim' : 'Não');
    if (indicators) {
      console.log('Campos do indicador:', Object.keys(indicators));
    }

    if (!indicators) {
      return res.status(400).json({ 
        error: 'Indicadores não encontrados para este operador',
        details: 'Certifique-se de que os indicadores foram cadastrados antes de gerar o feedback.'
      });
    }

    // Buscar comparação entre meses
    let monthComparison = null;
    let comparisonText = '';
    
    if (email && currentMonth) {
      console.log(`📊 Buscando comparação de meses para ${email} (mês atual: ${currentMonth})`);
      monthComparison = compareMonths(email, currentMonth);
      if (monthComparison) {
        comparisonText = formatComparisonForPrompt(monthComparison);
        console.log('✅ Comparação entre meses gerada:', monthComparison.summary);
      } else {
        console.log('⚠️ Comparação entre meses não disponível (dados insuficientes)');
      }
    }

    // Gerar feedback com IA
    console.log('Chamando IA para gerar feedback...');
    console.log('🔍 DEBUG: Verificando variáveis de ambiente...');
    console.log('🔍 DEBUG: process.env.GROQ_API_KEY existe?', !!process.env.GROQ_API_KEY);
    console.log('🔍 DEBUG: process.env.GEMINI_API_KEY existe?', !!process.env.GEMINI_API_KEY);
    
    const groqKey = process.env.GROQ_API_KEY?.trim().replace(/\s+/g, '').replace(/['"]/g, '');
    const geminiKey = process.env.GEMINI_API_KEY?.trim().replace(/\s+/g, '').replace(/['"]/g, '');
    
    console.log('GROQ_API_KEY configurada:', !!groqKey, groqKey ? `(tamanho: ${groqKey.length})` : '(vazia)');
    console.log('GEMINI_API_KEY configurada:', !!geminiKey, geminiKey ? `(tamanho: ${geminiKey.length})` : '(vazia)');
    
    if (!groqKey && !geminiKey) {
      console.error('❌ Nenhuma API configurada!');
      console.error('💡 Verifique o arquivo back-end/.env');
      console.error('💡 Certifique-se de que as linhas GROQ_API_KEY=... e/ou GEMINI_API_KEY=... estão presentes');
      return res.status(500).json({ 
        error: 'Nenhuma API de IA configurada',
        details: 'Configure GROQ_API_KEY (principal) ou GEMINI_API_KEY (fallback) no arquivo .env (pasta back-end/). Verifique CONFIGURAR_APIS_LOCAL.md para instruções.'
      });
    }
    
    const feedbackData = await generateFeedback(operator, indicators, monthComparison);
    console.log('Feedback gerado com sucesso. Campos:', Object.keys(feedbackData));

    // Salvar feedback no banco
    addFeedback({
      operator_id: parseInt(operatorId),
      feedback_text: feedbackData.summary || feedbackData.feedbackText,
      positive_points: feedbackData.positivePoints,
      attention_points: feedbackData.attentionPoints,
      recommendations: feedbackData.recommendations,
      operator_response_model: feedbackData.operatorResponseModel,
      metrics_analysis: feedbackData.metricsAnalysis || null,
    });

    createLog(
      operator.name,
      operator.reference_month,
      'Geração de feedback com IA',
      'success',
      `Feedback gerado com sucesso para ${operator.name}`
    );

    res.status(201).json({
      message: 'Feedback gerado com sucesso',
      feedback: feedbackData,
    });
  } catch (error) {
    console.error('❌ Erro completo ao gerar feedback:', error);
    console.error('Stack:', error.stack);
    
    const operator = req.user ? getOperatorById(req.user.operatorId) : null;

    createLog(
      operator?.name || req.user?.operatorName || null,
      operator?.reference_month || null,
      'Geração de feedback com IA',
      'error',
      error.message || 'Erro desconhecido'
    );

    // Retornar erro sem fazer o servidor cair
    res.status(500).json({
      error: 'Erro ao gerar feedback',
      details: error.message || 'Erro desconhecido ao gerar feedback com IA'
    });
  }
};

export const getFeedbackByOperator = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    // Usar operatorId do usuário autenticado
    const operatorId = req.user.operatorId;
    const feedback = getLatestFeedbackByOperatorId(operatorId);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback não encontrado para este operador' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar feedback', details: error.message });
  }
};

export const getAllFeedbacks = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    // Retornar apenas feedbacks do operador autenticado
    const operatorId = req.user.operatorId;
    const feedback = getLatestFeedbackByOperatorId(operatorId);

    if (!feedback) {
      return res.json([]);
    }

    res.json([feedback]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar feedbacks', details: error.message });
  }
};

export const sendFeedbackByEmail = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    // Usar operatorId do usuário autenticado
    const operatorId = req.user.operatorId;

    const operator = getOperatorById(operatorId);

    if (!operator) {
      return res.status(404).json({ error: 'Operador não encontrado' });
    }

    const feedback = getLatestFeedbackByOperatorId(operatorId);

    if (!feedback) {
      return res.status(400).json({ error: 'Feedback não encontrado para este operador' });
    }

    // Buscar indicadores para incluir no email
    const indicators = getLatestIndicatorByOperatorId(operatorId);

    // Gerar PDF do feedback
    const pdfBuffer = await generateFeedbackPDF(operator, feedback);

    // Enviar email com PDF e métricas
    const emailResult = await sendFeedbackEmail(operator, feedback, pdfBuffer, indicators);

    createLog(
      operator.name,
      operator.reference_month,
      'Envio de feedback por email',
      'success',
      `Feedback enviado por email para ${emailResult.email}`
    );

    res.status(200).json({
      message: 'Feedback enviado por email com sucesso',
      email: emailResult.email,
    });
  } catch (error) {
    const operator = req.user ? getOperatorById(req.user.operatorId) : null;
    
    createLog(
      operator?.name || req.user?.operatorName || null,
      operator?.reference_month || null,
      'Envio de feedback por email',
      'error',
      error.message
    );

    res.status(500).json({ 
      error: 'Erro ao enviar feedback por email', 
      details: error.message 
    });
  }
};

