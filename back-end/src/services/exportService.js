import { getLatestIndicatorByOperatorId, getLatestFeedbackByOperatorId } from '../database.js';
import { generateFeedbackPDF } from './pdfService.js';
import ExcelJS from 'exceljs';
import { getOperatorByEmail } from '../utils/operatorUtils.js';

/**
 * Exporta dados do operador autenticado em formato PDF
 * @param {Object} userData - Dados do usuário autenticado { email, operatorId, operatorName }
 * @returns {Promise<Buffer>} Buffer do PDF
 */
export const exportToPDF = async (userData) => {
  try {
    const operator = getOperatorByEmail(userData.email);
    
    if (!operator) {
      throw new Error('Operador não encontrado');
    }

    const feedback = getLatestFeedbackByOperatorId(userData.operatorId);
    
    if (!feedback) {
      throw new Error('Feedback não encontrado para este operador');
    }

    const pdfBuffer = await generateFeedbackPDF(operator, feedback);
    return pdfBuffer;
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error(`Erro ao exportar PDF: ${error.message}`);
  }
};

/**
 * Exporta dados do operador autenticado em formato CSV
 * @param {Object} userData - Dados do usuário autenticado { email, operatorId, operatorName }
 * @returns {Promise<string>} String CSV
 */
export const exportToCSV = async (userData) => {
  try {
    const operator = getOperatorByEmail(userData.email);
    
    if (!operator) {
      throw new Error('Operador não encontrado');
    }

    const indicators = getLatestIndicatorByOperatorId(userData.operatorId);
    const feedback = getLatestFeedbackByOperatorId(userData.operatorId);

    if (!indicators) {
      throw new Error('Indicadores não encontrados para este operador');
    }

    // Criar linhas CSV
    const rows = [];
    
    // Cabeçalho
    rows.push(['Campo', 'Valor']);
    
    // Dados do operador
    rows.push(['Nome', operator.name]);
    rows.push(['Cargo', operator.position]);
    rows.push(['Equipe', operator.team]);
    rows.push(['Mês de Referência', operator.reference_month]);
    rows.push(['']); // Linha vazia
    
    // Indicadores
    rows.push(['=== INDICADORES ===', '']);
    if (indicators.calls !== null && indicators.calls !== undefined) {
      rows.push(['Ligações', indicators.calls]);
    }
    if (indicators.tma) {
      rows.push(['TMA', indicators.tma]);
    }
    if (indicators.quality_score !== null && indicators.quality_score !== undefined) {
      rows.push(['Pesquisa Telefone', indicators.quality_score]);
    }
    if (indicators.qtd_pesq_telefone) {
      rows.push(['Qtd Pesquisa Telefone', indicators.qtd_pesq_telefone]);
    }
    if (indicators.tickets) {
      rows.push(['Tickets', indicators.tickets]);
    }
    if (indicators.tmt) {
      rows.push(['TMT', indicators.tmt]);
    }
    if (indicators.pesquisa_ticket) {
      rows.push(['Pesquisa Ticket', indicators.pesquisa_ticket]);
    }
    if (indicators.qtd_pesq_ticket) {
      rows.push(['Qtd Pesquisa Ticket', indicators.qtd_pesq_ticket]);
    }
    if (indicators.total_escalado) {
      rows.push(['Total Escalado', indicators.total_escalado]);
    }
    if (indicators.total_logado) {
      rows.push(['Total Logado', indicators.total_logado]);
    }
    if (indicators.percent_logado) {
      rows.push(['% Logado', indicators.percent_logado]);
    }
    if (indicators.pausa_escalada) {
      rows.push(['Pausa Escalada', indicators.pausa_escalada]);
    }
    if (indicators.total_pausas) {
      rows.push(['Total Pausas', indicators.total_pausas]);
    }
    if (indicators.percent_pausas) {
      rows.push(['% Pausas', indicators.percent_pausas]);
    }
    if (indicators.almoco_escalado) {
      rows.push(['Almoço Escalado', indicators.almoco_escalado]);
    }
    if (indicators.almoco_realizado) {
      rows.push(['Almoço Realizado', indicators.almoco_realizado]);
    }
    if (indicators.percent_almoco) {
      rows.push(['% Almoço', indicators.percent_almoco]);
    }
    if (indicators.pausa_10_escalada) {
      rows.push(['Pausa 10 Escalada', indicators.pausa_10_escalada]);
    }
    if (indicators.pausa_10_realizado) {
      rows.push(['Pausa 10 Realizado', indicators.pausa_10_realizado]);
    }
    if (indicators.percent_pausa_10) {
      rows.push(['% Pausa 10', indicators.percent_pausa_10]);
    }
    if (indicators.pausa_banheiro) {
      rows.push(['Pausa Banheiro', indicators.pausa_banheiro]);
    }
    if (indicators.percent_pausa_banheiro) {
      rows.push(['% Pausa Banheiro', indicators.percent_pausa_banheiro]);
    }
    if (indicators.pausa_feedback) {
      rows.push(['Pausa Feedback', indicators.pausa_feedback]);
    }
    if (indicators.percent_pausa_feedback) {
      rows.push(['% Pausa Feedback', indicators.percent_pausa_feedback]);
    }
    if (indicators.treinamento) {
      rows.push(['Treinamento', indicators.treinamento]);
    }
    if (indicators.percent_treinamento) {
      rows.push(['% Treinamento', indicators.percent_treinamento]);
    }

    // Feedback
    if (feedback) {
      rows.push(['']); // Linha vazia
      rows.push(['=== FEEDBACK ===', '']);
      if (feedback.feedback_text) {
        rows.push(['Feedback', feedback.feedback_text.replace(/\n/g, ' ')]);
      }
      if (feedback.positive_points) {
        rows.push(['Pontos Positivos', feedback.positive_points.replace(/\n/g, ' ')]);
      }
      if (feedback.attention_points) {
        rows.push(['Pontos de Atenção', feedback.attention_points.replace(/\n/g, ' ')]);
      }
      if (feedback.recommendations) {
        rows.push(['Recomendações', feedback.recommendations.replace(/\n/g, ' ')]);
      }
    }

    // Converter para CSV
    const csv = rows.map(row => {
      return row.map(cell => {
        const cellStr = String(cell || '');
        // Escapar aspas e envolver em aspas se necessário
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',');
    }).join('\n');

    return csv;
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw new Error(`Erro ao exportar CSV: ${error.message}`);
  }
};

/**
 * Exporta dados do operador autenticado em formato XLSX
 * @param {Object} userData - Dados do usuário autenticado { email, operatorId, operatorName }
 * @returns {Promise<Buffer>} Buffer do arquivo XLSX
 */
export const exportToXLSX = async (userData) => {
  try {
    const operator = getOperatorByEmail(userData.email);
    
    if (!operator) {
      throw new Error('Operador não encontrado');
    }

    const indicators = getLatestIndicatorByOperatorId(userData.operatorId);
    const feedback = getLatestFeedbackByOperatorId(userData.operatorId);

    if (!indicators) {
      throw new Error('Indicadores não encontrados para este operador');
    }

    const workbook = new ExcelJS.Workbook();
    
    // Aba de Indicadores
    const indicatorsSheet = workbook.addWorksheet('Indicadores');
    indicatorsSheet.columns = [
      { header: 'Campo', key: 'field', width: 30 },
      { header: 'Valor', key: 'value', width: 30 },
    ];

    indicatorsSheet.addRow({ field: 'Nome', value: operator.name });
    indicatorsSheet.addRow({ field: 'Cargo', value: operator.position });
    indicatorsSheet.addRow({ field: 'Equipe', value: operator.team });
    indicatorsSheet.addRow({ field: 'Mês de Referência', value: operator.reference_month });
    indicatorsSheet.addRow({ field: '', value: '' });

    // Adicionar indicadores
    const indicatorFields = [
      { key: 'calls', label: 'Ligações' },
      { key: 'tma', label: 'TMA' },
      { key: 'quality_score', label: 'Pesquisa Telefone' },
      { key: 'qtd_pesq_telefone', label: 'Qtd Pesquisa Telefone' },
      { key: 'tickets', label: 'Tickets' },
      { key: 'tmt', label: 'TMT' },
      { key: 'pesquisa_ticket', label: 'Pesquisa Ticket' },
      { key: 'qtd_pesq_ticket', label: 'Qtd Pesquisa Ticket' },
      { key: 'total_escalado', label: 'Total Escalado' },
      { key: 'total_logado', label: 'Total Logado' },
      { key: 'percent_logado', label: '% Logado' },
      { key: 'pausa_escalada', label: 'Pausa Escalada' },
      { key: 'total_pausas', label: 'Total Pausas' },
      { key: 'percent_pausas', label: '% Pausas' },
      { key: 'almoco_escalado', label: 'Almoço Escalado' },
      { key: 'almoco_realizado', label: 'Almoço Realizado' },
      { key: 'percent_almoco', label: '% Almoço' },
      { key: 'pausa_10_escalada', label: 'Pausa 10 Escalada' },
      { key: 'pausa_10_realizado', label: 'Pausa 10 Realizado' },
      { key: 'percent_pausa_10', label: '% Pausa 10' },
      { key: 'pausa_banheiro', label: 'Pausa Banheiro' },
      { key: 'percent_pausa_banheiro', label: '% Pausa Banheiro' },
      { key: 'pausa_feedback', label: 'Pausa Feedback' },
      { key: 'percent_pausa_feedback', label: '% Pausa Feedback' },
      { key: 'treinamento', label: 'Treinamento' },
      { key: 'percent_treinamento', label: '% Treinamento' },
    ];

    indicatorFields.forEach(({ key, label }) => {
      if (indicators[key] !== null && indicators[key] !== undefined) {
        indicatorsSheet.addRow({ field: label, value: indicators[key] });
      }
    });

    // Aba de Feedback (se existir)
    if (feedback) {
      const feedbackSheet = workbook.addWorksheet('Feedback');
      feedbackSheet.columns = [
        { header: 'Campo', key: 'field', width: 30 },
        { header: 'Conteúdo', key: 'content', width: 80 },
      ];

      if (feedback.feedback_text) {
        feedbackSheet.addRow({ field: 'Feedback Geral', content: feedback.feedback_text });
      }
      if (feedback.positive_points) {
        feedbackSheet.addRow({ field: 'Pontos Positivos', content: feedback.positive_points });
      }
      if (feedback.attention_points) {
        feedbackSheet.addRow({ field: 'Pontos de Atenção', content: feedback.attention_points });
      }
      if (feedback.recommendations) {
        feedbackSheet.addRow({ field: 'Recomendações', content: feedback.recommendations });
      }
    }

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Erro ao exportar XLSX:', error);
    throw new Error(`Erro ao exportar XLSX: ${error.message}`);
  }
};

