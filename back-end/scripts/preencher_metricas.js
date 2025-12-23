/**
 * Script para preencher métricas no Metrics.json
 * 
 * Uso:
 *   node scripts/preencher_metricas.js
 * 
 * O script espera dados no formato:
 *   nome_operador|mes|campo1:valor1|campo2:valor2|...
 * 
 * Exemplo:
 *   "Gabriel Araujo|Novembro|ligacoes:150|tma:00:05:30|nota_telefone:4.8"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const metricsFile = path.join(__dirname, '../data/Metrics.json');
const sendEmailFile = path.join(__dirname, '../src/controllers/send_email.JSON');

/**
 * Carrega o arquivo Metrics.json
 */
const loadMetrics = () => {
  try {
    if (!fs.existsSync(metricsFile)) {
      throw new Error('Arquivo Metrics.json não encontrado');
    }
    const content = fs.readFileSync(metricsFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Erro ao carregar Metrics.json:', error);
    throw error;
  }
};

/**
 * Carrega o mapeamento de emails
 */
const loadEmailMapping = () => {
  try {
    if (!fs.existsSync(sendEmailFile)) {
      throw new Error('Arquivo send_email.JSON não encontrado');
    }
    const content = fs.readFileSync(sendEmailFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Erro ao carregar send_email.JSON:', error);
    return {};
  }
};

/**
 * Encontra o email do operador pelo nome
 */
const findEmailByName = (nome, emailMapping) => {
  const normalizedNome = nome.toLowerCase().trim();
  
  for (const [name, email] of Object.entries(emailMapping)) {
    if (name.toLowerCase().trim() === normalizedNome) {
      return email.toLowerCase().trim();
    }
  }
  
  return null;
};

/**
 * Converte string de dados para objeto estruturado
 * Formato: "campo1:valor1|campo2:valor2|..."
 */
const parseDataString = (dataString) => {
  const dados = {
    chamadas: {},
    tickets: {},
    qualidade: {},
    pausas_tempo_logado: {}
  };
  
  const pairs = dataString.split('|');
  
  for (const pair of pairs) {
    const [campo, valor] = pair.split(':').map(s => s.trim());
    if (!campo || valor === undefined) continue;
    
    // Mapear campos para estrutura correta
    switch (campo.toLowerCase()) {
      // Chamadas
      case 'ligacoes':
      case 'ligações':
      case 'calls':
        dados.chamadas.ligacoes = parseInt(valor) || 0;
        break;
      case 'tma':
        dados.chamadas.tma = valor;
        break;
      case 'nota_telefone':
      case 'nota telefone':
      case 'quality_score':
        dados.chamadas.nota_telefone = parseFloat(valor) || 0;
        break;
      case 'quantidade_notas':
      case 'quantidade notas':
      case 'qtd_pesq_telefone':
        dados.chamadas.quantidade_notas = parseInt(valor) || 0;
        break;
      
      // Tickets
      case 'tickets':
      case 'quantidade_tickets':
      case 'quantidade tickets':
        dados.tickets.quantidade = parseInt(valor) || 0;
        break;
      case 'tmt':
        dados.tickets.tmt = valor;
        break;
      case 'nota_ticket':
      case 'nota ticket':
      case 'pesquisa_ticket':
        dados.tickets.nota_ticket = parseFloat(valor) || 0;
        break;
      case 'quantidade_notas_ticket':
      case 'qtd_pesq_ticket':
        dados.tickets.quantidade_notas = parseInt(valor) || 0;
        break;
      
      // Qualidade
      case 'nota_qualidade':
      case 'nota qualidade':
      case 'nota':
        dados.qualidade.nota = parseFloat(valor) || 0;
        break;
      case 'quantidade_avaliacoes':
      case 'quantidade avaliações':
      case 'qtd_avaliacoes':
        dados.qualidade.quantidade = parseInt(valor) || 0;
        break;
      
      // Pausas e Tempo Logado
      case 'total_escalado':
        dados.pausas_tempo_logado.total_escalado = valor;
        break;
      case 'total_cumprido':
      case 'total_logado':
        dados.pausas_tempo_logado.total_cumprido = valor;
        break;
      case 'abs':
      case 'absenteismo':
      case 'absenteeism':
        dados.pausas_tempo_logado.abs = parseFloat(valor) || 0;
        break;
      case 'atrasos':
        dados.pausas_tempo_logado.atrasos = parseInt(valor) || 0;
        break;
      case 'pausa_escalada':
        dados.pausas_tempo_logado.pausa_escalada = valor;
        break;
      case 'pausa_realizada':
        dados.pausas_tempo_logado.pausa_realizada = valor;
        break;
      case 'pausa_almoco_escalada':
        dados.pausas_tempo_logado.pausa_almoco_escalada = valor;
        break;
      case 'pausa_almoco_realizada':
        dados.pausas_tempo_logado.pausa_almoco_realizada = valor;
        break;
      case 'pausa_10_escalada':
        dados.pausas_tempo_logado.pausa_10_escalada = valor;
        break;
      case 'pausa_10_realizada':
        dados.pausas_tempo_logado.pausa_10_realizada = valor;
        break;
      case 'pausa_banheiro':
        dados.pausas_tempo_logado.pausa_banheiro = valor;
        break;
      case 'pausa_feedback':
        dados.pausas_tempo_logado.pausa_feedback = valor;
        break;
      case 'pausa_treinamento':
      case 'treinamento':
        dados.pausas_tempo_logado.pausa_treinamento = valor;
        break;
    }
  }
  
  return dados;
};

/**
 * Preenche métricas de um operador
 */
const fillMetrics = (nome, mes, dadosString) => {
  try {
    const metrics = loadMetrics();
    const emailMapping = loadEmailMapping();
    
    // Encontrar email do operador
    const email = findEmailByName(nome, emailMapping);
    if (!email) {
      console.error(`❌ Operador não encontrado: ${nome}`);
      return false;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Verificar se operador existe no Metrics.json
    if (!metrics[normalizedEmail] || !metrics[normalizedEmail].login) {
      console.error(`❌ Operador não encontrado no Metrics.json: ${nome} (${email})`);
      return false;
    }
    
    // Validar mês
    const mesesValidos = ['Outubro', 'Novembro', 'Dezembro'];
    if (!mesesValidos.includes(mes)) {
      console.error(`❌ Mês inválido: ${mes}. Use: Outubro, Novembro ou Dezembro`);
      return false;
    }
    
    // Parse dos dados
    const dados = parseDataString(dadosString);
    
    // Atualizar métricas
    if (!metrics[normalizedEmail].login.meses) {
      metrics[normalizedEmail].login.meses = {
        Outubro: { dados: {} },
        Novembro: { dados: {} },
        Dezembro: { dados: {} }
      };
    }
    
    // Mesclar dados existentes com novos dados
    const existingData = metrics[normalizedEmail].login.meses[mes].dados || {};
    metrics[normalizedEmail].login.meses[mes].dados = {
      chamadas: { ...createEmptyChamadas(), ...existingData.chamadas, ...dados.chamadas },
      tickets: { ...createEmptyTickets(), ...existingData.tickets, ...dados.tickets },
      qualidade: { ...createEmptyQualidade(), ...existingData.qualidade, ...dados.qualidade },
      pausas_tempo_logado: { ...createEmptyPausas(), ...existingData.pausas_tempo_logado, ...dados.pausas_tempo_logado }
    };
    
    // Atualizar timestamp
    metrics[normalizedEmail].login.metricas_atualizadas_em = new Date().toLocaleString('pt-BR');
    
    // Salvar arquivo
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2), 'utf-8');
    
    console.log(`✅ Métricas atualizadas: ${nome} - ${mes}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao preencher métricas para ${nome}:`, error.message);
    return false;
  }
};

/**
 * Estruturas vazias para garantir todos os campos
 */
const createEmptyChamadas = () => ({
  ligacoes: 0,
  tma: "00:00:00",
  nota_telefone: 0,
  quantidade_notas: 0
});

const createEmptyTickets = () => ({
  quantidade: 0,
  tmt: "00:00:00",
  nota_ticket: 0,
  quantidade_notas: 0
});

const createEmptyQualidade = () => ({
  nota: 0,
  quantidade: 0
});

const createEmptyPausas = () => ({
  total_escalado: "00:00:00",
  total_cumprido: "00:00:00",
  abs: 0,
  atrasos: 0,
  pausa_escalada: "00:00:00",
  pausa_realizada: "00:00:00",
  pausa_almoco_escalada: "00:00:00",
  pausa_almoco_realizada: "00:00:00",
  pausa_10_escalada: "00:00:00",
  pausa_10_realizada: "00:00:00",
  pausa_banheiro: "00:00:00",
  pausa_feedback: "00:00:00",
  pausa_treinamento: "00:00:00"
});

/**
 * Processa múltiplas linhas de dados
 * Formato esperado:
 *   nome|mes|campo1:valor1|campo2:valor2|...
 */
const processMultipleEntries = (entries) => {
  console.log(`\n🔄 Processando ${entries.length} entrada(s)...\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const entry of entries) {
    const parts = entry.split('|');
    if (parts.length < 3) {
      console.error(`❌ Formato inválido: ${entry}`);
      failed++;
      continue;
    }
    
    const nome = parts[0].trim();
    const mes = parts[1].trim();
    const dadosString = parts.slice(2).join('|');
    
    if (fillMetrics(nome, mes, dadosString)) {
      success++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Sucesso: ${success}`);
  console.log(`   ❌ Falhas: ${failed}`);
};

// Se executado diretamente, processar dados da linha de comando ou stdin
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('preencher_metricas')) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📝 Como usar:

Opção 1 - Linha de comando:
  node scripts/preencher_metricas.js "Nome Operador|Mês|campo1:valor1|campo2:valor2|..."

Opção 2 - Múltiplas entradas:
  node scripts/preencher_metricas.js "Nome1|Mês1|dados1" "Nome2|Mês2|dados2" ...

Exemplo:
  node scripts/preencher_metricas.js "Gabriel Araujo|Novembro|ligacoes:150|tma:00:05:30|nota_telefone:4.8"

Campos disponíveis:
  Chamadas: ligacoes, tma, nota_telefone, quantidade_notas
  Tickets: tickets, tmt, nota_ticket, quantidade_notas_ticket
  Qualidade: nota_qualidade, quantidade_avaliacoes
  Pausas: total_escalado, total_cumprido, abs, atrasos, pausa_escalada, etc.
    `);
  } else {
    processMultipleEntries(args);
  }
}

export { fillMetrics, processMultipleEntries };

