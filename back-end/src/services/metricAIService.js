import { generateFeedback } from '../integrations/ai/aiService.js';
import { getMetricByType, getMetricsHistory, saveAIFeedback, logAction } from './metricsSupabaseService.js';
import { getOperatorByEmail } from '../utils/operatorUtils.js';

/**
 * Serviço para gerar feedbacks I.A por tipo de métrica
 * Adapta o serviço de I.A existente para trabalhar com métricas específicas
 */

/**
 * Tipos de métricas disponíveis
 */
export const METRIC_TYPES = {
  CHAMADAS: 'chamadas',
  TICKETS: 'tickets',
  QUALIDADE: 'qualidade',
  PAUSAS: 'pausas'
};

/**
 * Prompts específicos por tipo de métrica
 */
const METRIC_PROMPTS = {
  [METRIC_TYPES.CHAMADAS]: {
    system: `Você é um analista de desempenho especializado em análise de métricas de atendimento.
    Analise as métricas de chamadas do operador e forneça feedback objetivo, construtivo e acionável.
    Foque em: quantidade de chamadas, tempo médio de atendimento (TMA), eficiência e comparação com a média.
    Seja específico, use dados concretos e sugira melhorias práticas.`,
    focus: 'chamadas, TMA, volume de atendimento'
  },
  [METRIC_TYPES.TICKETS]: {
    system: `Você é um analista de desempenho especializado em análise de métricas de tickets.
    Analise as métricas de tickets do operador e forneça feedback objetivo, construtivo e acionável.
    Foque em: quantidade de tickets resolvidos, tempo médio de resolução (TMT), qualidade das soluções.
    Seja específico, use dados concretos e sugira melhorias práticas.`,
    focus: 'tickets resolvidos, TMT, eficiência na resolução'
  },
  [METRIC_TYPES.QUALIDADE]: {
    system: `Você é um analista de desempenho especializado em análise de métricas de qualidade.
    Analise as métricas de qualidade do operador e forneça feedback objetivo, construtivo e acionável.
    Foque em: nota de qualidade, quantidade de avaliações, consistência, pontos fortes e áreas de melhoria.
    Seja específico, use dados concretos e sugira melhorias práticas.`,
    focus: 'nota de qualidade, avaliações, consistência'
  },
  [METRIC_TYPES.PAUSAS]: {
    system: `Você é um analista de desempenho especializado em análise de métricas de disponibilidade e pausas.
    Analise as métricas de pausas do operador e forneça feedback objetivo, construtivo e acionável.
    Foque em: percentual de tempo logado, pausas escaladas vs realizadas, almoço, pausas de 10min, pausas de banheiro.
    Seja específico, use dados concretos e sugira melhorias práticas.`,
    focus: 'disponibilidade, pausas escaladas vs realizadas, gestão de tempo'
  }
};

/**
 * Formatar métricas para o prompt da I.A
 */
const formatMetricsForPrompt = (metricType, metricValue) => {
  if (!metricValue) {
    return 'Dados não disponíveis';
  }

  switch (metricType) {
    case METRIC_TYPES.CHAMADAS:
      return `
Métricas de Chamadas:
- Quantidade de chamadas: ${metricValue.calls || 'N/A'}
- Tempo Médio de Atendimento (TMA): ${metricValue.tma || 'N/A'}
- Eficiência: ${metricValue.efficiency || 'N/A'}
      `.trim();

    case METRIC_TYPES.TICKETS:
      return `
Métricas de Tickets:
- Tickets resolvidos: ${metricValue.tickets || 'N/A'}
- Tempo Médio de Resolução (TMT): ${metricValue.tmt || 'N/A'}
- Taxa de resolução: ${metricValue.resolution_rate || 'N/A'}
      `.trim();

    case METRIC_TYPES.QUALIDADE:
      return `
Métricas de Qualidade:
- Nota de qualidade: ${metricValue.nota_qualidade || 'N/A'}%
- Quantidade de avaliações: ${metricValue.qtd_avaliacoes || 'N/A'}
- Consistência: ${metricValue.consistency || 'N/A'}
      `.trim();

    case METRIC_TYPES.PAUSAS:
      return `
Métricas de Pausas e Disponibilidade:
- Percentual logado: ${metricValue.percent_logado || 'N/A'}%
- Pausa escalada: ${metricValue.pausa_escalada || 'N/A'}
- Pausa realizada: ${metricValue.total_pausas || 'N/A'}
- Almoço escalado: ${metricValue.almoco_escalado || 'N/A'}
- Almoço realizado: ${metricValue.almoco_realizado || 'N/A'}
- Pausa 10min escalada: ${metricValue.pausa10_escalada || 'N/A'}
- Pausa 10min realizada: ${metricValue.pausa10_realizado || 'N/A'}
- Pausa banheiro: ${metricValue.pausa_banheiro || 'N/A'}
      `.trim();

    default:
      return JSON.stringify(metricValue, null, 2);
  }
};

/**
 * Gerar feedback I.A para um tipo específico de métrica
 * @param {string} email - Email do operador (sempre do token)
 * @param {string} metricType - Tipo da métrica
 * @returns {Promise<string>} Texto do feedback gerado
 */
export const generateMetricFeedback = async (email, metricType) => {
  try {
    // Validar tipo de métrica
    if (!Object.values(METRIC_TYPES).includes(metricType)) {
      throw new Error(`Tipo de métrica inválido: ${metricType}`);
    }

    // Buscar métrica atual
    const currentMetric = await getMetricByType(email, metricType);
    
    if (!currentMetric || !currentMetric.metric_value) {
      throw new Error(`Métrica ${metricType} não encontrada para o operador`);
    }

    // Buscar histórico para comparação
    const history = await getMetricsHistory(email, metricType);
    const lastMonthMetric = history.length > 0 ? history[0] : null;

    // Buscar dados do operador
    const operator = getOperatorByEmail(email);
    const operatorName = operator ? operator.name : 'Operador';

    // Formatar métricas para o prompt
    const currentMetricsText = formatMetricsForPrompt(metricType, currentMetric.metric_value);
    
    let comparisonText = '';
    if (lastMonthMetric && lastMonthMetric.metric_value) {
      const lastMetricsText = formatMetricsForPrompt(metricType, lastMonthMetric.metric_value);
      comparisonText = `\n\nComparação com mês anterior:\n${lastMetricsText}`;
    }

    // Obter prompt específico do tipo de métrica
    const metricPrompt = METRIC_PROMPTS[metricType];
    
    // Criar prompt completo
    const fullPrompt = `
Analise as seguintes métricas de ${metricPrompt.focus} do operador ${operatorName}:

${currentMetricsText}
${comparisonText}

Forneça um feedback objetivo, construtivo e acionável. Seja específico, use os dados apresentados e sugira melhorias práticas.
O feedback deve ser direto, profissional e focado em desenvolvimento.
    `.trim();

    // Gerar feedback usando o serviço de I.A existente
    // Adaptar os dados para o formato esperado pelo generateFeedback
    const operatorData = {
      name: operatorName,
      email: email
    };

    // Criar objeto de indicadores no formato esperado
    const indicators = {
      ...currentMetric.metric_value,
      additionalData: currentMetric.metric_value
    };

    // Gerar feedback
    const aiResponse = await generateFeedback(operatorData, indicators, null);
    
    // Extrair texto do feedback
    let feedbackText = '';
    if (aiResponse && aiResponse.summary) {
      feedbackText = aiResponse.summary;
      
      // Adicionar análise de métricas se disponível
      if (aiResponse.metricsAnalysis) {
        feedbackText += `\n\nAnálise Detalhada:\n${aiResponse.metricsAnalysis}`;
      }
    } else {
      // Fallback: usar resposta completa se não houver summary
      feedbackText = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);
    }

    // Salvar feedback no Supabase
    await saveAIFeedback(email, metricType, feedbackText);
    
    // Registrar ação
    await logAction(email, 'generate_ai_feedback', { metricType });

    return feedbackText;
  } catch (error) {
    console.error(`Erro ao gerar feedback para métrica ${metricType}:`, error);
    throw error;
  }
};

/**
 * Buscar ou gerar feedback I.A para uma métrica
 * Se já existe feedback do dia atual, retorna ele. Caso contrário, gera novo.
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica
 * @param {boolean} forceRegenerate - Forçar regeneração mesmo se já existir
 * @returns {Promise<string>} Texto do feedback
 */
export const getOrGenerateMetricFeedback = async (email, metricType, forceRegenerate = false) => {
  try {
    // Se não forçar regeneração, buscar feedback mais recente
    if (!forceRegenerate) {
      const { getLatestAIFeedback } = await import('./metricsSupabaseService.js');
      const latestFeedback = await getLatestAIFeedback(email, metricType);
      
      if (latestFeedback) {
        const today = new Date().toISOString().split('T')[0];
        const feedbackDate = latestFeedback.generated_at.split('T')[0];
        
        // Se o feedback é de hoje, retornar ele
        if (feedbackDate === today) {
          return latestFeedback.feedback_text;
        }
      }
    }

    // Gerar novo feedback
    return await generateMetricFeedback(email, metricType);
  } catch (error) {
    console.error(`Erro ao buscar/gerar feedback para métrica ${metricType}:`, error);
    throw error;
  }
};

