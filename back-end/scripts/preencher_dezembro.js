/**
 * Script para preencher dados de Dezembro no Metrics.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const metricsFile = path.join(__dirname, '../data/Metrics.json');
const sendEmailFile = path.join(__dirname, '../src/controllers/send_email.JSON');

// Dados da tabela de Dezembro
const dadosDezembro = [
  {
    nome: "Dimas Henrique Gonçalves do Nascimento",
    ligacoes: 268,
    tma: "00:04:50",
    nota_telefone: 4.96,
    quantidade_notas_telefone: 107,
    tickets: 168,
    tmt: "02:19:47",
    nota_ticket: 3.00,
    quantidade_notas_ticket: 13,
    nota_qualidade: 0.88,
    quantidade_avaliacoes: 3,
    total_escalado: "153:00:00",
    total_cumprido: "168:18:17",
    abs: 0,
    atrasos: 2,
    pausa_escalada: "24:30:00",
    pausa_realizada: "25:16:40",
    pausa_almoco_escalada: "17:00:00",
    pausa_almoco_realizada: "15:47:18",
    pausa_10_escalada: "9:00:00",
    pausa_10_realizada: "5:20:25",
    pausa_banheiro: "2:10:13",
    pausa_feedback: "1:53:32",
    pausa_treinamento: "0:05:12"
  },
  {
    nome: "Gabrielli Ribeiro de Assunção",
    ligacoes: 269,
    tma: "00:03:33",
    nota_telefone: 4.81,
    quantidade_notas_telefone: 111,
    tickets: 322,
    tmt: "02:40:01",
    nota_ticket: 3.71,
    quantidade_notas_ticket: 14,
    nota_qualidade: 1.00,
    quantidade_avaliacoes: 3,
    total_escalado: "171:00:00",
    total_cumprido: "169:19:04",
    abs: 0,
    atrasos: 1,
    pausa_escalada: "26:00:00",
    pausa_realizada: "28:19:29",
    pausa_almoco_escalada: "17:20:00",
    pausa_almoco_realizada: "16:45:47",
    pausa_10_escalada: "8:40:00",
    pausa_10_realizada: "6:01:27",
    pausa_banheiro: "2:23:56",
    pausa_feedback: "3:03:27",
    pausa_treinamento: "0:04:52"
  },
  {
    nome: "Igor Leme de Siqueira",
    ligacoes: 161,
    tma: "00:04:38",
    nota_telefone: 4.89,
    quantidade_notas_telefone: 85,
    tickets: 70,
    tmt: "01:16:47",
    nota_ticket: 2.00,
    quantidade_notas_ticket: 4,
    nota_qualidade: 0.97,
    quantidade_avaliacoes: 3,
    total_escalado: "167:00:00",
    total_cumprido: "122:47:38",
    abs: 4,
    atrasos: 9,
    pausa_escalada: "18:00:00",
    pausa_realizada: "17:22:11",
    pausa_almoco_escalada: "12:00:00",
    pausa_almoco_realizada: "10:52:08",
    pausa_10_escalada: "6:00:00",
    pausa_10_realizada: "3:08:54",
    pausa_banheiro: "2:14:38",
    pausa_feedback: "0:27:58",
    pausa_treinamento: "0:04:37"
  },
  {
    nome: "Juliana Aparecida Rofino",
    ligacoes: 206,
    tma: "00:03:54",
    nota_telefone: 4.97,
    quantidade_notas_telefone: 100,
    tickets: 138,
    tmt: "04:03:35",
    nota_ticket: 3.00,
    quantidade_notas_ticket: 9,
    nota_qualidade: 0.90,
    quantidade_avaliacoes: 3,
    total_escalado: "147:00:00",
    total_cumprido: "150:30:53",
    abs: 0,
    atrasos: 12,
    pausa_escalada: "22:00:00",
    pausa_realizada: "22:18:12",
    pausa_almoco_escalada: "14:20:00",
    pausa_almoco_realizada: "14:30:39",
    pausa_10_escalada: "7:40:00",
    pausa_10_realizada: "5:28:37",
    pausa_banheiro: "1:32:24",
    pausa_feedback: "0:40:39",
    pausa_treinamento: "0:05:53"
  },
  {
    nome: "Laura Ketheleen de Freitas Guedes",
    ligacoes: 200,
    tma: "00:04:14",
    nota_telefone: 4.86,
    quantidade_notas_telefone: 50,
    tickets: 101,
    tmt: "02:44:55",
    nota_ticket: 2.80,
    quantidade_notas_ticket: 5,
    nota_qualidade: 1.00,
    quantidade_avaliacoes: 3,
    total_escalado: "147:00:00",
    total_cumprido: "147:09:18",
    abs: 0,
    atrasos: 11,
    pausa_escalada: "22:00:00",
    pausa_realizada: "23:17:14",
    pausa_almoco_escalada: "14:20:00",
    pausa_almoco_realizada: "13:47:08",
    pausa_10_escalada: "7:40:00",
    pausa_10_realizada: "6:16:28",
    pausa_banheiro: "2:14:27",
    pausa_feedback: "0:53:26",
    pausa_treinamento: "0:05:45"
  },
  {
    nome: "Laura Porto de Almeida",
    ligacoes: 191,
    tma: "00:04:15",
    nota_telefone: 4.86,
    quantidade_notas_telefone: 57,
    tickets: 114,
    tmt: "03:01:51",
    nota_ticket: 4.00,
    quantidade_notas_ticket: 4,
    nota_qualidade: 0.92,
    quantidade_avaliacoes: 3,
    total_escalado: "167:00:00",
    total_cumprido: "139:29:31",
    abs: 2,
    atrasos: 10,
    pausa_escalada: "22:30:00",
    pausa_realizada: "22:54:57",
    pausa_almoco_escalada: "15:00:00",
    pausa_almoco_realizada: "15:13:14",
    pausa_10_escalada: "7:30:00",
    pausa_10_realizada: "4:38:12",
    pausa_banheiro: "2:14:31",
    pausa_feedback: "0:49:00",
    pausa_treinamento: null
  },
  {
    nome: "Marcelo Rodrigo Izael da Silva",
    ligacoes: 207,
    tma: "00:03:44",
    nota_telefone: 4.78,
    quantidade_notas_telefone: 143,
    tickets: 263,
    tmt: "03:08:04",
    nota_ticket: 2.92,
    quantidade_notas_ticket: 12,
    nota_qualidade: 1.00,
    quantidade_avaliacoes: 3,
    total_escalado: "126:36:00",
    total_cumprido: "135:59:46",
    abs: 0,
    atrasos: 4,
    pausa_escalada: "19:50:00",
    pausa_realizada: "21:51:37",
    pausa_almoco_escalada: "14:20:00",
    pausa_almoco_realizada: "14:25:21",
    pausa_10_escalada: "5:30:00",
    pausa_10_realizada: "4:03:18",
    pausa_banheiro: "2:37:57",
    pausa_feedback: "0:40:53",
    pausa_treinamento: "0:04:08"
  },
  {
    nome: "Marcos da Silva Pereira",
    ligacoes: 206,
    tma: "00:05:25",
    nota_telefone: 4.83,
    quantidade_notas_telefone: 124,
    tickets: 194,
    tmt: "02:29:44",
    nota_ticket: 3.33,
    quantidade_notas_ticket: 3,
    nota_qualidade: 0.95,
    quantidade_avaliacoes: 3,
    total_escalado: "144:48:00",
    total_cumprido: "131:06:32",
    abs: 0,
    atrasos: 12,
    pausa_escalada: "22:40:00",
    pausa_realizada: "26:21:39",
    pausa_almoco_escalada: "17:00:00",
    pausa_almoco_realizada: "16:57:28",
    pausa_10_escalada: "5:40:00",
    pausa_10_realizada: "2:55:57",
    pausa_banheiro: "1:56:22",
    pausa_feedback: "4:31:52",
    pausa_treinamento: null
  },
  {
    nome: "Mariana Leao Cordeiro da Cruz",
    ligacoes: 33,
    tma: "00:10:14",
    nota_telefone: 4.91,
    quantidade_notas_telefone: 23,
    tickets: 91,
    tmt: "02:18:17",
    nota_ticket: 3.00,
    quantidade_notas_ticket: 2,
    nota_qualidade: 0.93,
    quantidade_avaliacoes: 3,
    total_escalado: "167:00:00",
    total_cumprido: "147:59:43",
    abs: 0,
    atrasos: 5,
    pausa_escalada: "25:30:00",
    pausa_realizada: "22:43:10",
    pausa_almoco_escalada: "17:00:00",
    pausa_almoco_realizada: "14:09:49",
    pausa_10_escalada: "8:30:00",
    pausa_10_realizada: "5:26:42",
    pausa_banheiro: "1:30:20",
    pausa_feedback: "1:36:19",
    pausa_treinamento: null
  },
  {
    nome: "Monike Samara Nascimento da Silva",
    ligacoes: 233,
    tma: "00:05:01",
    nota_telefone: 4.84,
    quantidade_notas_telefone: 83,
    tickets: 148,
    tmt: "02:18:19",
    nota_ticket: 2.73,
    quantidade_notas_ticket: 11,
    nota_qualidade: 0.92,
    quantidade_avaliacoes: 3,
    total_escalado: "171:00:00",
    total_cumprido: "168:04:59",
    abs: 0,
    atrasos: 9,
    pausa_escalada: "26:00:00",
    pausa_realizada: "25:35:05",
    pausa_almoco_escalada: "17:20:00",
    pausa_almoco_realizada: "17:20:59",
    pausa_10_escalada: "8:40:00",
    pausa_10_realizada: "6:53:19",
    pausa_banheiro: "0:36:07",
    pausa_feedback: "0:39:01",
    pausa_treinamento: "0:04:27"
  },
  {
    nome: "Murilo mazin cersozimo caetano",
    ligacoes: 237,
    tma: "00:05:21",
    nota_telefone: 4.76,
    quantidade_notas_telefone: 99,
    tickets: 101,
    tmt: "01:55:48",
    nota_ticket: 3.17,
    quantidade_notas_ticket: 6,
    nota_qualidade: 0.87,
    quantidade_avaliacoes: 3,
    total_escalado: "171:00:00",
    total_cumprido: "164:16:49",
    abs: 0,
    atrasos: 11,
    pausa_escalada: "26:00:00",
    pausa_realizada: "28:39:37",
    pausa_almoco_escalada: "17:20:00",
    pausa_almoco_realizada: "16:21:27",
    pausa_10_escalada: "8:40:00",
    pausa_10_realizada: "6:39:04",
    pausa_banheiro: "2:03:42",
    pausa_feedback: "3:12:28",
    pausa_treinamento: null
  },
  {
    nome: "Rodrigo Raimundo Reis",
    ligacoes: 273,
    tma: "00:05:17",
    nota_telefone: 4.84,
    quantidade_notas_telefone: 90,
    tickets: 137,
    tmt: "02:17:04",
    nota_ticket: 4.00,
    quantidade_notas_ticket: 10,
    nota_qualidade: 1.00,
    quantidade_avaliacoes: 3,
    total_escalado: "171:00:00",
    total_cumprido: "169:01:29",
    abs: 0,
    atrasos: 0,
    pausa_escalada: "26:00:00",
    pausa_realizada: "23:39:37",
    pausa_almoco_escalada: "17:20:00",
    pausa_almoco_realizada: "14:49:30",
    pausa_10_escalada: "8:40:00",
    pausa_10_realizada: "5:06:08",
    pausa_banheiro: "2:12:43",
    pausa_feedback: "1:07:19",
    pausa_treinamento: "0:23:57"
  },
  {
    nome: "Stephanie Monterani de Oliveira",
    ligacoes: 222,
    tma: "00:05:19",
    nota_telefone: 4.86,
    quantidade_notas_telefone: 154,
    tickets: 87,
    tmt: "02:31:44",
    nota_ticket: 3.00,
    quantidade_notas_ticket: 6,
    nota_qualidade: 0.78,
    quantidade_avaliacoes: 3,
    total_escalado: "171:00:00",
    total_cumprido: "156:46:39",
    abs: 1,
    atrasos: 15,
    pausa_escalada: "23:00:00",
    pausa_realizada: "33:08:51",
    pausa_almoco_escalada: "15:20:00",
    pausa_almoco_realizada: "17:09:26",
    pausa_10_escalada: "7:40:00",
    pausa_10_realizada: "4:03:03",
    pausa_banheiro: "7:13:23",
    pausa_feedback: "4:37:06",
    pausa_treinamento: "0:05:53"
  },
  {
    nome: "Vinicius Nascimento de Assunção",
    ligacoes: 226,
    tma: "00:05:03",
    nota_telefone: 4.86,
    quantidade_notas_telefone: 146,
    tickets: 140,
    tmt: "01:42:25",
    nota_ticket: 3.00,
    quantidade_notas_ticket: 7,
    nota_qualidade: 1.00,
    quantidade_avaliacoes: 3,
    total_escalado: "167:00:00",
    total_cumprido: "161:13:11",
    abs: 0,
    atrasos: 5,
    pausa_escalada: "25:30:00",
    pausa_realizada: "24:17:22",
    pausa_almoco_escalada: "17:00:00",
    pausa_almoco_realizada: "15:02:57",
    pausa_10_escalada: "8:30:00",
    pausa_10_realizada: "5:29:56",
    pausa_banheiro: "1:55:59",
    pausa_feedback: "1:28:08",
    pausa_treinamento: "0:20:22"
  },
  {
    nome: "Viviane Barros Silva",
    ligacoes: 195,
    tma: "00:03:31",
    nota_telefone: 4.81,
    quantidade_notas_telefone: 100,
    tickets: 151,
    tmt: "02:11:24",
    nota_ticket: 3.43,
    quantidade_notas_ticket: 7,
    nota_qualidade: 1.00,
    quantidade_avaliacoes: 2,
    total_escalado: "167:00:00",
    total_cumprido: "143:59:27",
    abs: 2,
    atrasos: 13,
    pausa_escalada: "22:30:00",
    pausa_realizada: "23:09:05",
    pausa_almoco_escalada: "15:00:00",
    pausa_almoco_realizada: "14:59:19",
    pausa_10_escalada: "7:30:00",
    pausa_10_realizada: "6:11:49",
    pausa_banheiro: "1:04:58",
    pausa_feedback: "0:46:49",
    pausa_treinamento: "0:06:10"
  },
];

const loadMetrics = () => {
  const content = fs.readFileSync(metricsFile, 'utf-8');
  return JSON.parse(content);
};

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
  // Se já está no formato HH:MM:SS, retornar
  if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) return timeStr;
  // Se está no formato H:MM:SS, adicionar zero à esquerda
  if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
    const parts = timeStr.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}:${parts[2]}`;
  }
  return timeStr;
};

const fillDezembroData = () => {
  console.log('🔄 Preenchendo dados de Dezembro...\n');
  
  const metrics = loadMetrics();
  const emailMapping = loadEmailMapping();
  
  let success = 0;
  let failed = 0;
  
  for (const dados of dadosDezembro) {
    const email = findEmailByName(dados.nome, emailMapping);
    
    if (!email) {
      console.error(`❌ Operador não encontrado: ${dados.nome}`);
      failed++;
      continue;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!metrics[normalizedEmail] || !metrics[normalizedEmail].login) {
      console.error(`❌ Operador não encontrado no Metrics.json: ${dados.nome} (${email})`);
      failed++;
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
    
    // Preencher dados de Dezembro
    metrics[normalizedEmail].login.meses.Dezembro.dados = {
      chamadas: {
        ligacoes: dados.ligacoes || 0,
        tma: normalizeTime(dados.tma),
        nota_telefone: dados.nota_telefone || 0,
        quantidade_notas: dados.quantidade_notas_telefone || 0
      },
      tickets: {
        quantidade: dados.tickets || 0,
        tmt: normalizeTime(dados.tmt),
        nota_ticket: dados.nota_ticket || 0,
        quantidade_notas: dados.quantidade_notas_ticket || 0
      },
      qualidade: {
        nota: dados.nota_qualidade || 0,
        quantidade: dados.quantidade_avaliacoes || 0
      },
      pausas_tempo_logado: {
        total_escalado: normalizeTime(dados.total_escalado),
        total_cumprido: normalizeTime(dados.total_cumprido),
        abs: dados.abs || 0,
        atrasos: dados.atrasos || 0, // Campo novo em Dezembro!
        pausa_escalada: normalizeTime(dados.pausa_escalada),
        pausa_realizada: normalizeTime(dados.pausa_realizada),
        pausa_almoco_escalada: normalizeTime(dados.pausa_almoco_escalada),
        pausa_almoco_realizada: normalizeTime(dados.pausa_almoco_realizada),
        pausa_10_escalada: normalizeTime(dados.pausa_10_escalada),
        pausa_10_realizada: normalizeTime(dados.pausa_10_realizada),
        pausa_banheiro: normalizeTime(dados.pausa_banheiro),
        pausa_feedback: normalizeTime(dados.pausa_feedback),
        pausa_treinamento: normalizeTime(dados.pausa_treinamento)
      }
    };
    
    // Atualizar timestamp
    metrics[normalizedEmail].login.metricas_atualizadas_em = new Date().toLocaleString('pt-BR');
    
    console.log(`✅ ${dados.nome} - Dezembro`);
    success++;
  }
  
  // Salvar arquivo
  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2), 'utf-8');
  
  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Sucesso: ${success}`);
  console.log(`   ❌ Falhas: ${failed}`);
  console.log(`\n✅ Dados de Dezembro preenchidos com sucesso!`);
};

fillDezembroData();

