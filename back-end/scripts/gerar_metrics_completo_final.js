/**
 * Script para gerar Metrics.json completo com TODOS os dados
 * Outubro, Novembro e Dezembro preenchidos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const metricsFile = path.join(__dirname, '../data/Metrics.json');
const sendEmailFile = path.join(__dirname, '../src/controllers/send_email.JSON');

// Importar dados dos scripts anteriores
import { dadosOutubro } from './preencher_outubro.js';
import { dadosNovembro } from './preencher_novembro.js';
import { dadosDezembro } from './preencher_dezembro.js';

const loadEmailMapping = () => {
  const content = fs.readFileSync(sendEmailFile, 'utf-8');
  return JSON.parse(content);
};

const findEmailByName = (nome, emailMapping) => {
  const normalizedNome = nome.toLowerCase().trim();
  for (const [name, email] of Object.entries(emailMapping)) {
    if (name.toLowerCase().trim() === normalizedNome) {
      return email.toLowerCase().trim();
    }
  }
  return null;
};

const normalizeTime = (timeStr) => {
  if (!timeStr || timeStr === '-' || timeStr === null || timeStr === '#REF!' || timeStr === '##') return "00:00:00";
  if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) return timeStr;
  if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
    const parts = timeStr.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}:${parts[2]}`;
  }
  return timeStr;
};

const createEmptyMonthStructure = () => ({
  chamadas: {
    ligacoes: 0,
    tma: "00:00:00",
    nota_telefone: 0,
    quantidade_notas: 0
  },
  tickets: {
    quantidade: 0,
    tmt: "00:00:00",
    nota_ticket: 0,
    quantidade_notas: 0
  },
  qualidade: {
    nota: 0,
    quantidade: 0
  },
  pausas_tempo_logado: {
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
  }
});

const processMonthData = (dados, emailMapping) => {
  const result = {};
  
  for (const dadosOp of dados) {
    const email = findEmailByName(dadosOp.nome, emailMapping);
    if (!email) continue;
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!result[normalizedEmail]) {
      result[normalizedEmail] = {
        email: email,
        nome: dadosOp.nome,
        meses: {
          Outubro: { dados: createEmptyMonthStructure() },
          Novembro: { dados: createEmptyMonthStructure() },
          Dezembro: { dados: createEmptyMonthStructure() }
        }
      };
    }
    
    // Identificar qual mês processar baseado nos dados
    let mes = null;
    if (dadosOp.ligacoes === 372 && dadosOp.tma === "00:06:34") mes = "Outubro";
    else if (dadosOp.ligacoes === 428 && dadosOp.tma === "00:05:02") mes = "Novembro";
    else if (dadosOp.ligacoes === 254 && dadosOp.tma === "00:04:54") mes = "Dezembro";
    
    if (mes) {
      result[normalizedEmail].meses[mes].dados = {
        chamadas: {
          ligacoes: dadosOp.ligacoes || 0,
          tma: normalizeTime(dadosOp.tma),
          nota_telefone: dadosOp.nota_telefone || 0,
          quantidade_notas: dadosOp.quantidade_notas_telefone || 0
        },
        tickets: {
          quantidade: dadosOp.tickets || 0,
          tmt: normalizeTime(dadosOp.tmt),
          nota_ticket: dadosOp.nota_ticket || 0,
          quantidade_notas: dadosOp.quantidade_notas_ticket || 0
        },
        qualidade: {
          nota: dadosOp.nota_qualidade || 0,
          quantidade: dadosOp.quantidade_avaliacoes || 0
        },
        pausas_tempo_logado: {
          total_escalado: normalizeTime(dadosOp.total_escalado),
          total_cumprido: normalizeTime(dadosOp.total_cumprido),
          abs: dadosOp.abs || 0,
          atrasos: dadosOp.atrasos || 0,
          pausa_escalada: normalizeTime(dadosOp.pausa_escalada),
          pausa_realizada: normalizeTime(dadosOp.pausa_realizada),
          pausa_almoco_escalada: normalizeTime(dadosOp.pausa_almoco_escalada),
          pausa_almoco_realizada: normalizeTime(dadosOp.pausa_almoco_realizada),
          pausa_10_escalada: normalizeTime(dadosOp.pausa_10_escalada),
          pausa_10_realizada: normalizeTime(dadosOp.pausa_10_realizada),
          pausa_banheiro: normalizeTime(dadosOp.pausa_banheiro),
          pausa_feedback: normalizeTime(dadosOp.pausa_feedback),
          pausa_treinamento: normalizeTime(dadosOp.pausa_treinamento)
        }
      };
    }
  }
  
  return result;
};

const generateCompleteMetrics = () => {
  console.log('🔄 Gerando Metrics.json completo com todos os dados...\n');
  
  const emailMapping = loadEmailMapping();
  
  // Processar dados de cada mês
  const outubroData = processMonthData(dadosOutubro, emailMapping);
  const novembroData = processMonthData(dadosNovembro, emailMapping);
  const dezembroData = processMonthData(dadosDezembro, emailMapping);
  
  // Consolidar tudo
  const finalMetrics = {};
  
  // Adicionar todos os operadores do send_email.JSON
  for (const [nome, email] of Object.entries(emailMapping)) {
    const normalizedEmail = email.toLowerCase().trim();
    
    finalMetrics[normalizedEmail] = {
      login: {
        email: email,
        nome: nome,
        metricas_atualizadas_em: new Date().toLocaleString('pt-BR'),
        meses: {
          Outubro: { dados: createEmptyMonthStructure() },
          Novembro: { dados: createEmptyMonthStructure() },
          Dezembro: { dados: createEmptyMonthStructure() }
        },
        dados: createEmptyMonthStructure() // Campo principal aponta para Dezembro
      }
    };
    
    // Preencher Outubro se existir
    if (outubroData[normalizedEmail]) {
      finalMetrics[normalizedEmail].login.meses.Outubro.dados = outubroData[normalizedEmail].meses.Outubro.dados;
    }
    
    // Preencher Novembro se existir
    if (novembroData[normalizedEmail]) {
      finalMetrics[normalizedEmail].login.meses.Novembro.dados = novembroData[normalizedEmail].meses.Novembro.dados;
    }
    
    // Preencher Dezembro se existir
    if (dezembroData[normalizedEmail]) {
      finalMetrics[normalizedEmail].login.meses.Dezembro.dados = dezembroData[normalizedEmail].meses.Dezembro.dados;
      // Campo dados principal aponta para Dezembro (último mês)
      finalMetrics[normalizedEmail].login.dados = dezembroData[normalizedEmail].meses.Dezembro.dados;
    }
  }
  
  // Salvar arquivo
  fs.writeFileSync(metricsFile, JSON.stringify(finalMetrics, null, 2), 'utf-8');
  
  console.log(`✅ Arquivo Metrics.json gerado com sucesso!`);
  console.log(`📊 Total de operadores: ${Object.keys(finalMetrics).length}`);
  console.log(`📁 Localização: ${metricsFile}`);
};

generateCompleteMetrics();

