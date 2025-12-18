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
