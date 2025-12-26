/**
 * Script para atualizar dados de Dezembro a partir de arquivo XLSX
 * Lê a aba "DEZ" do arquivo XLSX e atualiza o Metrics.json
 */

import { findXlsxFile, readXlsxFile } from '../src/services/xlsxService.js';
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
    const content = fs.readFileSync(sendEmailFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Erro ao carregar send_email.JSON:', error);
    throw error;
  }
};

/**
 * Encontra email pelo nome do operador
 */
const findEmailByName = (nome, emailMapping) => {
  // Buscar exato primeiro
  if (emailMapping[nome]) {
    return emailMapping[nome];
  }
  
  // Buscar por similaridade (case-insensitive)
  const normalizedNome = nome.toLowerCase().trim();
  for (const [key, email] of Object.entries(emailMapping)) {
    if (key.toLowerCase().trim() === normalizedNome) {
      return email;
    }
  }
  
  return null;
};

/**
 * Normaliza tempo para formato HH:MM:SS
 */
const normalizeTime = (timeStr) => {
  if (!timeStr || timeStr === '' || timeStr === null || timeStr === undefined) {
    return '00:00:00';
  }
  
  // Se já está no formato correto
  if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return timeStr;
  }
  
  // Se é um número (dias Excel)
  if (typeof timeStr === 'number') {
    // Converter de fração de dia para horas:minutos:segundos
    const totalSeconds = Math.floor(timeStr * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  // Tentar parsear string
  const parts = String(timeStr).split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    const s = parts.length > 2 ? parseInt(parts[2]) || 0 : 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  
  return '00:00:00';
};

/**
 * Converte dados da linha do Excel para formato Metrics.json
 */
const convertRowToMetrics = (row) => {
  // Estrutura esperada das colunas (baseado em COMO_USAR_XLSX.md):
  // 0: Operadores, 1: # Ligações, 2: TMA, 3: Pesq telefone, 4: Qtd pesq, 
  // 5: # Tickets, 6: TMT, 7: Pesquisa Ticket, 8: Qtd pesq,
  // 9: Nota qualidade, 10: Qtd Avaliações,
  // 11: Total escalado, 12: Total logado, 13: % logado,
  // 14: ABS, 15: Atrasos,
  // 16: Pausa escalada, 17: Total de pausas, 18: %,
  // 19: Almoço escalado, 20: Almoço realizado, 21: %,
  // 22: Pausa 10 escalada, 23: Pausa 10 realizado, 24: %,
  // 25: Pausa banheiro, 26: %,
  // 27: Pausa Feedback, 28: %,
  // 29: Treinamento, 30: %
  
  const parseNumber = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };
  
  const parseDecimal = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };
  
  return {
    nome: row[0] || '',
    chamadas: {
      ligacoes: parseNumber(row[1]),
      tma: normalizeTime(row[2]),
      nota_telefone: parseDecimal(row[3]),
      quantidade_notas: parseNumber(row[4])
    },
    tickets: {
      quantidade: parseNumber(row[5]),
      tmt: normalizeTime(row[6]),
      nota_ticket: parseDecimal(row[7]),
      quantidade_notas: parseNumber(row[8])
    },
    qualidade: {
      nota: parseDecimal(row[9]),
      quantidade: parseNumber(row[10])
    },
    pausas_tempo_logado: {
      total_escalado: normalizeTime(row[11]),
      total_cumprido: normalizeTime(row[12]),
      abs: parseNumber(row[14]),
      atrasos: parseNumber(row[15]),
      pausa_escalada: normalizeTime(row[16]),
      pausa_realizada: normalizeTime(row[17]),
      pausa_almoco_escalada: normalizeTime(row[19]),
      pausa_almoco_realizada: normalizeTime(row[20]),
      pausa_10_escalada: normalizeTime(row[22]),
      pausa_10_realizada: normalizeTime(row[23]),
      pausa_banheiro: normalizeTime(row[25]),
      pausa_feedback: normalizeTime(row[27]),
      pausa_treinamento: normalizeTime(row[29])
    }
  };
};

/**
 * Atualiza dados de Dezembro a partir do XLSX
 */
const atualizarDezembro = async () => {
  try {
    console.log('🔄 Iniciando atualização de dados de Dezembro...\n');
    
    // 1. Encontrar arquivo XLSX
    console.log('📁 Procurando arquivo XLSX...');
    const xlsxPath = findXlsxFile();
    console.log(`✅ Arquivo encontrado: ${path.basename(xlsxPath)}\n`);
    
    // 2. Ler arquivo XLSX
    console.log('📖 Lendo arquivo XLSX...');
    const sheets = await readXlsxFile(xlsxPath);
    
    // Verificar se existe aba DEZ
    if (!sheets.DEZ && !sheets.dezembro && !sheets.Dezembro) {
      const aba = sheets.DEZ || sheets.dezembro || sheets.Dezembro;
      const abasDisponiveis = Object.keys(sheets).join(', ');
      throw new Error(`Aba "DEZ" não encontrada. Abas disponíveis: ${abasDisponiveis}`);
    }
    
    const abaDez = sheets.DEZ || sheets.dezembro || sheets.Dezembro;
    console.log(`✅ Aba DEZ encontrada com ${abaDez.length} linhas\n`);
    
    // 3. Carregar dados existentes
    const metrics = loadMetrics();
    const emailMapping = loadEmailMapping();
    
    let success = 0;
    let failed = 0;
    const errors = [];
    
    // 4. Processar cada linha (pular cabeçalho)
    for (let i = 1; i < abaDez.length; i++) {
      const row = abaDez[i];
      
      if (!row || !row[0] || row[0].trim() === '') {
        continue; // Linha vazia ou sem nome
      }
      
      try {
        const dados = convertRowToMetrics(row);
        const nome = dados.nome.trim();
        
        if (!nome) {
          continue;
        }
        
        // Encontrar email
        const email = findEmailByName(nome, emailMapping);
        if (!email) {
          console.error(`⚠️ Operador não encontrado: ${nome}`);
          failed++;
          errors.push(`Operador não encontrado: ${nome}`);
          continue;
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        
        // Verificar se operador existe no Metrics.json
        if (!metrics[normalizedEmail] || !metrics[normalizedEmail].login) {
          console.error(`⚠️ Operador não encontrado no Metrics.json: ${nome} (${email})`);
          failed++;
          errors.push(`Operador não encontrado no Metrics.json: ${nome} (${email})`);
          continue;
        }
        
        // Garantir estrutura de meses
        if (!metrics[normalizedEmail].login.meses) {
          metrics[normalizedEmail].login.meses = {
            Outubro: { dados: {} },
            Novembro: { dados: {} },
            Dezembro: { dados: {} }
          };
        }
        
        // Atualizar dados de Dezembro
        metrics[normalizedEmail].login.meses.Dezembro.dados = {
          chamadas: dados.chamadas,
          tickets: dados.tickets,
          qualidade: dados.qualidade,
          pausas_tempo_logado: dados.pausas_tempo_logado
        };
        
        // Atualizar campo dados principal para apontar para Dezembro
        metrics[normalizedEmail].login.dados = dados;
        
        // Atualizar timestamp
        metrics[normalizedEmail].login.metricas_atualizadas_em = new Date().toLocaleString('pt-BR');
        
        console.log(`✅ ${nome} - Dezembro atualizado`);
        success++;
      } catch (error) {
        console.error(`❌ Erro ao processar linha ${i + 1}:`, error.message);
        failed++;
        errors.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // 5. Salvar arquivo
    console.log('\n💾 Salvando Metrics.json...');
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2), 'utf-8');
    
    // 6. Resumo
    console.log(`\n📊 Resultado:`);
    console.log(`   ✅ Sucesso: ${success}`);
    console.log(`   ❌ Falhas: ${failed}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️ Erros encontrados:`);
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
    console.log(`\n✅ Dados de Dezembro atualizados com sucesso!`);
  } catch (error) {
    console.error('\n❌ Erro ao atualizar dados de Dezembro:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Executar
atualizarDezembro();

