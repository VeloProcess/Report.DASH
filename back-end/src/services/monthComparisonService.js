/**
 * Serviço para comparar métricas entre meses
 */

import { getMetricsByEmail, convertMetricsToDashboardFormat } from './metricsService.js';

/**
 * Compara métricas entre meses e retorna análise de tendência
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
      'calls', 'tma', 'tickets', 'tmt', 'quality_score', 
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
      // Para métricas onde maior é melhor (calls, tickets, quality_score, nota_qualidade, total_logado)
      // Para métricas onde menor é melhor (tma, tmt, total_pausas, pausa_banheiro, pausa_feedback, absenteeism, atrasos)
      
      const higherIsBetter = ['calls', 'tickets', 'quality_score', 'nota_qualidade', 'total_logado'];
      const lowerIsBetter = ['tma', 'tmt', 'total_pausas', 'pausa_banheiro', 'pausa_feedback', 'absenteeism', 'atrasos'];
      
      let status = 'na_media';
      const difference = currentNum - avgValue;
      const percentChange = (difference / avgValue) * 100;
      
      if (higherIsBetter.includes(metric)) {
        // Para métricas onde maior é melhor
        if (percentChange > 5) {
          status = 'melhorou';
        } else if (percentChange < -5) {
          status = 'deixou_a_desejar';
        } else {
          status = 'na_media';
        }
      } else if (lowerIsBetter.includes(metric)) {
        // Para métricas onde menor é melhor
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

