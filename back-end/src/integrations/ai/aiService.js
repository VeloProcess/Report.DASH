import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Groq (Principal)
let groqApiKey = process.env.GROQ_API_KEY;
if (groqApiKey) {
  groqApiKey = groqApiKey.trim().replace(/\s+/g, '').replace(/['"]/g, '');
  console.log('🔑 Chave do Groq processada. Tamanho:', groqApiKey.length, 'caracteres');
  console.log('🔑 Primeiros caracteres:', groqApiKey.substring(0, 10) + '...');
} else {
  console.error('❌ GROQ_API_KEY não configurada');
}

const groq = groqApiKey ? new Groq({
  apiKey: groqApiKey,
}) : null;

// Configurar Gemini (Fallback)
let geminiApiKey = process.env.GEMINI_API_KEY;
if (geminiApiKey) {
  geminiApiKey = geminiApiKey.trim().replace(/\s+/g, '').replace(/['"]/g, '');
  console.log('🔑 Chave do Gemini processada. Tamanho:', geminiApiKey.length, 'caracteres');
  console.log('🔑 Primeiros caracteres:', geminiApiKey.substring(0, 10) + '...');
} else {
  console.error('❌ GEMINI_API_KEY não configurada');
}

const gemini = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

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

// Função principal com fallback
export const generateFeedback = async (operatorData, indicators) => {
  try {
    // Validar se pelo menos uma API está configurada
    if (!groqApiKey && !geminiApiKey) {
      throw new Error('Nenhuma API de IA configurada. Configure GROQ_API_KEY ou GEMINI_API_KEY no Render.');
    }

    // Preparar todas as métricas disponíveis
    const metrics = [];

    // Métricas principais
    if (indicators.calls !== null && indicators.calls !== undefined) {
      metrics.push(`Ligações realizadas: ${indicators.calls}`);
    }
    if (indicators.tma) {
      metrics.push(`TMA (Tempo Médio de Atendimento): ${indicators.tma}`);
    }
    if (indicators.quality_score !== null && indicators.quality_score !== undefined) {
      metrics.push(`Pesquisa Telefone: ${indicators.quality_score}`);
    } else if (indicators.qualityScore !== null && indicators.qualityScore !== undefined) {
      metrics.push(`Pesquisa Telefone: ${indicators.qualityScore}`);
    }
    if (indicators.absenteeism !== null && indicators.absenteeism !== undefined) {
      metrics.push(`ABS (Absenteísmo): ${indicators.absenteeism}`);
    }

    // Métricas adicionais - verificar se vem de additionalData ou diretamente do banco
    const add = indicators.additionalData || indicators;

    if (add.qtd_pesq_telefone || add.qtdPesqTelefone) metrics.push(`Qtd Pesquisa Telefone: ${add.qtd_pesq_telefone || add.qtdPesqTelefone}`);
    if (add.tickets) metrics.push(`# Tickets: ${add.tickets}`);
    if (add.tmt) metrics.push(`TMT: ${add.tmt}`);
    if (add.pesquisa_ticket || add.pesquisaTicket) metrics.push(`Pesquisa Ticket: ${add.pesquisa_ticket || add.pesquisaTicket}`);
    if (add.qtd_pesq_ticket || add.qtdPesqTicket) metrics.push(`Qtd Pesquisa Ticket: ${add.qtd_pesq_ticket || add.qtdPesqTicket}`);
    if (add.nota_qualidade || add.notaQualidade) metrics.push(`Nota Qualidade: ${add.nota_qualidade || add.notaQualidade}`);
    if (add.qtd_avaliacoes || add.qtdAvaliacoes) metrics.push(`Qtd Avaliações: ${add.qtd_avaliacoes || add.qtdAvaliacoes}`);
    if (add.total_escalado || add.totalEscalado) metrics.push(`Total Escalado: ${add.total_escalado || add.totalEscalado}`);
    if (add.total_logado || add.totalLogado) metrics.push(`Total Logado: ${add.total_logado || add.totalLogado}`);
    if (add.percent_logado || add.percentLogado) metrics.push(`% Logado: ${add.percent_logado || add.percentLogado}`);
    if (add.atrasos) metrics.push(`Atrasos: ${add.atrasos}`);
    if (add.pausa_escalada || add.pausaEscalada) metrics.push(`Pausa Escalada: ${add.pausa_escalada || add.pausaEscalada}`);
    if (add.total_pausas !== null && add.total_pausas !== undefined && add.total_pausas !== '') metrics.push(`Total de Pausas: ${add.total_pausas}`);
    else if (add.totalPausas !== null && add.totalPausas !== undefined && add.totalPausas !== '') metrics.push(`Total de Pausas: ${add.totalPausas}`);
    if (add.percent_pausas || add.percentPausas) metrics.push(`% Pausas: ${add.percent_pausas || add.percentPausas}`);
    if (add.almoco_escalado || add.almocoEscalado) metrics.push(`Almoço Escalado: ${add.almoco_escalado || add.almocoEscalado}`);
    if (add.almoco_realizado || add.almocoRealizado) metrics.push(`Almoço Realizado: ${add.almoco_realizado || add.almocoRealizado}`);
    if (add.percent_almoco || add.percentAlmoco) metrics.push(`% Almoço: ${add.percent_almoco || add.percentAlmoco}`);
    if (add.pausa10_escalada || add.pausa10Escalada) metrics.push(`Pausa 10 Escalada: ${add.pausa10_escalada || add.pausa10Escalada}`);
    if (add.pausa10_realizado || add.pausa10Realizado) metrics.push(`Pausa 10 Realizado: ${add.pausa10_realizado || add.pausa10Realizado}`);
    if (add.percent_pausa10 || add.percentPausa10) metrics.push(`% Pausa 10: ${add.percent_pausa10 || add.percentPausa10}`);
    if (add.pausa_banheiro || add.pausaBanheiro) metrics.push(`Pausa Banheiro: ${add.pausa_banheiro || add.pausaBanheiro}`);
    if (add.percent_pausa_banheiro || add.percentPausaBanheiro) metrics.push(`% Pausa Banheiro: ${add.percent_pausa_banheiro || add.percentPausaBanheiro}`);
    if (add.pausa_feedback || add.pausaFeedback) metrics.push(`Pausa Feedback: ${add.pausa_feedback || add.pausaFeedback}`);
    if (add.percent_pausa_feedback || add.percentPausaFeedback) metrics.push(`% Pausa Feedback: ${add.percent_pausa_feedback || add.percentPausaFeedback}`);
    if (add.treinamento) metrics.push(`Treinamento: ${add.treinamento}`);
    if (add.percent_treinamento || add.percentTreinamento) metrics.push(`% Treinamento: ${add.percent_treinamento || add.percentTreinamento}`);

    const metricsText = metrics.length > 0 ? metrics.join('\n') : 'Nenhuma métrica disponível';

    // Criar mapa de métricas (nome -> valor) para busca rápida
    const metricsValueMap = {};
    metrics.forEach(m => {
      const match = m.match(/^(.+?):\s*(.+)$/);
      if (match) {
        const metricName = match[1].trim().toLowerCase();
        const metricValue = match[2].trim();
        metricsValueMap[metricName] = metricValue;
      }
    });

    const timeMetrics = metrics.filter(m => m.includes('TMA') || m.includes('TMT') || m.includes('Total') || m.includes('Pausa') || m.includes('Almoço') || m.includes('Treinamento')).length;
    console.log(`📊 Total de métricas: ${metrics.length}, Métricas de tempo: ${timeMetrics}`);
    console.log(`📋 Mapa de valores criado com ${Object.keys(metricsValueMap).length} entradas`);

    const prompt = `Você é um analista de performance e qualidade. Gere um feedback mensal CONCISO e DETALHADO para um operador de atendimento.

⚠️ ATENÇÃO CRÍTICA: Você DEVE analisar TODAS as ${metrics.length} métricas listadas abaixo, SEM EXCEÇÃO. Não pule nenhuma métrica, especialmente as de TEMPO (formato hh:mm:ss ou hh:mm:ss).

OPERADOR:
- Nome: ${operatorData.name}
- Cargo: ${operatorData.position}
- Equipe: ${operatorData.team}
- Mês de referência: ${operatorData.reference_month || operatorData.referenceMonth}

MÉTRICAS DISPONÍVEIS (você DEVE analisar TODAS - TOTAL: ${metrics.length} métricas):
${metricsText}

⚠️ ATENÇÃO ESPECIAL PARA MÉTRICAS DE TEMPO:
- Métricas com formato de TEMPO (ex: "00:04:58", "118:00:00", "12:00:00") DEVEM ser incluídas na análise
- Preserve EXATAMENTE o formato do tempo como aparece acima (hh:mm:ss ou hh:mm:ss)
- NÃO converta tempo para números ou outros formatos
- Exemplos de métricas de TEMPO que DEVEM aparecer: TMA, TMT, Total Escalado, Total Logado, Pausa Escalada, Total de Pausas, Almoço Escalado, Almoço Realizado, Pausa 10 Escalada, Pausa 10 Realizado, Pausa Banheiro, Pausa Feedback, Treinamento

=== INSTRUÇÕES CRÍTICAS - SIGA EXATAMENTE ===

1. RESUMO GERAL: Gere um resumo conciso com visão geral do desempenho.

2. ANÁLISE DE MÉTRICAS - FORMATO OBRIGATÓRIO:
   Para CADA métrica listada acima, você DEVE seguir EXATAMENTE este formato (sem exceções):

   [NOME COMPLETO DA MÉTRICA]
   Valor: [VALOR EXATO COMO APARECE NAS MÉTRICAS DISPONÍVEIS - COPIE O VALOR EXATO]
   Status: MANTER
   
   Análise: [3-5 linhas explicando o que significa, por que está bom, impacto e contexto]

   OU

   [NOME COMPLETO DA MÉTRICA]
   Valor: [VALOR EXATO COMO APARECE NAS MÉTRICAS DISPONÍVEIS - COPIE O VALOR EXATO]
   Status: MELHORAR
   
   Análise: [3-5 linhas explicando o que significa, por que precisa melhorar, impacto, contexto e sugestões práticas]

3. ORGANIZAÇÃO OBRIGATÓRIA:
   Organize as métricas em seções com títulos em MAIÚSCULAS seguidos de quebra de linha:
   
   ATENDIMENTO
   
   [Aqui você coloca TODAS as análises das métricas de atendimento: Ligações realizadas, TMA, TMT, # Tickets - cada uma no formato acima]
   
   QUALIDADE
   
   [Aqui você coloca TODAS as análises das métricas de qualidade: Pesquisa Telefone, Qtd Pesquisa Telefone, Pesquisa Ticket, Qtd Pesquisa Ticket, Nota Qualidade, Qtd Avaliações - cada uma no formato acima]
   
   PRESENÇA E DISPONIBILIDADE
   
   [Aqui você coloca TODAS as análises: Total Escalado, Total Logado, % Logado, ABS, Atrasos - cada uma no formato acima]
   
   PAUSAS E INTERVALOS
   
   [Aqui você coloca TODAS as análises de pausas: Pausa Escalada, Total de Pausas, % Pausas, Almoço Escalado, Almoço Realizado, % Almoço, Pausa 10 Escalada, Pausa 10 Realizado, % Pausa 10, Pausa Banheiro, % Pausa Banheiro, Pausa Feedback, % Pausa Feedback - cada uma no formato acima]
   
   DESENVOLVIMENTO
   
   [Aqui você coloca TODAS as análises: Treinamento, % Treinamento - cada uma no formato acima]

4. VALIDAÇÃO CRÍTICA - VERIFIQUE ANTES DE ENVIAR:
   ✓ TODAS as ${metrics.length} métricas listadas acima foram analisadas? (VERIFIQUE CADA UMA)
   ✓ Métricas de TEMPO (TMA, TMT, Total Escalado, Total Logado, Pausa Escalada, Total de Pausas, Almoço Escalado, Almoço Realizado, Pausa 10 Escalada, Pausa 10 Realizado, Pausa Banheiro, Pausa Feedback, Treinamento) foram incluídas?
   ✓ Cada métrica tem seu valor exato copiado das "MÉTRICAS DISPONÍVEIS" (preserve formato de tempo como "00:04:58" ou "118:00:00")?
   ✓ Cada métrica tem Status: MANTER ou Status: MELHORAR?
   ✓ Cada métrica tem Análise: com 3-5 linhas?
   ✓ As seções estão organizadas com títulos em MAIÚSCULAS?
   
   IMPORTANTE: Se uma métrica tem valor de TEMPO (formato hh:mm:ss), você DEVE incluir essa métrica na análise. Não pule métricas de tempo!

5. OUTRAS SEÇÕES:
   - Pontos Positivos: resumo dos principais pontos positivos
   - Pontos de Atenção: resumo dos principais pontos que precisam de atenção
   - Recomendações: recomendações práticas e acionáveis
   - Modelo de Resposta: texto curto e profissional que o operador pode usar

Formate a resposta em JSON:
{
  "summary": "resumo geral conciso",
  "metricsAnalysis": "análise DETALHADA seguindo EXATAMENTE o formato acima para CADA métrica listada, organizada por seções com títulos em MAIÚSCULAS. NÃO pule nenhuma métrica. Cada métrica DEVE ter: nome, Valor: [valor exato], Status: MANTER ou MELHORAR, e Análise: [3-5 linhas]",
  "positivePoints": "pontos positivos resumidos",
  "attentionPoints": "pontos de atenção resumidos",
  "recommendations": "recomendações práticas e acionáveis",
  "operatorResponseModel": "modelo de resposta profissional e curto do operador"
}`;

    const systemPrompt = 'Você é um analista de performance profissional especializado em feedback construtivo para operadores de atendimento. Siga EXATAMENTE o formato e as regras especificadas no prompt do usuário.';

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

    // Converter metricsAnalysis de objeto para string se necessário
    let metricsAnalysisText = '';

    if (typeof feedbackData.metricsAnalysis === 'string') {
      metricsAnalysisText = feedbackData.metricsAnalysis;
    } else if (typeof feedbackData.metricsAnalysis === 'object' && feedbackData.metricsAnalysis !== null) {
      console.log('⚠️ metricsAnalysis veio como objeto, convertendo para string...');

      const sections = feedbackData.metricsAnalysis;
      const formattedSections = [];

      for (const [sectionName, metricsInSection] of Object.entries(sections)) {
        formattedSections.push(sectionName);
        formattedSections.push('');

        for (const [metricName, metricData] of Object.entries(metricsInSection)) {
          let valor = 'N/A';
          const metricNameLower = metricName.toLowerCase();

          const metricNameClean = metricNameLower
            .replace(/\(tempo médio de atendimento\)/gi, '')
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .trim();

          if (metricsValueMap[metricNameClean]) {
            valor = metricsValueMap[metricNameClean];
          } else {
            for (const [mapKey, mapValue] of Object.entries(metricsValueMap)) {
              const mapKeyClean = mapKey.replace(/\(.*?\)/g, '').trim();
              const nameClean = metricNameClean.replace(/\(.*?\)/g, '').trim();

              if (mapKeyClean.includes(nameClean) || nameClean.includes(mapKeyClean)) {
                valor = mapValue;
                break;
              }

              const mapWords = mapKeyClean.split(/\s+/).filter(w => w.length > 2);
              const nameWords = nameClean.split(/\s+/).filter(w => w.length > 2);

              const commonWords = mapWords.filter(mw => nameWords.some(nw => mw === nw || mw.includes(nw) || nw.includes(mw)));
              if (commonWords.length >= 2 || (commonWords.length === 1 && commonWords[0].length > 4)) {
                valor = mapValue;
                break;
              }
            }
          }

          if (valor === 'N/A') {
            if (metricData.Valor !== undefined && metricData.Valor !== null && metricData.Valor !== '') {
              valor = String(metricData.Valor);
            } else if (metricData.valor !== undefined && metricData.valor !== null && metricData.valor !== '') {
              valor = String(metricData.valor);
            } else if (metricData.value !== undefined && metricData.value !== null && metricData.value !== '') {
              valor = String(metricData.value);
            }
          }

          const status = metricData.Status || metricData.status || 'N/A';
          let analise = 'Análise não disponível';
          if (metricData.Análise) {
            analise = metricData.Análise;
          } else if (metricData.analise) {
            analise = metricData.analise;
          }

          formattedSections.push(metricName);
          formattedSections.push(`Valor: ${valor}`);
          formattedSections.push(`Status: ${status}`);
          formattedSections.push('');
          formattedSections.push(`Análise: ${analise}`);
          formattedSections.push('');
        }
      }

      metricsAnalysisText = formattedSections.join('\n');
    } else {
      console.error('⚠️ ATENÇÃO: Campo metricsAnalysis está vazio ou em formato inválido!');
      throw new Error('A IA não gerou a análise detalhada de métricas no formato esperado. Por favor, tente novamente.');
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
