/**
 * Serviço para gerar feedback de IA dos últimos 3 meses
 * Analisa a evolução do operador ao longo dos últimos 3 meses
 */

import { generateFeedback } from '../integrations/ai/aiService.js';
import { getMetricsByEmail, convertMetricsToDashboardFormat, getAvailableMonths } from './metricsService.js';
import { getOperatorByEmail } from '../utils/operatorUtils.js';

/**
 * Formatar métricas de um mês para o prompt
 */
const formatMonthMetrics = (month, metrics) => {
  if (!metrics) return `\n${month}: Dados não disponíveis`;
  
  const add = metrics.additionalData || metrics;
  
  return `
${month}:
- Ligações: ${metrics.calls || add.calls || 'N/A'}
- TMA: ${metrics.tma || add.tma || 'N/A'}
- Tickets: ${add.tickets || 'N/A'}
- TMT: ${add.tmt || 'N/A'}
- % Logado: ${metrics.percent_logado || add.percent_logado || 'N/A'}%
- Nota Qualidade: ${add.nota_qualidade || 'N/A'}%
- Qtd Avaliações: ${add.qtd_avaliacoes || 'N/A'}
- Pausas Escaladas: ${add.pausa_escalada || 'N/A'}
- Pausas Realizadas: ${add.total_pausas || 'N/A'}
- Almoço Escalado: ${add.almoco_escalado || 'N/A'}
- Almoço Realizado: ${add.almoco_realizado || 'N/A'}
- Pausa 10min Escalada: ${add.pausa10_escalada || 'N/A'}
- Pausa 10min Realizada: ${add.pausa10_realizado || 'N/A'}
- Pausa Banheiro: ${add.pausa_banheiro || 'N/A'}
- Pausa Feedback: ${add.pausa_feedback || 'N/A'}
`;
};

/**
 * Gerar feedback de IA dos últimos 3 meses
 * @param {string} email - Email do operador
 * @returns {Promise<string>} Texto do feedback gerado
 */
export const generateThreeMonthsFeedback = async (email) => {
  try {
    console.log(`🤖 Gerando feedback de 3 meses para: ${email}`);
    
    // Buscar dados do operador
    const operator = getOperatorByEmail(email);
    const operatorName = operator ? operator.name : 'Operador';
    
    // Meses disponíveis (ordem: mais recente primeiro)
    const meses = ['Dezembro', 'Novembro', 'Outubro'];
    
    // Buscar métricas dos últimos 3 meses
    const monthsData = {};
    for (const mes of meses) {
      const metrics = getMetricsByEmail(email, mes);
      if (metrics && metrics.dados) {
        const converted = convertMetricsToDashboardFormat(metrics, mes);
        if (converted) {
          monthsData[mes] = converted;
        }
      }
    }
    
    // Verificar se temos pelo menos 2 meses de dados
    const availableMonths = Object.keys(monthsData);
    if (availableMonths.length < 2) {
      throw new Error(`Dados insuficientes para análise de 3 meses. Meses disponíveis: ${availableMonths.join(', ')}`);
    }
    
    console.log(`📊 Meses com dados disponíveis: ${availableMonths.join(', ')}`);
    
    // Formatar métricas de cada mês
    let monthsMetricsText = '';
    for (const mes of meses) {
      if (monthsData[mes]) {
        monthsMetricsText += formatMonthMetrics(mes, monthsData[mes]);
      }
    }
    
    // Criar prompt para a IA
    const prompt = `Analise a evolução do desempenho do operador ${operatorName} nos últimos 3 meses:

${monthsMetricsText}

Forneça um feedback comparativo dos últimos 3 meses seguindo este formato:

1. **Comparação Geral**: Analise a evolução geral do operador ao longo dos 3 meses. Mencione se está melhorando, piorando ou mantendo o desempenho.

2. **Pontos de Melhoria**: Identifique os quesitos onde o operador está melhorando. Seja específico e mencione os meses comparados.

3. **Pontos de Atenção**: Identifique os quesitos onde o operador está piorando ou precisa de atenção. Seja específico e mencione os meses comparados.

4. **Pontos Mantidos**: Identifique os quesitos onde o operador manteve um desempenho semelhante ao longo dos meses.

5. **Recomendações para o Próximo Mês**: Com base na análise dos últimos 3 meses, forneça recomendações práticas e acionáveis para o próximo mês. Foque nas áreas que estão piorando ou que podem ser melhoradas.

O feedback deve ser:
- Objetivo e construtivo
- Específico com dados dos meses analisados
- Focado em desenvolvimento e melhoria contínua
- Profissional e encorajador
- Prático e acionável

Formato de resposta (JSON):
{
  "summary": "Resumo geral da evolução nos últimos 3 meses (2-3 frases)",
  "improving": "Quesitos onde está melhorando (lista com detalhes)",
  "declining": "Quesitos onde está piorando ou precisa atenção (lista com detalhes)",
  "maintained": "Quesitos onde manteve desempenho semelhante (lista)",
  "recommendations": "Recomendações práticas para o próximo mês (lista de ações específicas)"
}`;

    const systemPrompt = `Você é um analista de desempenho especializado em análise de evolução de métricas ao longo do tempo.
Analise os dados dos últimos 3 meses do operador e forneça um feedback comparativo objetivo, construtivo e acionável.
Foque em identificar tendências, pontos de melhoria e recomendações práticas para o próximo mês.`;

    // Gerar feedback usando a IA (Groq > Gemini > OpenAI)
    const aiResponse = await generateFeedback(
      { name: operatorName, email: email },
      monthsData[meses[0]] || {}, // Passar dados do mês mais recente como indicadores
      null
    );
    
    // Se a resposta não veio no formato esperado, tentar parsear como JSON
    let feedbackData;
    if (typeof aiResponse === 'string') {
      try {
        feedbackData = JSON.parse(aiResponse);
      } catch (e) {
        // Se não for JSON, usar a resposta como está
        feedbackData = { summary: aiResponse };
      }
    } else {
      feedbackData = aiResponse;
    }
    
    // Gerar feedback estruturado
    let feedbackText = '';
    
    if (feedbackData.summary) {
      feedbackText += `📊 **Análise dos Últimos 3 Meses**\n\n${feedbackData.summary}\n\n`;
    }
    
    if (feedbackData.improving) {
      feedbackText += `✅ **Quesitos em Melhoria:**\n${feedbackData.improving}\n\n`;
    }
    
    if (feedbackData.declining) {
      feedbackText += `⚠️ **Quesitos que Precisam de Atenção:**\n${feedbackData.declining}\n\n`;
    }
    
    if (feedbackData.maintained) {
      feedbackText += `➡️ **Quesitos Mantidos:**\n${feedbackData.maintained}\n\n`;
    }
    
    if (feedbackData.recommendations) {
      feedbackText += `🎯 **Recomendações para o Próximo Mês:**\n${feedbackData.recommendations}\n\n`;
    }
    
    // Se não veio no formato esperado, usar o feedback padrão
    if (!feedbackText || feedbackText.trim() === '') {
      feedbackText = aiResponse.summary || aiResponse.feedbackText || String(aiResponse);
    }
    
    console.log(`✅ Feedback de 3 meses gerado com sucesso para ${operatorName}`);
    
    return feedbackText.trim();
  } catch (error) {
    console.error(`❌ Erro ao gerar feedback de 3 meses:`, error);
    throw error;
  }
};

/**
 * Gerar feedback de 3 meses usando prompt direto (mais específico)
 */
export const generateThreeMonthsFeedbackDirect = async (email) => {
  try {
    console.log(`🤖 Gerando feedback de 3 meses (método direto) para: ${email}`);
    
    // Buscar dados do operador
    const operator = getOperatorByEmail(email);
    const operatorName = operator ? operator.name : 'Operador';
    
    // Meses disponíveis
    const meses = ['Dezembro', 'Novembro', 'Outubro'];
    
    // Buscar métricas dos últimos 3 meses
    const monthsData = {};
    for (const mes of meses) {
      const metrics = getMetricsByEmail(email, mes);
      if (metrics && metrics.dados) {
        const converted = convertMetricsToDashboardFormat(metrics, mes);
        if (converted) {
          monthsData[mes] = converted;
        }
      }
    }
    
    // Verificar se temos pelo menos 2 meses de dados
    const availableMonths = Object.keys(monthsData);
    if (availableMonths.length < 2) {
      throw new Error(`Dados insuficientes para análise de 3 meses. Meses disponíveis: ${availableMonths.join(', ')}`);
    }
    
    // Formatar métricas de cada mês
    let monthsMetricsText = '';
    for (const mes of meses) {
      if (monthsData[mes]) {
        monthsMetricsText += formatMonthMetrics(mes, monthsData[mes]);
      }
    }
    
    // Criar prompt específico
    const prompt = `Analise a evolução do desempenho do operador ${operatorName} nos últimos 3 meses:

${monthsMetricsText}

IMPORTANTE - Entenda corretamente o que significa MELHORAR vs PIORAR para cada métrica:

MÉTRICAS ONDE MENOR É MELHOR (redução = melhoria):
- TMA (Tempo Médio de Atendimento): Se diminuiu de 5min para 3min = MELHOROU (não aumentou!)
- TMT (Tempo Médio de Tratamento): Se diminuiu = MELHOROU
- Pausas: Se diminuiu = MELHOROU

MÉTRICAS ONDE MAIOR É MELHOR (aumento = melhoria):
- Ligações: Se aumentou = MELHOROU
- Tickets: Se aumentou = MELHOROU
- Nota Qualidade: Se aumentou = MELHOROU
- % Logado: Se aumentou = MELHOROU
- Qtd Avaliações: Se aumentou = MELHOROU

ATENÇÃO: Quando TMA ou TMT diminuem, isso é uma MELHORIA, não uma piora! Use palavras como "reduziu", "diminuiu", "melhorou" ao invés de "aumentou".

Forneça um feedback comparativo seguindo este formato JSON:

{
  "summary": "Resumo geral da evolução nos últimos 3 meses (2-3 frases). Mencione se está melhorando, piorando ou mantendo desempenho.",
  "improving": "Quesitos onde está melhorando. Para TMA/TMT: mencione a REDUÇÃO (ex: 'TMA reduziu de 5min para 3min'). Para outras: mencione o AUMENTO.",
  "declining": "Quesitos onde está piorando ou precisa atenção. Para TMA/TMT: mencione o AUMENTO (ex: 'TMA aumentou de 3min para 5min'). Para outras: mencione a REDUÇÃO.",
  "maintained": "Quesitos onde manteve desempenho semelhante (lista)",
  "recommendations": "Recomendações práticas para o próximo mês (lista de ações específicas)"
}`;

    const systemPrompt = `Você é um analista de desempenho. Analise os dados dos últimos 3 meses e forneça feedback comparativo objetivo e construtivo.

CRÍTICO: Entenda que para TMA e TMT, REDUZIR é MELHORAR. Se TMA foi de 5min para 3min, isso é uma MELHORIA (redução do tempo), não uma piora.

Retorne APENAS um objeto JSON válido, sem texto adicional antes ou depois.`;

    // Chamar APIs diretamente seguindo ordem de prioridade: Groq > Gemini > OpenAI
    let responseContent;
    let usedProvider = '';
    
    const groqApiKey = process.env.GROQ_API_KEY?.trim();
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
    
    // Tentar Groq primeiro
    try {
      if (groqApiKey && groqApiKey.length > 10) {
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey: groqApiKey });
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });
        responseContent = completion.choices[0].message.content;
        usedProvider = 'Groq';
        console.log('✅ Feedback gerado com Groq');
      } else {
        throw new Error('Groq não configurado');
      }
    } catch (groqError) {
      console.error('❌ Erro ao gerar com Groq:', groqError.message);
      console.log('🔄 Tentando fallback com Gemini...');
      
      // Fallback para Gemini
      try {
        if (geminiApiKey && geminiApiKey.length > 10) {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const gemini = new GoogleGenerativeAI(geminiApiKey);
          const model = gemini.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          });
          const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`);
          responseContent = await result.response.text();
          usedProvider = 'Gemini';
          console.log('✅ Feedback gerado com Gemini');
        } else {
          throw new Error('Gemini não configurado');
        }
      } catch (geminiError) {
        console.error('❌ Erro ao gerar com Gemini:', geminiError.message);
        console.log('🔄 Tentando fallback com OpenAI...');
        
        // Fallback para OpenAI
        try {
          if (openaiApiKey && openaiApiKey.length > 10) {
            const OpenAI = (await import('openai')).default;
            const openai = new OpenAI({ apiKey: openaiApiKey });
            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
              ],
              temperature: 0.3,
              response_format: { type: 'json_object' },
            });
            responseContent = completion.choices[0].message.content;
            usedProvider = 'OpenAI';
            console.log('✅ Feedback gerado com OpenAI');
          } else {
            throw new Error('OpenAI não configurado');
          }
        } catch (openaiError) {
          console.error('❌ Erro ao gerar com OpenAI:', openaiError.message);
          throw new Error(`Erro ao gerar feedback: Groq (${groqError.message}), Gemini (${geminiError.message}), OpenAI (${openaiError.message})`);
        }
      }
    }
    
    // Parsear resposta JSON
    const feedbackData = JSON.parse(responseContent);
    
    // Formatar feedback
    let feedbackText = `📊 **Análise Comparativa dos Últimos 3 Meses**\n\n`;
    
    if (feedbackData.summary) {
      feedbackText += `${feedbackData.summary}\n\n`;
    }
    
    if (feedbackData.improving) {
      feedbackText += `✅ **Quesitos em Melhoria:**\n${feedbackData.improving}\n\n`;
    }
    
    if (feedbackData.declining) {
      feedbackText += `⚠️ **Quesitos que Precisam de Atenção:**\n${feedbackData.declining}\n\n`;
    }
    
    if (feedbackData.maintained) {
      feedbackText += `➡️ **Quesitos Mantidos:**\n${feedbackData.maintained}\n\n`;
    }
    
    if (feedbackData.recommendations) {
      feedbackText += `🎯 **Recomendações para o Próximo Mês:**\n${feedbackData.recommendations}`;
    }
    
    console.log(`✅ Feedback de 3 meses gerado com ${usedProvider} para ${operatorName}`);
    
    return feedbackText.trim();
  } catch (error) {
    console.error(`❌ Erro ao gerar feedback de 3 meses (método direto):`, error);
    throw error;
  }
};

