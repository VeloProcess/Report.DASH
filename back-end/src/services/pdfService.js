import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores da Velotax
const COLORS = {
  blue1: '#1694ff',
  blue2: '#1634ff',
  blueDark: '#000058',
  white: '#ffffff',
  black: '#000000',
};

// Caminhos dos logos
const getLogoPath = (logoName) => {
  const possiblePaths = [
    path.join(__dirname, '../../assets', logoName),
    path.join(process.cwd(), 'assets', logoName),
    path.join(process.cwd(), 'back-end', 'assets', logoName),
  ];
  
  for (const logoPath of possiblePaths) {
    if (fs.existsSync(logoPath)) {
      return logoPath;
    }
  }
  return null;
};

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
 * @param {Object} managerFeedback - Feedback do gestor (opcional)
 * @returns {Promise<Buffer>} Buffer do PDF
 */
export const generateMetricsPDF = async (operator, indicators, month = null, managerFeedback = null) => {
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 100, bottom: 100, left: 50, right: 50 },
      });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Logo Natalino no Cabeçalho
      const logoNatalinoPath = getLogoPath('logo-natalino.png');
      if (logoNatalinoPath) {
        try {
          const logoHeight = 40;
          const logoWidth = 150;
          const x = (doc.page.width - logoWidth) / 2;
          doc.image(logoNatalinoPath, x, 20, { width: logoWidth, height: logoHeight });
          doc.y = 70;
        } catch (error) {
          console.log('⚠️ Erro ao carregar logo natalino:', error.message);
        }
      }

      // Cabeçalho com cores azuis
      doc.fontSize(20).font('Helvetica-Bold').fillColor(COLORS.blue1).text('Relatório de Métricas Mensais', { align: 'center' });
      doc.fillColor(COLORS.black);
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').fillColor(COLORS.blue2).text(`Operador: ${operator.name}`, { align: 'center' });
      doc.fillColor(COLORS.black);
      doc.text(`Cargo: ${operator.position || 'N/A'}`, { align: 'center' });
      doc.text(`Equipe: ${operator.team || 'N/A'}`, { align: 'center' });
      doc.fillColor(COLORS.blue1).text(`Período: ${month || operator.reference_month || 'N/A'}`, { align: 'center' });
      doc.fillColor(COLORS.black);
      doc.moveDown();
      
      // Linha decorativa azul
      doc.strokeColor(COLORS.blue1).lineWidth(2);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.strokeColor(COLORS.black).lineWidth(1);
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
        doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.blue1).text('ATENDIMENTO');
        doc.fillColor(COLORS.black);
        doc.moveDown(0.5);
        
        addMetric('Ligações Realizadas', indicators.calls);
        addMetric('TMA (Tempo Médio de Atendimento)', indicators.tma);
        addMetric('Tickets Atendidos', indicators.tickets);
        addMetric('TMT (Tempo Médio de Tratamento)', indicators.tmt);
        doc.moveDown();
      }

      // Seção: Qualidade
      if (indicators.quality_score || indicators.qtd_pesq_telefone || indicators.pesquisa_ticket || indicators.qtd_pesq_ticket) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.blue2).text('QUALIDADE');
        doc.fillColor(COLORS.black);
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
        doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.blue1).text('DISPONIBILIDADE E PAUSAS');
        doc.fillColor(COLORS.black);
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
        doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.blue2).text('INTERVALOS');
        doc.fillColor(COLORS.black);
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
        doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.blueDark).text('DESENVOLVIMENTO');
        doc.fillColor(COLORS.black);
        doc.moveDown(0.5);
        
        addMetric('Treinamento', indicators.treinamento);
        addMetric('% Treinamento', indicators.percent_treinamento);
        doc.moveDown();
      }

      // Seção: Feedback do Gestor
      if (managerFeedback && managerFeedback.feedback_text) {
        doc.moveDown();
        doc.fontSize(16).font('Helvetica-Bold').fillColor(COLORS.blue1).text('FEEDBACK DO GESTOR');
        doc.fillColor(COLORS.black);
        doc.moveDown(0.5);
        
        // Data e gestor
        const feedbackDate = managerFeedback.created_at 
          ? new Date(managerFeedback.created_at).toLocaleDateString('pt-BR')
          : new Date().toLocaleDateString('pt-BR');
        doc.fontSize(10).font('Helvetica-Oblique').fillColor(COLORS.blue2);
        doc.text(`Por: ${managerFeedback.manager_name || 'Gestor'} | ${feedbackDate}`, { indent: 20 });
        doc.fillColor(COLORS.black);
        doc.moveDown(0.3);
        
        // Texto do feedback
        doc.fontSize(11).font('Helvetica');
        const feedbackLines = doc.heightOfString(managerFeedback.feedback_text, {
          width: doc.page.width - 100,
          indent: 20
        });
        
        // Verificar se precisa de nova página
        if (doc.y + feedbackLines > doc.page.height - 100) {
          doc.addPage();
        }
        
        doc.text(managerFeedback.feedback_text, {
          indent: 20,
          align: 'left',
          width: doc.page.width - 100
        });
        doc.moveDown();
      }

      // Rodapé
      doc.moveDown();
      
      // Linha decorativa azul
      doc.strokeColor(COLORS.blue1).lineWidth(2);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.strokeColor(COLORS.black).lineWidth(1);
      doc.moveDown();
      
      // Logo Básico no Rodapé
      const logoBasicoPath = getLogoPath('logo-basico.png');
      if (logoBasicoPath) {
        try {
          const logoHeight = 30;
          const logoWidth = 120;
          const x = (doc.page.width - logoWidth) / 2;
          const y = doc.page.height - 80;
          doc.image(logoBasicoPath, x, y, { width: logoWidth, height: logoHeight });
          doc.y = y + logoHeight + 10;
        } catch (error) {
          console.log('⚠️ Erro ao carregar logo básico:', error.message);
        }
      }
      
      doc.fontSize(10).font('Helvetica-Oblique').fillColor(COLORS.blue2)
        .text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
      doc.fillColor(COLORS.black);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};