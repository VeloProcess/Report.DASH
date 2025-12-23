import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getIndicators } from '../../database.js';

dotenv.config();

// Configurar Groq (Principal)
let groqApiKey = process.env.GROQ_API_KEY;
console.log('🔍 DEBUG: Verificando GROQ_API_KEY...');
console.log('🔍 DEBUG: Tipo:', typeof groqApiKey);
console.log('🔍 DEBUG: Valor raw:', groqApiKey ? groqApiKey.substring(0, 20) + '...' : 'undefined/null');

if (groqApiKey) {
  groqApiKey = groqApiKey.trim().replace(/\s+/g, '').replace(/['"]/g, '');
  if (groqApiKey && groqApiKey.length > 10) {
    console.log('✅ Chave do Groq processada. Tamanho:', groqApiKey.length, 'caracteres');
    console.log('✅ Primeiros caracteres:', groqApiKey.substring(0, 10) + '...');
  } else {
    console.error('❌ GROQ_API_KEY está vazia ou inválida após processamento');
    groqApiKey = null;
  }
} else {
  console.error('❌ GROQ_API_KEY não configurada no .env');
  console.error('💡 Dica: Verifique se o arquivo .env está na pasta back-end/');
  console.error('💡 Dica: Verifique se a linha GROQ_API_KEY=... está no arquivo');
}

const groq = groqApiKey && groqApiKey.length > 10 ? new Groq({
  apiKey: groqApiKey,
}) : null;

// Configurar Gemini (Fallback)
let geminiApiKey = process.env.GEMINI_API_KEY;
console.log('🔍 DEBUG: Verificando GEMINI_API_KEY...');
console.log('🔍 DEBUG: Tipo:', typeof geminiApiKey);
console.log('🔍 DEBUG: Valor raw:', geminiApiKey ? geminiApiKey.substring(0, 20) + '...' : 'undefined/null');

if (geminiApiKey) {
  geminiApiKey = geminiApiKey.trim().replace(/\s+/g, '').replace(/['"]/g, '');
  if (geminiApiKey && geminiApiKey.length > 10) {
    console.log('✅ Chave do Gemini processada. Tamanho:', geminiApiKey.length, 'caracteres');
    console.log('✅ Primeiros caracteres:', geminiApiKey.substring(0, 10) + '...');
  } else {
    console.error('❌ GEMINI_API_KEY está vazia ou inválida após processamento');
    geminiApiKey = null;
  }
} else {
  console.error('❌ GEMINI_API_KEY não configurada no .env');
  console.error('💡 Dica: Verifique se o arquivo .env está na pasta back-end/');
  console.error('💡 Dica: Verifique se a linha GEMINI_API_KEY=... está no arquivo');
}

const gemini = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Função para converter tempo hh:mm:ss para segundos
const timeToSeconds = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return null;
  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  const seconds = parseInt(parts[2]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

// Função para converter segundos para hh:mm:ss
const secondsToTime = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Função para calcular médias de todos os operadores
const calculateAverages = () => {
  try {
    const allIndicators = getIndicators();
    
    if (!allIndicators || allIndicators.length === 0) {
      console.log('⚠️ Nenhum indicador encontrado para calcular médias');
      return null;
    }
    
    // Pegar apenas os indicadores mais recentes de cada operador
    const latestIndicators = {};
    allIndicators.forEach(ind => {
      if (!ind || !ind.operator_id) return;
      const opId = ind.operator_id;
      if (!latestIndicators[opId] || new Date(ind.created_at || 0) > new Date(latestIndicators[opId].created_at || 0)) {
        latestIndicators[opId] = ind;
      }
    });

    const indicatorsArray = Object.values(latestIndicators);
    if (indicatorsArray.length === 0) {
      console.log('⚠️ Nenhum indicador válido encontrado após filtrar');
      return null;
    }

  const averages = {
    tma: null,
    calls: null,
    tickets: null,
    tmt: null,
  };

  // Calcular média de TMA (em segundos)
  const tmaValues = [];
  indicatorsArray.forEach(ind => {
    const add = ind.additionalData || ind;
    const tma = add.tma || ind.tma;
    if (tma) {
      const seconds = timeToSeconds(tma);
      if (seconds !== null) tmaValues.push(seconds);
    }
  });
  if (tmaValues.length > 0) {
    const avgSeconds = tmaValues.reduce((a, b) => a + b, 0) / tmaValues.length;
    averages.tma = secondsToTime(Math.round(avgSeconds));
  }

  // Calcular média de chamadas
  const callsValues = [];
  indicatorsArray.forEach(ind => {
    const calls = ind.calls;
    if (calls !== null && calls !== undefined && !isNaN(calls)) {
      callsValues.push(parseInt(calls));
    }
  });
  if (callsValues.length > 0) {
    averages.calls = Math.round(callsValues.reduce((a, b) => a + b, 0) / callsValues.length);
  }

  // Calcular média de tickets
  const ticketsValues = [];
  indicatorsArray.forEach(ind => {
    const add = ind.additionalData || ind;
    const tickets = add.tickets || add.tickets;
    if (tickets !== null && tickets !== undefined && !isNaN(tickets)) {
      ticketsValues.push(parseInt(tickets));
    }
  });
  if (ticketsValues.length > 0) {
    averages.tickets = Math.round(ticketsValues.reduce((a, b) => a + b, 0) / ticketsValues.length);
  }

  // Calcular média de TMT (em segundos)
  const tmtValues = [];
  indicatorsArray.forEach(ind => {
    const add = ind.additionalData || ind;
    const tmt = add.tmt || ind.tmt;
    if (tmt && tmt !== '-' && tmt !== 'Em breve') {
      const seconds = timeToSeconds(tmt);
      if (seconds !== null) tmtValues.push(seconds);
    }
  });
  if (tmtValues.length > 0) {
    const avgSeconds = tmtValues.reduce((a, b) => a + b, 0) / tmtValues.length;
    averages.tmt = secondsToTime(Math.round(avgSeconds));
  }

  console.log('✅ Médias calculadas com sucesso:', averages);
  return averages;
  } catch (error) {
    console.error('❌ Erro ao calcular médias:', error);
    console.error('Stack:', error.stack);
    return null;
  }
};

// Função para gerar feedback usando Groq (Principal)
const generateWithGroq = async (prompt, systemPrompt) => {
  if (!groq || !groqApiKey) {
    throw new Error('Groq não configurado');
  }

  console.log('🤖 Tentando gerar feedback com Groq...');
  
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return completion.choices[0].message.content;
};

// Função para gerar feedback usando Gemini (Fallback)
const generateWithGemini = async (prompt, systemPrompt) => {
  if (!gemini || !geminiApiKey) {
    throw new Error('Gemini não configurado');
  }

  console.log('🤖 Tentando gerar feedback com Gemini (fallback)...');
  
  const model = gemini.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const fullPrompt = `${systemPrompt}\n\n${prompt}`;
  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  
  return response.text();
};

// Função para formatar array de métricas em texto
const formatMetricsArray = (metricsArray) => {
  const sections = {
    CHAMADAS: [],
    TICKETS: [],
    PAUSAS: []
  };

  metricsArray.forEach(metric => {
    const metricName = (metric.metric || metric.name || '').toUpperCase();
    
    if (metricName.includes('LIGAÇÃO') || metricName.includes('TMA') || metricName.includes('TMT')) {
      sections.CHAMADAS.push(metric);
    } else if (metricName.includes('TICKET')) {
      sections.TICKETS.push(metric);
    } else {
      sections.PAUSAS.push(metric);
    }
  });

  let formatted = '';
  
  if (sections.CHAMADAS.length > 0) {
    formatted += 'CHAMADAS\n\n';
    sections.CHAMADAS.forEach(metric => {
      formatted += `${metric.metric || metric.name}\n`;
      formatted += `Valor: ${metric.value || 'N/A'}\n`;
      if (metric.average !== null && metric.average !== undefined) formatted += `Média: ${metric.average}\n`;
      formatted += `Status: ${metric.status || metric.Status || 'N/A'}\n`;
      formatted += `Análise: ${metric.analysis || metric.analise || 'N/A'}\n\n`;
    });
  }

  if (sections.TICKETS.length > 0) {
    formatted += 'TICKETS\n\n';
    sections.TICKETS.forEach(metric => {
      formatted += `${metric.metric || metric.name}\n`;
      formatted += `Valor: ${metric.value || 'N/A'}\n`;
      if (metric.average !== null && metric.average !== undefined) formatted += `Média: ${metric.average}\n`;
      formatted += `Status: ${metric.status || metric.Status || 'N/A'}\n`;
      formatted += `Análise: ${metric.analysis || metric.analise || 'N/A'}\n\n`;
    });
  }

  if (sections.PAUSAS.length > 0) {
    formatted += 'PAUSAS\n\n';
    sections.PAUSAS.forEach(metric => {
      formatted += `${metric.metric || metric.name}\n`;
      formatted += `Valor: ${metric.value || 'N/A'}\n`;
      if (metric.average !== null && metric.average !== undefined) formatted += `Média: ${metric.average}\n`;
      formatted += `Status: ${metric.status || metric.Status || 'N/A'}\n`;
      formatted += `Análise: ${metric.analysis || metric.analise || 'N/A'}\n\n`;
    });
  }

  return formatted.trim();
};

// Função para formatar objeto de métricas em texto
const formatMetricsObject = (metricsObj) => {
  let formatted = '';
  
  for (const [section, metrics] of Object.entries(metricsObj)) {
    formatted += `${section.toUpperCase()}\n\n`;
    
    if (Array.isArray(metrics)) {
      metrics.forEach(metric => {
        formatted += `${metric.metric || metric.name || ''}\n`;
        formatted += `Valor: ${metric.value || 'N/A'}\n`;
        if (metric.average !== null && metric.average !== undefined) formatted += `Média: ${metric.average}\n`;
        formatted += `Status: ${metric.status || metric.Status || 'N/A'}\n`;
        formatted += `Análise: ${metric.analysis || metric.analise || 'N/A'}\n\n`;
      });
    } else if (typeof metrics === 'object') {
      for (const [metricName, metricData] of Object.entries(metrics)) {
        formatted += `${metricName}\n`;
        formatted += `Valor: ${metricData.value || metricData.Valor || 'N/A'}\n`;
        if (metricData.average !== null && metricData.average !== undefined) formatted += `Média: ${metricData.average}\n`;
        formatted += `Status: ${metricData.status || metricData.Status || 'N/A'}\n`;
        formatted += `Análise: ${metricData.analysis || metricData.analise || metricData.Análise || 'N/A'}\n\n`;
      }
    }
  }
  
  return formatted.trim();
};

// Função principal com fallback
export const generateFeedback = async (operatorData, indicators, monthComparison = null) => {
  try {
    // Validar se pelo menos uma API está configurada
    console.log('🔍 DEBUG: Verificando APIs antes de gerar feedback...');
    console.log('🔍 DEBUG: groqApiKey existe?', !!groqApiKey);
    console.log('🔍 DEBUG: geminiApiKey existe?', !!geminiApiKey);
    
    if (!groqApiKey && !geminiApiKey) {
      console.error('❌ Nenhuma API configurada!');
      console.error('💡 Verifique o arquivo back-end/.env');
      console.error('💡 Certifique-se de que as linhas GROQ_API_KEY=... e/ou GEMINI_API_KEY=... estão presentes');
      throw new Error('Nenhuma API de IA configurada. Configure GROQ_API_KEY ou GEMINI_API_KEY no arquivo .env (pasta back-end/).');
    }

    // Calcular médias de todos os operadores
    const averages = calculateAverages();
    console.log('📊 Médias calculadas:', averages);

    // Extrair métricas do operador atual
    const add = indicators.additionalData || indicators;
    
    const operatorMetrics = {
      calls: indicators.calls || null,
      tma: indicators.tma || add.tma || null,
      tickets: add.tickets || null,
      tmt: add.tmt || null,
      percentLogado: add.percent_logado || add.percentLogado || null,
      pausaEscalada: add.pausa_escalada || add.pausaEscalada || null,
      totalPausas: add.total_pausas || add.totalPausas || null,
      almocoEscalado: add.almoco_escalado || add.almocoEscalado || null,
      almocoRealizado: add.almoco_realizado || add.almocoRealizado || null,
      pausa10Escalada: add.pausa10_escalada || add.pausa10Escalada || null,
      pausa10Realizado: add.pausa10_realizado || add.pausa10Realizado || null,
      pausaBanheiro: add.pausa_banheiro || add.pausaBanheiro || null,
      pausaFeedback: add.pausa_feedback || add.pausaFeedback || null,
    };

    // Preparar informações de comparação
    let comparisonInfo = '';
    
    if (averages) {
      comparisonInfo = '\n\nMÉDIAS DA EQUIPE (para comparação):\n';
      if (averages.tma) comparisonInfo += `- TMA médio: ${averages.tma}\n`;
      if (averages.calls) comparisonInfo += `- Chamadas médias: ${averages.calls}\n`;
      if (averages.tickets) comparisonInfo += `- Tickets médios: ${averages.tickets}\n`;
      if (averages.tmt) comparisonInfo += `- TMT médio: ${averages.tmt}\n`;
    }
    
    // Adicionar comparação entre meses se disponível
    let monthComparisonText = '';
    if (monthComparison && monthComparison.summary) {
      monthComparisonText = `\n\n${monthComparison.summary}\n`;
      monthComparisonText += '\nIMPORTANTE: Inclua esta comparação mensal no feedback, mencionando se o operador melhorou, está deixando a desejar ou está na média comparado com os meses anteriores.\n';
    }

    const prompt = `Feedback ${operatorData.name} - ${operatorData.reference_month || operatorData.referenceMonth}

Métricas:
${operatorMetrics.calls !== null ? `Ligações: ${operatorMetrics.calls}` : ''}
${operatorMetrics.tma ? `TMA: ${operatorMetrics.tma}` : ''}
${operatorMetrics.tickets !== null ? `Tickets: ${operatorMetrics.tickets}` : ''}
${operatorMetrics.tmt ? `TMT: ${operatorMetrics.tmt}` : ''}
${operatorMetrics.percentLogado ? `% Logado: ${operatorMetrics.percentLogado}` : ''}
${operatorMetrics.pausaEscalada ? `Pausa Escalada: ${operatorMetrics.pausaEscalada}` : ''}
${operatorMetrics.totalPausas ? `Total Pausas: ${operatorMetrics.totalPausas}` : ''}
${operatorMetrics.almocoEscalado ? `Almoço Escalado: ${operatorMetrics.almocoEscalado}` : ''}
${operatorMetrics.almocoRealizado ? `Almoço Realizado: ${operatorMetrics.almocoRealizado}` : ''}
${operatorMetrics.pausa10Escalada ? `Pausa 10 Escalada: ${operatorMetrics.pausa10Escalada}` : ''}
${operatorMetrics.pausa10Realizado ? `Pausa 10 Realizado: ${operatorMetrics.pausa10Realizado}` : ''}
${operatorMetrics.pausaBanheiro ? `Pausa Banheiro: ${operatorMetrics.pausaBanheiro}` : ''}
${operatorMetrics.pausaFeedback ? `Pausa Feedback: ${operatorMetrics.pausaFeedback}` : ''}
${comparisonInfo}
${monthComparisonText}

3 tópicos:

CHAMADAS
- Ligações: acima média = MANTER, abaixo = MELHORAR
- TMA: abaixo média = MANTER, acima = MELHORAR
- TMT: abaixo média = MANTER, acima = MELHORAR

TICKETS
- Tickets: acima média = MANTER, abaixo = MELHORAR

PAUSAS
- % Logado: 100% = MANTER, < 100% = MELHORAR, > 100% = MANTER
- Pausas: realizado > escalado = MELHORAR, realizado <= escalado = MANTER

Formato simples: nome métrica, valor, média, status (MANTER/MELHORAR), análise curta.

IMPORTANTE: O campo "metricsAnalysis" deve ser TEXTO FORMATADO, NÃO JSON. Formato:

CHAMADAS

Ligações realizadas
Valor: [valor]
Média: [média]
Status: MANTER
Análise: [análise curta]

TMA
Valor: [valor]
Média: [média]
Status: MANTER ou MELHORAR
Análise: [análise curta]

TMT
Valor: [valor]
Média: [média]
Status: MANTER ou MELHORAR
Análise: [análise curta]

TICKETS

Tickets
Valor: [valor]
Média: [média]
Status: MANTER ou MELHORAR
Análise: [análise curta]

PAUSAS

% Logado
Valor: [valor]
Status: MANTER ou MELHORAR
Análise: [análise curta]

[Para cada pausa: nome, valor realizado vs escalado, status, análise]

JSON:
{
  "summary": "resumo breve",
  "metricsAnalysis": "TEXTO FORMATADO conforme exemplo acima, NÃO JSON",
  "positivePoints": "pontos positivos",
  "attentionPoints": "pontos de atenção",
  "recommendations": "recomendações",
  "operatorResponseModel": "resposta do operador"
}`;

    const systemPrompt = `Você é um analista de performance. Gere feedback direto e objetivo em 3 tópicos: CHAMADAS, TICKETS e PAUSAS. Seja conciso, sem detalhamento excessivo.

${monthComparison ? 'IMPORTANTE: Inclua comparação com meses anteriores no feedback. Mencione se o operador melhorou, está deixando a desejar ou está na média comparado com os meses anteriores.' : ''}`;

    let responseContent;
    let usedProvider = '';

    // Tentar Groq primeiro (Principal)
    try {
      if (groqApiKey) {
        responseContent = await generateWithGroq(prompt, systemPrompt);
        usedProvider = 'Groq';
        console.log('✅ Feedback gerado com sucesso usando Groq');
      } else {
        throw new Error('Groq não configurado');
      }
    } catch (groqError) {
      console.error('❌ Erro ao gerar com Groq:', groqError.message);
      console.log('🔄 Tentando fallback com Gemini...');
      
      // Fallback para Gemini
      try {
        if (geminiApiKey) {
          responseContent = await generateWithGemini(prompt, systemPrompt);
          usedProvider = 'Gemini';
          console.log('✅ Feedback gerado com sucesso usando Gemini (fallback)');
        } else {
          throw new Error('Gemini não configurado');
        }
      } catch (geminiError) {
        console.error('❌ Erro ao gerar com Gemini:', geminiError.message);
        throw new Error(`Erro ao gerar feedback: Groq falhou (${groqError.message}) e Gemini falhou (${geminiError.message})`);
      }
    }

    console.log(`🤖 Provedor usado: ${usedProvider}`);
    console.log('=== DEBUG: Resposta da IA ===');
    console.log('Resposta completa:', responseContent);

    let feedbackData;
    try {
      feedbackData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.error('Conteúdo recebido:', responseContent);
      throw new Error(`Erro ao processar resposta da IA: ${parseError.message}`);
    }

    // Validar campos obrigatórios
    if (!feedbackData.summary) {
      console.error('Campo summary não encontrado na resposta:', feedbackData);
      throw new Error('Resposta da IA não contém o campo "summary"');
    }

    // Converter metricsAnalysis de objeto/JSON para string formatada
    let metricsAnalysisText = '';

    try {
      if (typeof feedbackData.metricsAnalysis === 'string') {
        // Tentar parsear se for JSON string
        try {
          const parsed = JSON.parse(feedbackData.metricsAnalysis);
          if (Array.isArray(parsed)) {
            console.log('📋 metricsAnalysis é array JSON, formatando...');
            metricsAnalysisText = formatMetricsArray(parsed);
          } else {
            console.log('📋 metricsAnalysis é string, usando como está');
            metricsAnalysisText = feedbackData.metricsAnalysis;
          }
        } catch (parseError) {
          // Não é JSON, usar como está
          console.log('📋 metricsAnalysis não é JSON válido, usando como texto');
          metricsAnalysisText = feedbackData.metricsAnalysis;
        }
      } else if (Array.isArray(feedbackData.metricsAnalysis)) {
        console.log('📋 metricsAnalysis é array direto, formatando...');
        metricsAnalysisText = formatMetricsArray(feedbackData.metricsAnalysis);
      } else if (typeof feedbackData.metricsAnalysis === 'object' && feedbackData.metricsAnalysis !== null) {
        console.log('⚠️ metricsAnalysis veio como objeto, convertendo para string...');
        metricsAnalysisText = formatMetricsObject(feedbackData.metricsAnalysis);
      } else {
        console.error('⚠️ ATENÇÃO: Campo metricsAnalysis está vazio ou em formato inválido!');
        console.error('Tipo recebido:', typeof feedbackData.metricsAnalysis);
        console.error('Valor recebido:', feedbackData.metricsAnalysis);
        throw new Error('A IA não gerou a análise detalhada de métricas no formato esperado. Por favor, tente novamente.');
      }
    } catch (formatError) {
      console.error('❌ Erro ao formatar metricsAnalysis:', formatError);
      console.error('Stack:', formatError.stack);
      // Tentar usar o valor original como fallback
      if (feedbackData.metricsAnalysis) {
        metricsAnalysisText = String(feedbackData.metricsAnalysis);
        console.log('⚠️ Usando valor original como fallback');
      } else {
        throw new Error(`Erro ao processar análise de métricas: ${formatError.message}`);
      }
    }

    if (!metricsAnalysisText || metricsAnalysisText.trim() === '') {
      console.error('⚠️ ATENÇÃO: Campo metricsAnalysis está vazio após conversão!');
      throw new Error('A IA não gerou a análise detalhada de métricas. Por favor, tente novamente.');
    }

    console.log('✅ metricsAnalysis gerado com sucesso. Tamanho:', metricsAnalysisText.length, 'caracteres');
    console.log('Preview metricsAnalysis:', metricsAnalysisText.substring(0, 300));

    return {
      summary: feedbackData.summary || '',
      feedbackText: `${feedbackData.summary}\n\nANÁLISE DETALHADA POR MÉTRICA:\n${metricsAnalysisText}\n\nPONTOS POSITIVOS:\n${feedbackData.positivePoints || 'Não informado'}\n\nPONTOS DE ATENÇÃO:\n${feedbackData.attentionPoints || 'Não informado'}\n\nRECOMENDAÇÕES:\n${feedbackData.recommendations || 'Não informado'}`,
      positivePoints: feedbackData.positivePoints || '',
      attentionPoints: feedbackData.attentionPoints || '',
      recommendations: feedbackData.recommendations || '',
      operatorResponseModel: feedbackData.operatorResponseModel || '',
      metricsAnalysis: metricsAnalysisText,
      provider: usedProvider,
    };
  } catch (error) {
    console.error('❌ Erro ao gerar feedback:', error);
    console.error('Stack:', error.stack);

    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      throw new Error('Chave da API inválida ou não configurada. Verifique GROQ_API_KEY e GEMINI_API_KEY no Render.');
    } else if (error.message?.includes('rate limit')) {
      throw new Error('Limite de requisições atingido. Tente novamente em alguns instantes.');
    } else if (error.message?.includes('quota') || error.message?.includes('insufficient')) {
      throw new Error('Cota da API esgotada. Verifique seus créditos.');
    } else {
      throw new Error(`Erro ao gerar feedback: ${error.message || 'Erro desconhecido'}`);
    }
  }
};
