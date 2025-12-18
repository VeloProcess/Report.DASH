import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar mapeamento de nomes para emails
const loadEmailMapping = () => {
  // Tentar múltiplos caminhos possíveis
  const possiblePaths = [
    path.join(__dirname, '../controllers/send_email.JSON'),
    path.join(process.cwd(), 'src/controllers/send_email.JSON'),
    path.join(process.cwd(), 'back-end/src/controllers/send_email.JSON'),
    path.join(__dirname, '../../src/controllers/send_email.JSON'),
  ];

  for (const emailMappingPath of possiblePaths) {
    try {
      console.log(`📁 Tentando carregar arquivo de emails de: ${emailMappingPath}`);
      
      if (fs.existsSync(emailMappingPath)) {
        const emailMappingContent = fs.readFileSync(emailMappingPath, 'utf-8');
        const parsed = JSON.parse(emailMappingContent);
        console.log(`✅ Arquivo de emails carregado com sucesso de: ${emailMappingPath}`);
        console.log(`✅ ${Object.keys(parsed).length} nomes encontrados.`);
        return parsed;
      } else {
        console.log(`⚠️ Arquivo não encontrado em: ${emailMappingPath}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao tentar carregar de ${emailMappingPath}:`, error.message);
    }
  }

  console.error('❌ Arquivo send_email.JSON não encontrado em nenhum dos caminhos tentados.');
  console.error('📂 Diretório atual (process.cwd()):', process.cwd());
  console.error('📂 Diretório do módulo (__dirname):', __dirname);
  
  // Tentar carregar de variável de ambiente como fallback
  if (process.env.OPERATOR_NAMES_JSON) {
    try {
      console.log('📧 Tentando carregar nomes de variável de ambiente OPERATOR_NAMES_JSON');
      const parsed = JSON.parse(process.env.OPERATOR_NAMES_JSON);
      console.log(`✅ Nomes carregados da variável de ambiente. ${Object.keys(parsed).length} nomes encontrados.`);
      return parsed;
    } catch (error) {
      console.error('❌ Erro ao parsear OPERATOR_NAMES_JSON:', error.message);
    }
  }
  
  return {};
};

// Configurar transporter de email
const createTransporter = () => {
  // Configuração do SMTP (ajuste conforme necessário)
  // Exemplo para Gmail com App Password
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Buscar email do operador pelo nome
export const getOperatorEmail = (operatorName) => {
  const emailMapping = loadEmailMapping();
  
  // Tentar encontrar exato primeiro
  if (emailMapping[operatorName]) {
    return emailMapping[operatorName];
  }
  
  // Tentar encontrar case-insensitive
  const normalizedName = operatorName.toLowerCase().trim();
  for (const [name, email] of Object.entries(emailMapping)) {
    if (name.toLowerCase().trim() === normalizedName) {
      return email;
    }
  }
  
  return null;
};

// Formatar métricas para exibição no email
const formatMetricsForEmail = (indicators) => {
  if (!indicators) return '<p>Métricas não disponíveis.</p>';

  let html = '<div style="margin: 20px 0;"><h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Suas Métricas do Mês</h3>';
  html += '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">';
  
  // Métricas principais
  if (indicators.calls !== null && indicators.calls !== undefined) {
    html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Ligações Realizadas:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.calls}</td></tr>`;
  }
  if (indicators.tma) {
    html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>TMA (Tempo Médio de Atendimento):</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.tma}</td></tr>`;
  }
  if (indicators.quality_score !== null && indicators.quality_score !== undefined) {
    html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pesquisa Telefone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.quality_score}</td></tr>`;
  }
  if (indicators.absenteeism !== null && indicators.absenteeism !== undefined) {
    html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>ABS (Absenteísmo):</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.absenteeism}</td></tr>`;
  }
  
  // Métricas adicionais
  if (indicators.qtd_pesq_telefone) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Qtd Pesquisa Telefone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.qtd_pesq_telefone}</td></tr>`;
  if (indicators.tickets) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong># Tickets:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.tickets}</td></tr>`;
  if (indicators.tmt) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>TMT:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.tmt}</td></tr>`;
  if (indicators.pesquisa_ticket) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pesquisa Ticket:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.pesquisa_ticket}</td></tr>`;
  if (indicators.qtd_pesq_ticket) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Qtd Pesquisa Ticket:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.qtd_pesq_ticket}</td></tr>`;
  if (indicators.nota_qualidade) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Nota Qualidade:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.nota_qualidade}</td></tr>`;
  if (indicators.qtd_avaliacoes) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Qtd Avaliações:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.qtd_avaliacoes}</td></tr>`;
  if (indicators.total_escalado) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Escalado:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.total_escalado}</td></tr>`;
  if (indicators.total_logado) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Logado:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.total_logado}</td></tr>`;
  if (indicators.percent_logado) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>% Logado:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.percent_logado}</td></tr>`;
  if (indicators.atrasos) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Atrasos:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.atrasos}</td></tr>`;
  if (indicators.pausa_escalada) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pausa Escalada:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.pausa_escalada}</td></tr>`;
  if (indicators.total_pausas) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total de Pausas:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.total_pausas}</td></tr>`;
  if (indicators.percent_pausas) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>% Pausas:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.percent_pausas}</td></tr>`;
  if (indicators.almoco_escalado) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Almoço Escalado:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.almoco_escalado}</td></tr>`;
  if (indicators.almoco_realizado) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Almoço Realizado:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.almoco_realizado}</td></tr>`;
  if (indicators.percent_almoco) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>% Almoço:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.percent_almoco}</td></tr>`;
  if (indicators.pausa_10_escalada) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pausa 10 Escalada:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.pausa_10_escalada}</td></tr>`;
  if (indicators.pausa_10_realizado) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pausa 10 Realizado:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.pausa_10_realizado}</td></tr>`;
  if (indicators.percent_pausa_10) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>% Pausa 10:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.percent_pausa_10}</td></tr>`;
  if (indicators.pausa_banheiro) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pausa Banheiro:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.pausa_banheiro}</td></tr>`;
  if (indicators.percent_pausa_banheiro) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>% Pausa Banheiro:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.percent_pausa_banheiro}</td></tr>`;
  if (indicators.pausa_feedback) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Pausa Feedback:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.pausa_feedback}</td></tr>`;
  if (indicators.percent_pausa_feedback) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>% Pausa Feedback:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.percent_pausa_feedback}</td></tr>`;
  if (indicators.treinamento) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Treinamento:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${indicators.treinamento}</td></tr>`;
  if (indicators.percent_treinamento) html += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>% Treinamento:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${indicators.percent_treinamento}</td></tr>`;
  
  html += '</table></div>';
  return html;
};

// Enviar feedback por email com PDF e métricas
export const sendFeedbackEmail = async (operator, feedback, pdfBuffer, indicators = null) => {
  try {
    const emailMapping = loadEmailMapping();
    const operatorEmail = getOperatorEmail(operator.name);
    
    if (!operatorEmail) {
      throw new Error(`Email não encontrado para o operador: ${operator.name}`);
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Configurações de SMTP não encontradas no .env. Configure SMTP_USER e SMTP_PASS.');
    }

    const transporter = createTransporter();
    
    // Formatar métricas para o email
    const metricsHtml = formatMetricsForEmail(indicators);

    const mailOptions = {
      from: `"Sistema de Feedback" <${process.env.SMTP_USER}>`,
      to: operatorEmail,
      subject: `Feedback Mensal - ${operator.reference_month || operator.referenceMonth}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Feedback Mensal de Performance</h2>
          <p>Olá <strong>${operator.name}</strong>,</p>
          <p>Segue em anexo seu feedback mensal referente ao mês de <strong>${operator.reference_month || operator.referenceMonth}</strong>.</p>
          
          ${metricsHtml}
          
          <p style="margin-top: 20px;">Por favor, revise o documento em anexo e entre em contato caso tenha dúvidas.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Este é um email automático do Sistema de Feedback Mensal.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Feedback_${operator.name.replace(/\s+/g, '_')}_${(operator.reference_month || operator.referenceMonth).replace(/\//g, '-')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      email: operatorEmail,
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }
};

// Listar todos os nomes disponíveis no mapeamento
export const getAvailableOperatorNames = () => {
  try {
    const emailMapping = loadEmailMapping();
    const names = Object.keys(emailMapping).sort();
    console.log(`📧 Carregados ${names.length} nomes do arquivo send_email.JSON`);
    return names;
  } catch (error) {
    console.error('Erro ao carregar nomes disponíveis:', error);
    return [];
  }
};

