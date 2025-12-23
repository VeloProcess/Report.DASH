import PDFDocument from 'pdfkit';

// Função auxiliar para escapar texto HTML
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Gerar PDF do feedback usando PDFKit (mais estável no Windows)
export const generateFeedbackPDF = async (operator, feedback) => {
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).font('Helvetica-Bold').text('Feedback Mensal de Performance', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(`Operador: ${operator.name}`, { align: 'center' });
      doc.text(`Cargo: ${operator.position || 'N/A'}`, { align: 'center' });
      doc.text(`Equipe: ${operator.team || 'N/A'}`, { align: 'center' });
      doc.text(`Mês de Referência: ${operator.reference_month || operator.referenceMonth || 'N/A'}`, { align: 'center' });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Resumo Geral
      if (feedback.feedback_text) {
        doc.fontSize(16).font('Helvetica-Bold').text('Resumo Geral');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(feedback.feedback_text.split('\n\n')[0] || feedback.feedback_text, {
          align: 'justify',
        });
        doc.moveDown();
      }

      // Análise Detalhada por Métrica
      if (feedback.metrics_analysis && typeof feedback.metrics_analysis === 'string') {
        doc.fontSize(16).font('Helvetica-Bold').text('Análise Detalhada por Métrica');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        
        const lines = feedback.metrics_analysis.split('\n');
        lines.forEach((line) => {
          if (!line.trim()) {
            doc.moveDown(0.3);
            return;
          }
          
          const upperLine = line.toUpperCase();
          if (upperLine.includes('ATENDIMENTO') || upperLine.includes('QUALIDADE') || 
              upperLine.includes('PRESENÇA') || upperLine.includes('DISPONIBILIDADE') ||
              upperLine.includes('PAUSAS') || upperLine.includes('INTERVALOS') ||
              upperLine.includes('DESENVOLVIMENTO')) {
            doc.fontSize(12).font('Helvetica-Bold').text(line.trim());
            doc.moveDown(0.3);
          } else if (upperLine.includes('MANTER') || upperLine.includes('MELHORAR')) {
            const isMaintain = upperLine.includes('MANTER');
            const cleanLine = line.replace(/MANTER|MELHORAR/gi, '').trim();
            doc.fontSize(11);
            if (isMaintain) {
              doc.fillColor('#27ae60').text(`✓ MANTER: ${cleanLine}`);
            } else {
              doc.fillColor('#e74c3c').text(`⚠ MELHORAR: ${cleanLine}`);
            }
            doc.fillColor('#000000'); // Resetar cor
            doc.moveDown(0.3);
          } else {
            doc.text(line);
            doc.moveDown(0.2);
          }
        });
        doc.moveDown();
      }

      // Pontos Positivos
      if (feedback.positive_points) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#27ae60').text('Pontos Positivos');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(feedback.positive_points, {
          align: 'justify',
        });
        doc.moveDown();
      }

      // Pontos de Atenção
      if (feedback.attention_points) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#e74c3c').text('Pontos de Atenção');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(feedback.attention_points, {
          align: 'justify',
        });
        doc.moveDown();
      }

      // Recomendações
      if (feedback.recommendations) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#3498db').text('Recomendações');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(feedback.recommendations, {
          align: 'justify',
        });
        doc.moveDown();
      }

      // Modelo de Resposta do Operador
      if (feedback.operator_response_model) {
        doc.fontSize(16).font('Helvetica-Bold').text('Modelo de Resposta do Operador');
        doc.moveDown(0.5);
        doc.rect(50, doc.y, 500, doc.heightOfString(feedback.operator_response_model, { width: 500 }) + 20)
          .fillColor('#f8f9fa')
          .fill()
          .fillColor('#000000');
        doc.fontSize(11).font('Helvetica-Oblique').text(feedback.operator_response_model, {
          align: 'justify',
          indent: 10,
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Gera PDF com métricas do operador
 * @param {Object} operator - Dados do operador
 * @param {Object} indicators - Métricas/indicadores do operador
 * @param {string} month - Mês de referência (opcional)
 * @returns {Promise<Buffer>} Buffer do PDF
 */
export const generateMetricsPDF = async (operator, indicators, month = null) => {
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).font('Helvetica-Bold').text('Relatório de Métricas Mensais', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(`Operador: ${operator.name}`, { align: 'center' });
      doc.text(`Cargo: ${operator.position || 'N/A'}`, { align: 'center' });
      doc.text(`Equipe: ${operator.team || 'N/A'}`, { align: 'center' });
      doc.text(`Período: ${month || operator.reference_month || 'N/A'}`, { align: 'center' });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Função auxiliar para adicionar métrica
      const addMetric = (label, value, section = null) => {
        if (value === null || value === undefined || value === '') return;
        
        if (section) {
          doc.fontSize(14).font('Helvetica-Bold').text(section);
          doc.moveDown(0.3);
        }
        
        doc.fontSize(11).font('Helvetica');
        doc.text(`${label}: ${value}`, { indent: 20 });
        doc.moveDown(0.3);
      };

      // Seção: Atendimento
      if (indicators.calls || indicators.tma || indicators.tickets || indicators.tmt) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#3498db').text('ATENDIMENTO');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        addMetric('Ligações Realizadas', indicators.calls);
        addMetric('TMA (Tempo Médio de Atendimento)', indicators.tma);
        addMetric('Tickets Atendidos', indicators.tickets);
        addMetric('TMT (Tempo Médio de Tratamento)', indicators.tmt);
        doc.moveDown();
      }

      // Seção: Qualidade
      if (indicators.quality_score || indicators.qtd_pesq_telefone || indicators.pesquisa_ticket || indicators.qtd_pesq_ticket) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#27ae60').text('QUALIDADE');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        addMetric('Pesquisa Telefone', indicators.quality_score);
        addMetric('Qtd Pesquisa Telefone', indicators.qtd_pesq_telefone);
        addMetric('Pesquisa Ticket', indicators.pesquisa_ticket);
        addMetric('Qtd Pesquisa Ticket', indicators.qtd_pesq_ticket);
        addMetric('Nota Qualidade', indicators.nota_qualidade);
        addMetric('Qtd Avaliações', indicators.qtd_avaliacoes);
        doc.moveDown();
      }

      // Seção: Disponibilidade e Pausas
      if (indicators.total_escalado || indicators.total_logado || indicators.percent_logado || 
          indicators.pausa_escalada || indicators.total_pausas) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#e74c3c').text('DISPONIBILIDADE E PAUSAS');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        addMetric('Total Escalado', indicators.total_escalado);
        addMetric('Total Logado', indicators.total_logado);
        addMetric('Total Cumprido', indicators.total_cumprido);
        addMetric('% Logado', indicators.percent_logado);
        addMetric('Absenteísmo', indicators.absenteeism);
        addMetric('Atrasos', indicators.atrasos);
        addMetric('Pausa Escalada', indicators.pausa_escalada);
        addMetric('Total Pausas', indicators.total_pausas);
        addMetric('% Pausas', indicators.percent_pausas);
        doc.moveDown();
      }

      // Seção: Intervalos
      if (indicators.almoco_escalado || indicators.almoco_realizado || indicators.pausa_10_escalada) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#f39c12').text('INTERVALOS');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        addMetric('Almoço Escalado', indicators.almoco_escalado);
        addMetric('Almoço Realizado', indicators.almoco_realizado);
        addMetric('% Almoço', indicators.percent_almoco);
        addMetric('Pausa 10 Escalada', indicators.pausa_10_escalada);
        addMetric('Pausa 10 Realizado', indicators.pausa_10_realizado);
        addMetric('% Pausa 10', indicators.percent_pausa_10);
        addMetric('Pausa Banheiro', indicators.pausa_banheiro);
        addMetric('% Pausa Banheiro', indicators.percent_pausa_banheiro);
        addMetric('Pausa Feedback', indicators.pausa_feedback);
        addMetric('% Pausa Feedback', indicators.percent_pausa_feedback);
        doc.moveDown();
      }

      // Seção: Desenvolvimento
      if (indicators.treinamento || indicators.percent_treinamento) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#9b59b6').text('DESENVOLVIMENTO');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        addMetric('Treinamento', indicators.treinamento);
        addMetric('% Treinamento', indicators.percent_treinamento);
        doc.moveDown();
      }

      // Rodapé
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      doc.fontSize(10).font('Helvetica-Oblique').fillColor('#7f8c8d')
        .text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
      doc.fillColor('#000000');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};