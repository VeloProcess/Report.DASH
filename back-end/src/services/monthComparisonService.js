/**
 * Serviço para comparar métricas entre meses
 */

import { getMetricsByEmail, convertMetricsToDashboardFormat } from './metricsService.js';

/**
 * Compara métricas entre meses apenas para os tópicos específicos:
 * - Atendimento (calls + tickets)
 * - Qualidade (nota_qualidade)
 * - Disponibilidade (percent_logado)
 * - Pausas (percent_pausas)
 * - Intervalos (percent_almoco, percent_pausa_10)
 * @param {string} email - Email do operador
 * @param {string} currentMonth - Mês atual (ex: "Dezembro")
 * @returns {Object} Comparação entre meses com status (subindo, caindo, mantendo)
 */
export const compareMonthsForTopics = (email, currentMonth = 'Dezembro') => {
  try {
    console.log(`🔍 compareMonthsForTopics - Email: ${email}, Mês: ${currentMonth}`);
    const meses = ['Outubro', 'Novembro', 'Dezembro'];
    const currentMonthIndex = meses.indexOf(currentMonth);
    
    if (currentMonthIndex === -1) {
      console.log(`⚠️ Mês atual "${currentMonth}" não encontrado na lista de meses`);
      return null;
    }
    
    console.log(`📅 Índice do mês atual: ${currentMonthIndex}`);
    
    // Buscar dados de todos os meses disponíveis
    const monthsData = {};
    for (const mes of meses) {
      console.log(`🔍 Buscando dados para mês: ${mes}`);
      const metrics = getMetricsByEmail(email, mes);
      if (metrics && metrics.dados) {
        console.log(`✅ Dados encontrados para ${mes}`);
        const converted = convertMetricsToDashboardFormat(metrics, mes);
        if (converted) {
          monthsData[mes] = converted;
          console.log(`✅ Dados convertidos para ${mes}`);
        } else {
          console.log(`⚠️ Falha na conversão para ${mes}`);
        }
      } else {
        console.log(`⚠️ Sem dados para ${mes}`);
      }
    }
    
    console.log(`📊 Meses com dados: ${Object.keys(monthsData).join(', ')}`);
    
    if (Object.keys(monthsData).length < 2) {
      console.log(`⚠️ Dados insuficientes para comparação. Meses disponíveis: ${Object.keys(monthsData).join(', ')}`);
      return null;
    }
    
    const currentData = monthsData[currentMonth];
    if (!currentData) {
      console.log(`⚠️ Dados do mês atual "${currentMonth}" não encontrados`);
      return null;
    }
    
    // Obter meses anteriores para comparação
    const previousMonths = meses.slice(0, currentMonthIndex);
    console.log(`📅 Meses anteriores possíveis: ${previousMonths.join(', ')}`);
    const availablePreviousMonths = previousMonths.filter(mes => monthsData[mes]);
    console.log(`📅 Meses anteriores disponíveis: ${availablePreviousMonths.join(', ')}`);
    
    if (availablePreviousMonths.length === 0) {
      console.log(`⚠️ Nenhum mês anterior disponível para comparação`);
      return null;
    }
    
    // Calcular percent_logado se necessário
    const calculatePercentLogado = (data) => {
      if (data.percent_logado !== null && data.percent_logado !== undefined) {
        return parseFloat(data.percent_logado);
      }
      if (data.total_escalado && data.total_logado) {
        const escalado = parseFloat(data.total_escalado) || 0;
        const logado = parseFloat(data.total_logado) || 0;
        if (escalado > 0) {
          return (logado / escalado) * 100;
        }
      }
      return null;
    };
    
    // Calcular percent_pausas se necessário
    const calculatePercentPausas = (data) => {
      if (data.percent_pausas !== null && data.percent_pausas !== undefined) {
        return parseFloat(data.percent_pausas);
      }
      if (data.pausa_escalada && data.total_pausas) {
        const escalada = parseFloat(data.pausa_escalada) || 0;
        const realizada = parseFloat(data.total_pausas) || 0;
        if (escalada > 0) {
          return (realizada / escalada) * 100;
        }
      }
      return null;
    };
    
    // Calcular percent_almoco se necessário
    const calculatePercentAlmoco = (data) => {
      if (data.percent_almoco !== null && data.percent_almoco !== undefined) {
        return parseFloat(data.percent_almoco);
      }
      if (data.almoco_escalado && data.almoco_realizado) {
        const escalado = parseFloat(data.almoco_escalado) || 0;
        const realizado = parseFloat(data.almoco_realizado) || 0;
        if (escalado > 0) {
          return (realizado / escalado) * 100;
        }
      }
      return null;
    };
    
    // Calcular percent_pausa_10 se necessário
    const calculatePercentPausa10 = (data) => {
      if (data.percent_pausa_10 !== null && data.percent_pausa_10 !== undefined) {
        return parseFloat(data.percent_pausa_10);
      }
      if (data.pausa_10_escalada && data.pausa_10_realizado) {
        const escalada = parseFloat(data.pausa_10_escalada) || 0;
        const realizado = parseFloat(data.pausa_10_realizado) || 0;
        if (escalada > 0) {
          return (realizado / escalada) * 100;
        }
      }
      return null;
    };
    
    // Função auxiliar para parsear valores
    const parseValue = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    };
    
    // Calcular valores atuais
    const currentCalls = parseValue(currentData.calls);
    const currentTickets = parseValue(currentData.tickets);
    const currentAtendimento = (currentCalls !== null ? currentCalls : 0) + (currentTickets !== null ? currentTickets : 0);
    const currentQualidade = parseValue(currentData.nota_qualidade);
    const currentDisponibilidade = calculatePercentLogado(currentData);
    const currentPausas = calculatePercentPausas(currentData);
    const currentAlmoco = calculatePercentAlmoco(currentData);
    const currentPausa10 = calculatePercentPausa10(currentData);
    
    console.log('📊 Valores atuais calculados:', {
      currentCalls,
      currentTickets,
      currentAtendimento,
      currentQualidade,
      currentDisponibilidade,
      currentPausas,
      currentAlmoco,
      currentPausa10
    });
    
    // Calcular médias dos meses anteriores
    
    const atendimentoValues = availablePreviousMonths
      .map(mes => {
        const calls = parseValue(monthsData[mes].calls) || 0;
        const tickets = parseValue(monthsData[mes].tickets) || 0;
        return calls + tickets;
      })
      .filter(v => v !== null && v !== undefined && !isNaN(v));
    const previousAtendimento = atendimentoValues.length > 0 
      ? atendimentoValues.reduce((a, b) => a + b, 0) / atendimentoValues.length 
      : null;
    
    const qualidadeValues = availablePreviousMonths
      .map(mes => parseValue(monthsData[mes].nota_qualidade))
      .filter(v => v !== null && v !== undefined && !isNaN(v));
    const previousQualidade = qualidadeValues.length > 0 
      ? qualidadeValues.reduce((a, b) => a + b, 0) / qualidadeValues.length 
      : null;
    
    const disponibilidadeValues = availablePreviousMonths
      .map(mes => calculatePercentLogado(monthsData[mes]))
      .filter(v => v !== null);
    const previousDisponibilidade = disponibilidadeValues.length > 0 
      ? disponibilidadeValues.reduce((a, b) => a + b, 0) / disponibilidadeValues.length 
      : null;
    
    const pausasValues = availablePreviousMonths
      .map(mes => calculatePercentPausas(monthsData[mes]))
      .filter(v => v !== null);
    const previousPausas = pausasValues.length > 0 
      ? pausasValues.reduce((a, b) => a + b, 0) / pausasValues.length 
      : null;
    
    const almocoValues = availablePreviousMonths
      .map(mes => calculatePercentAlmoco(monthsData[mes]))
      .filter(v => v !== null);
    const previousAlmoco = almocoValues.length > 0 
      ? almocoValues.reduce((a, b) => a + b, 0) / almocoValues.length 
      : null;
    
    const pausa10Values = availablePreviousMonths
      .map(mes => calculatePercentPausa10(monthsData[mes]))
      .filter(v => v !== null);
    const previousPausa10 = pausa10Values.length > 0 
      ? pausa10Values.reduce((a, b) => a + b, 0) / pausa10Values.length 
      : null;
    
    // Função para determinar status (subindo, caindo, mantendo)
    const getStatus = (current, previous, higherIsBetter = true) => {
      if (current === null || previous === null || isNaN(current) || isNaN(previous)) {
        return null;
      }
      
      // Se previous é 0, considerar mudança baseada no valor atual
      let percentChange;
      if (previous === 0) {
        if (current === 0) {
          return 'mantendo';
        }
        percentChange = higherIsBetter ? 100 : -100; // Se maior é melhor e current > 0, subindo
      } else {
        percentChange = ((current - previous) / previous) * 100;
      }
      
      // Tolerância de 2% para considerar "mantendo"
      if (Math.abs(percentChange) <= 2) {
        return 'mantendo';
      }
      
      if (higherIsBetter) {
        return percentChange > 0 ? 'subindo' : 'caindo';
      } else {
        return percentChange < 0 ? 'subindo' : 'caindo';
      }
    };
    
    // Comparar cada tópico
    const comparison = {};
    
    console.log('📊 Valores calculados:', {
      currentAtendimento,
      previousAtendimento,
      currentQualidade,
      previousQualidade,
      currentDisponibilidade,
      previousDisponibilidade,
      currentPausas,
      previousPausas,
      currentAlmoco,
      previousAlmoco,
      currentPausa10,
      previousPausa10
    });
    
    // Atendimento (maior é melhor)
    // Aceitar mesmo se for 0, desde que não seja null
    if (currentAtendimento !== null && currentAtendimento !== undefined && 
        previousAtendimento !== null && previousAtendimento !== undefined) {
      // Se previousAtendimento for 0 e currentAtendimento > 0, considerar como aumento de 100%
      let percentChange;
      if (previousAtendimento === 0) {
        percentChange = currentAtendimento > 0 ? 100 : 0;
      } else {
        percentChange = ((currentAtendimento - previousAtendimento) / previousAtendimento) * 100;
      }
      
      comparison.atendimento = {
        current: currentAtendimento,
        previous: previousAtendimento,
        percentChange: percentChange.toFixed(1),
        status: getStatus(currentAtendimento, previousAtendimento, true)
      };
      console.log('✅ Atendimento adicionado:', comparison.atendimento);
    } else {
      console.log('⚠️ Atendimento não adicionado:', { 
        currentAtendimento, 
        previousAtendimento,
        currentCalls,
        currentTickets,
        reason: currentAtendimento === null || currentAtendimento === undefined ? 'currentAtendimento é null/undefined' : 
                previousAtendimento === null || previousAtendimento === undefined ? 'previousAtendimento é null/undefined' : 'outro motivo'
      });
    }
    
    // Qualidade (maior é melhor)
    if (currentQualidade !== null && previousQualidade !== null) {
      const percentChange = ((currentQualidade - previousQualidade) / previousQualidade) * 100;
      comparison.qualidade = {
        current: currentQualidade,
        previous: previousQualidade,
        percentChange: percentChange.toFixed(1),
        status: getStatus(currentQualidade, previousQualidade, true)
      };
    }
    
    // Disponibilidade (maior é melhor)
    if (currentDisponibilidade !== null && previousDisponibilidade !== null) {
      const percentChange = ((currentDisponibilidade - previousDisponibilidade) / previousDisponibilidade) * 100;
      comparison.disponibilidade = {
        current: currentDisponibilidade,
        previous: previousDisponibilidade,
        percentChange: percentChange.toFixed(1),
        status: getStatus(currentDisponibilidade, previousDisponibilidade, true)
      };
    }
    
    // Pausas (menor é melhor - menos pausas é melhor)
    if (currentPausas !== null && previousPausas !== null) {
      const percentChange = ((currentPausas - previousPausas) / previousPausas) * 100;
      comparison.pausas = {
        current: currentPausas,
        previous: previousPausas,
        percentChange: percentChange.toFixed(1),
        status: getStatus(currentPausas, previousPausas, false)
      };
    }
    
    // Intervalos - Almoço (menor é melhor - mais próximo do escalado é melhor)
    if (currentAlmoco !== null && previousAlmoco !== null) {
      const percentChange = ((currentAlmoco - previousAlmoco) / previousAlmoco) * 100;
      comparison.intervalos_almoco = {
        current: currentAlmoco,
        previous: previousAlmoco,
        percentChange: percentChange.toFixed(1),
        status: getStatus(currentAlmoco, previousAlmoco, true) // Mais próximo de 100% é melhor
      };
    }
    
    // Intervalos - Pausa 10 (menor é melhor - mais próximo do escalado é melhor)
    if (currentPausa10 !== null && previousPausa10 !== null) {
      const percentChange = ((currentPausa10 - previousPausa10) / previousPausa10) * 100;
      comparison.intervalos_pausa10 = {
        current: currentPausa10,
        previous: previousPausa10,
        percentChange: percentChange.toFixed(1),
        status: getStatus(currentPausa10, previousPausa10, true) // Mais próximo de 100% é melhor
      };
    }
    
    console.log('📊 Comparação final:', {
      currentMonth,
      previousMonths: availablePreviousMonths,
      comparisonKeys: Object.keys(comparison),
      comparisonLength: Object.keys(comparison).length,
      comparison: comparison
    });
    
    return {
      currentMonth: currentMonth,
      previousMonths: availablePreviousMonths,
      comparison: comparison
    };
  } catch (error) {
    console.error('Erro ao comparar meses:', error);
    return null;
  }
};

/**
 * Compara métricas entre meses e retorna análise de tendência (versão completa - mantida para compatibilidade)
 * @param {string} email - Email do operador
 * @param {string} currentMonth - Mês atual (ex: "Dezembro")
 * @returns {Object} Comparação entre meses com status (melhorou, deixou a desejar, na média)
 */
export const compareMonths = (email, currentMonth = 'Dezembro') => {
  try {
    const meses = ['Outubro', 'Novembro', 'Dezembro'];
    const currentMonthIndex = meses.indexOf(currentMonth);
    
    if (currentMonthIndex === -1) {
      console.log(`⚠️ Mês atual "${currentMonth}" não encontrado na lista de meses`);
      return null;
    }
    
    // Buscar dados de todos os meses disponíveis
    const monthsData = {};
    for (const mes of meses) {
      const metrics = getMetricsByEmail(email, mes);
      if (metrics && metrics.dados) {
        monthsData[mes] = convertMetricsToDashboardFormat(metrics, mes);
      }
    }
    
    if (Object.keys(monthsData).length < 2) {
      console.log(`⚠️ Dados insuficientes para comparação. Meses disponíveis: ${Object.keys(monthsData).join(', ')}`);
      return null;
    }
    
    const currentData = monthsData[currentMonth];
    if (!currentData) {
      console.log(`⚠️ Dados do mês atual "${currentMonth}" não encontrados`);
      return null;
    }
    
    // Obter meses anteriores para comparação
    const previousMonths = meses.slice(0, currentMonthIndex);
    const availablePreviousMonths = previousMonths.filter(mes => monthsData[mes]);
    
    if (availablePreviousMonths.length === 0) {
      console.log(`⚠️ Nenhum mês anterior disponível para comparação`);
      return null;
    }
    
    // Calcular médias dos meses anteriores
    const previousAverage = {};
    const metricsToCompare = [
      'calls', 'tma', 'tickets', 'tmt',
      'nota_qualidade', 'total_logado', 'total_pausas', 
      'pausa_banheiro', 'pausa_feedback', 'absenteeism', 'atrasos'
    ];
    
    for (const metric of metricsToCompare) {
      const values = availablePreviousMonths
        .map(mes => {
          const value = monthsData[mes][metric];
          if (value === null || value === undefined || value === '') return null;
          // Converter tempo para segundos se necessário
          if (metric === 'tma' || metric === 'tmt') {
            return timeToSeconds(value);
          }
          return parseFloat(value) || null;
        })
        .filter(v => v !== null);
      
      if (values.length > 0) {
        previousAverage[metric] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
    
    // Comparar mês atual com média dos meses anteriores
    const comparison = {};
    
    for (const metric of metricsToCompare) {
      const currentValue = currentData[metric];
      const avgValue = previousAverage[metric];
      
      if (currentValue === null || currentValue === undefined || currentValue === '' || avgValue === null || avgValue === undefined) {
        continue;
      }
      
      let currentNum = null;
      if (metric === 'tma' || metric === 'tmt') {
        currentNum = timeToSeconds(currentValue);
      } else {
        currentNum = parseFloat(currentValue);
      }
      
      if (currentNum === null || isNaN(currentNum)) continue;
      
      // Determinar se melhorou, piorou ou está na média
      const higherIsBetter = ['calls', 'tickets', 'quality_score', 'nota_qualidade', 'total_logado'];
      const lowerIsBetter = ['tma', 'tmt', 'total_pausas', 'pausa_banheiro', 'pausa_feedback', 'absenteeism', 'atrasos'];
      
      let status = 'na_media';
      const difference = currentNum - avgValue;
      const percentChange = (difference / avgValue) * 100;
      
      if (higherIsBetter.includes(metric)) {
        if (percentChange > 5) {
          status = 'melhorou';
        } else if (percentChange < -5) {
          status = 'deixou_a_desejar';
        } else {
          status = 'na_media';
        }
      } else if (lowerIsBetter.includes(metric)) {
        if (percentChange < -5) {
          status = 'melhorou';
        } else if (percentChange > 5) {
          status = 'deixou_a_desejar';
        } else {
          status = 'na_media';
        }
      }
      
      comparison[metric] = {
        current: currentValue,
        previousAverage: avgValue,
        difference: difference,
        percentChange: percentChange.toFixed(1),
        status: status,
        monthsCompared: availablePreviousMonths
      };
    }
    
    return {
      currentMonth: currentMonth,
      previousMonths: availablePreviousMonths,
      comparison: comparison,
      summary: generateComparisonSummary(comparison, currentMonth, availablePreviousMonths)
    };
  } catch (error) {
    console.error('Erro ao comparar meses:', error);
    return null;
  }
};

/**
 * Converte tempo HH:MM:SS para segundos
 */
const timeToSeconds = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return null;
  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  const seconds = parseInt(parts[2]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Gera resumo textual da comparação
 */
const generateComparisonSummary = (comparison, currentMonth, previousMonths) => {
  const melhorou = [];
  const deixouADesejar = [];
  const naMedia = [];
  
  const metricNames = {
    calls: 'Ligações',
    tma: 'TMA',
    tickets: 'Tickets',
    tmt: 'TMT',
    quality_score: 'Nota Telefone',
    nota_qualidade: 'Nota Qualidade',
    total_logado: 'Total Logado',
    total_pausas: 'Total de Pausas',
    pausa_banheiro: 'Pausa Banheiro',
    pausa_feedback: 'Pausa Feedback',
    absenteeism: 'Absenteísmo',
    atrasos: 'Atrasos'
  };
  
  for (const [metric, data] of Object.entries(comparison)) {
    const name = metricNames[metric] || metric;
    if (data.status === 'melhorou') {
      melhorou.push(name);
    } else if (data.status === 'deixou_a_desejar') {
      deixouADesejar.push(name);
    } else {
      naMedia.push(name);
    }
  }
  
  let summary = `Comparado com ${previousMonths.join(' e ')}, em ${currentMonth}:\n\n`;
  
  if (melhorou.length > 0) {
    summary += `✅ MELHOROU: ${melhorou.join(', ')}\n`;
  }
  
  if (deixouADesejar.length > 0) {
    summary += `⚠️ DEIXOU A DESEJAR: ${deixouADesejar.join(', ')}\n`;
  }
  
  if (naMedia.length > 0) {
    summary += `➡️ NA MÉDIA: ${naMedia.join(', ')}\n`;
  }
  
  return summary;
};

/**
 * Formata comparação para incluir no prompt da IA
 */
export const formatComparisonForPrompt = (comparisonData) => {
  if (!comparisonData || !comparisonData.comparison) {
    return '';
  }
  
  let formatted = '\n\nCOMPARAÇÃO COM MESES ANTERIORES:\n';
  formatted += `Mês atual: ${comparisonData.currentMonth}\n`;
  formatted += `Comparado com: ${comparisonData.previousMonths.join(', ')}\n\n`;
  
  const metricNames = {
    calls: 'Ligações',
    tma: 'TMA',
    tickets: 'Tickets',
    tmt: 'TMT',
    quality_score: 'Nota Telefone',
    nota_qualidade: 'Nota Qualidade',
    total_logado: 'Total Logado',
    total_pausas: 'Total de Pausas',
    pausa_banheiro: 'Pausa Banheiro',
    pausa_feedback: 'Pausa Feedback',
    absenteeism: 'Absenteísmo',
    atrasos: 'Atrasos'
  };
  
  for (const [metric, data] of Object.entries(comparisonData.comparison)) {
    const name = metricNames[metric] || metric;
    let statusText = '';
    if (data.status === 'melhorou') {
      statusText = 'MELHOROU';
    } else if (data.status === 'deixou_a_desejar') {
      statusText = 'DEIXOU A DESEJAR';
    } else {
      statusText = 'NA MÉDIA';
    }
    
    formatted += `${name}: ${statusText} (${data.percentChange > 0 ? '+' : ''}${data.percentChange}%)\n`;
  }
  
  formatted += '\nIMPORTANTE: Inclua esta comparação no feedback, mencionando se o operador melhorou, está deixando a desejar ou está na média comparado com os meses anteriores.\n';
  
  return formatted;
};
