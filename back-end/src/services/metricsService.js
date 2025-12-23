import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tentar múltiplos caminhos possíveis
const possibleMetricsDirs = [
  path.join(__dirname, '../../data'), // Local: services/../../data
  path.join(process.cwd(), 'data'), // Render com rootDir: back-end/data
  path.join(process.cwd(), 'back-end', 'data'), // Render sem rootDir
  path.join(__dirname, '../../../data'), // Alternativo
];

let metricsDir = null;
let metricsFile = null;

// Encontrar o diretório data que existe
for (const dir of possibleMetricsDirs) {
  if (fs.existsSync(dir)) {
    metricsDir = dir;
    console.log(`✅ Metrics - Diretório data encontrado em: ${metricsDir}`);
    break;
  }
}

// Se não encontrou, usar o primeiro (será criado)
if (!metricsDir) {
  metricsDir = possibleMetricsDirs[0];
  console.log(`⚠️ Metrics - Diretório data não encontrado, usando: ${metricsDir}`);
}

metricsFile = path.join(metricsDir, 'Metrics.json');

// Debug: Log dos caminhos
console.log('📂 Metrics - Diretório atual (process.cwd()):', process.cwd());
console.log('📂 Metrics - Diretório do módulo (__dirname):', __dirname);
console.log('📂 Metrics - Diretório de dados escolhido:', metricsDir);
console.log('📂 Metrics - Arquivo Metrics.json:', metricsFile);
console.log('📂 Metrics - Arquivo existe?', fs.existsSync(metricsFile));

/**
 * Carrega o arquivo Metrics.json
 * @returns {Object} Dados do arquivo Metrics.json
 */
const loadMetricsFile = () => {
  try {
    if (!fs.existsSync(metricsFile)) {
      console.log('⚠️ Arquivo Metrics.json não encontrado em:', metricsFile);
      console.log('⚠️ Tentando caminhos alternativos...');
      
      // Tentar caminhos alternativos
      const alternativePaths = [
        path.join(process.cwd(), 'data', 'Metrics.json'),
        path.join(process.cwd(), 'back-end', 'data', 'Metrics.json'),
        path.join(__dirname, '../../../data', 'Metrics.json'),
      ];
      
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          console.log(`✅ Metrics.json encontrado em caminho alternativo: ${altPath}`);
          const content = fs.readFileSync(altPath, 'utf-8');
          return JSON.parse(content);
        }
      }
      
      console.log('⚠️ Criando estrutura vazia...');
      const emptyStructure = {};
      saveMetricsFile(emptyStructure);
      return emptyStructure;
    }
    
    console.log('✅ Metrics.json encontrado, carregando...');
    const content = fs.readFileSync(metricsFile, 'utf-8');
    const data = JSON.parse(content);
    console.log(`✅ Metrics.json carregado com ${Object.keys(data).length} entradas`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao carregar Metrics.json:', error);
    return {};
  }
};

/**
 * Salva dados no arquivo Metrics.json
 * @param {Object} data - Dados para salvar
 */
const saveMetricsFile = (data) => {
  try {
    // Garantir que o diretório existe
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }
    
    fs.writeFileSync(metricsFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erro ao salvar Metrics.json:', error);
    throw error;
  }
};

/**
 * Busca métricas de um operador pelo email
 * @param {string} email - Email do operador
 * @param {string} month - Mês específico (opcional): "Outubro", "Novembro", "Dezembro". Se não informado, retorna dados principais
 * @returns {Object|null} Métricas do operador ou null se não encontrado
 */
export const getMetricsByEmail = (email, month = null) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const metricsData = loadMetricsFile();
    
    console.log(`🔍 Buscando métricas para email: ${email}${month ? ` (mês: ${month})` : ''}`);
    
    let operatorData = null;
    
    // Estrutura 1: Email como chave direta
    if (metricsData[normalizedEmail]) {
      const entry = metricsData[normalizedEmail];
      // Se tem estrutura "login", retornar login, senão retornar direto
      if (entry.login) {
        console.log(`✅ Métricas encontradas (estrutura com login)`);
        operatorData = entry.login;
      } else {
        console.log(`✅ Métricas encontradas (estrutura direta)`);
        operatorData = entry;
      }
    } else {
      // Estrutura 2: Se tem chave "login" no nível raiz (estrutura atual do arquivo)
      if (metricsData.login && metricsData.login.email) {
        if (metricsData.login.email.toLowerCase().trim() === normalizedEmail) {
          console.log(`✅ Métricas encontradas (estrutura login no nível raiz)`);
          operatorData = metricsData.login;
        }
      } else {
        // Estrutura 3: Buscar dentro de objetos "login" em outras chaves
        for (const key in metricsData) {
          const entry = metricsData[key];
          
          // Se a entrada tem estrutura "login"
          if (entry && entry.login && entry.login.email) {
            if (entry.login.email.toLowerCase().trim() === normalizedEmail) {
              console.log(`✅ Métricas encontradas na chave "${key}"`);
              operatorData = entry.login;
              break;
            }
          }
          
          // Se a entrada já é um objeto com email direto
          if (entry && entry.email && entry.email.toLowerCase().trim() === normalizedEmail) {
            console.log(`✅ Métricas encontradas na chave "${key}" (estrutura direta)`);
            operatorData = entry;
            break;
          }
        }
      }
    }
    
    if (!operatorData) {
      console.log(`❌ Métricas não encontradas para email: ${email}`);
      return null;
    }
    
    // Se foi solicitado um mês específico e existe estrutura de meses
    if (month && operatorData.meses && operatorData.meses[month]) {
      console.log(`📅 Retornando métricas do mês: ${month}`);
      return {
        ...operatorData,
        dados: operatorData.meses[month].dados
      };
    }
    
    // Se não foi especificado um mês, usar o último mês disponível (Dezembro > Novembro > Outubro)
    // ou o campo "dados" principal se não houver estrutura de meses
    if (operatorData.meses) {
      const mesesDisponiveis = ['Dezembro', 'Novembro', 'Outubro'];
      for (const mes of mesesDisponiveis) {
        if (operatorData.meses[mes] && operatorData.meses[mes].dados) {
          console.log(`📅 Retornando último mês disponível: ${mes}`);
          return {
            ...operatorData,
            dados: operatorData.meses[mes].dados,
            mes_atual: mes
          };
        }
      }
    }
    
    // Fallback: retornar dados principais se não houver estrutura de meses
    return operatorData;
  } catch (error) {
    console.error('Erro ao buscar métricas por email:', error);
    return null;
  }
};

/**
 * Lista todos os meses disponíveis para um operador
 * @param {string} email - Email do operador
 * @returns {Array<string>} Lista de meses disponíveis
 */
export const getAvailableMonths = (email) => {
  try {
    const operatorData = getMetricsByEmail(email);
    if (!operatorData || !operatorData.meses) {
      return [];
    }
    return Object.keys(operatorData.meses);
  } catch (error) {
    console.error('Erro ao listar meses disponíveis:', error);
    return [];
  }
};

/**
 * Converte métricas do formato Metrics.json para o formato do dashboard
 * @param {Object} metricsData - Dados do Metrics.json
 * @param {string} month - Mês específico (opcional): "Outubro", "Novembro", "Dezembro"
 * @returns {Object} Métricas no formato do dashboard
 */
export const convertMetricsToDashboardFormat = (metricsData, month = null) => {
  if (!metricsData) {
    return null;
  }
  
  // Se foi solicitado um mês específico, usar dados desse mês
  let dados = null;
  if (month && metricsData.meses && metricsData.meses[month]) {
    dados = metricsData.meses[month].dados;
  } else if (metricsData.dados) {
    // Se não especificou mês, usar dados retornados (que já aponta para o último mês disponível)
    dados = metricsData.dados;
  }
  
  if (!dados) {
    return null;
  }
  
  // Mapear estrutura do Metrics.json para formato do dashboard
  return {
    // Chamadas
    calls: dados.chamadas?.ligacoes || null,
    tma: dados.chamadas?.tma || null,
    quality_score: dados.chamadas?.nota_telefone || null,
    qtd_pesq_telefone: dados.chamadas?.quantidade_notas || null,
    
    // Tickets
    tickets: dados.tickets?.quantidade || null,
    tmt: dados.tickets?.tmt || null,
    pesquisa_ticket: dados.tickets?.nota_ticket || null,
    qtd_pesq_ticket: dados.tickets?.quantidade_notas || null,
    
    // Qualidade
    nota_qualidade: dados.qualidade?.nota || null,
    qtd_avaliacoes: dados.qualidade?.quantidade || null,
    
    // Pausas e Tempo Logado
    total_escalado: dados.pausas_tempo_logado?.total_escalado || null,
    total_logado: dados.pausas_tempo_logado?.total_cumprido || null,
    percent_logado: null, // Calcular se necessário
    absenteeism: dados.pausas_tempo_logado?.abs || null,
    atrasos: dados.pausas_tempo_logado?.atrasos || null,
    pausa_escalada: dados.pausas_tempo_logado?.pausa_escalada || null,
    total_pausas: dados.pausas_tempo_logado?.pausa_realizada || null,
    percent_pausas: null, // Calcular se necessário
    almoco_escalado: dados.pausas_tempo_logado?.pausa_almoco_escalada || null,
    almoco_realizado: dados.pausas_tempo_logado?.pausa_almoco_realizada || null,
    percent_almoco: null, // Calcular se necessário
    pausa_10_escalada: dados.pausas_tempo_logado?.pausa_10_escalada || null,
    pausa_10_realizado: dados.pausas_tempo_logado?.pausa_10_realizada || null,
    percent_pausa_10: null, // Calcular se necessário
    pausa_banheiro: dados.pausas_tempo_logado?.pausa_banheiro || null,
    percent_pausa_banheiro: null, // Calcular se necessário
    pausa_feedback: dados.pausas_tempo_logado?.pausa_feedback || null,
    percent_pausa_feedback: null, // Calcular se necessário
    treinamento: dados.pausas_tempo_logado?.pausa_treinamento || null,
    percent_treinamento: null, // Calcular se necessário
  };
};

/**
 * Atualiza métricas de um operador
 * @param {string} email - Email do operador
 * @param {Object} metricsData - Novos dados de métricas
 * @returns {Object} Métricas atualizadas
 */
export const updateMetricsByEmail = (email, metricsData) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const allMetrics = loadMetricsFile();
    
    // Criar estrutura se não existir
    if (!allMetrics[normalizedEmail]) {
      allMetrics[normalizedEmail] = {
        login: {
          email: email,
          nome: metricsData.nome || '',
          metricas_atualizadas_em: new Date().toLocaleString('pt-BR'),
          dados: metricsData.dados || {}
        }
      };
    } else {
      // Atualizar dados existentes
      if (allMetrics[normalizedEmail].login) {
        allMetrics[normalizedEmail].login.metricas_atualizadas_em = new Date().toLocaleString('pt-BR');
        allMetrics[normalizedEmail].login.dados = metricsData.dados || allMetrics[normalizedEmail].login.dados;
        if (metricsData.nome) {
          allMetrics[normalizedEmail].login.nome = metricsData.nome;
        }
      } else {
        // Se não tem estrutura login, criar
        allMetrics[normalizedEmail] = {
          login: {
            email: email,
            nome: metricsData.nome || '',
            metricas_atualizadas_em: new Date().toLocaleString('pt-BR'),
            dados: metricsData.dados || {}
          }
        };
      }
    }
    
    saveMetricsFile(allMetrics);
    return allMetrics[normalizedEmail].login || allMetrics[normalizedEmail];
  } catch (error) {
    console.error('Erro ao atualizar métricas:', error);
    throw error;
  }
};

/**
 * Lista todos os emails que têm métricas cadastradas
 * @returns {Array<string>} Lista de emails
 */
export const listEmailsWithMetrics = () => {
  try {
    const metricsData = loadMetricsFile();
    const emails = [];
    
    for (const key in metricsData) {
      const entry = metricsData[key];
      if (entry && entry.login && entry.login.email) {
        emails.push(entry.login.email);
      } else if (entry && entry.email) {
        emails.push(entry.email);
      } else if (key.includes('@')) {
        // Se a chave é um email
        emails.push(key);
      }
    }
    
    return emails;
  } catch (error) {
    console.error('Erro ao listar emails com métricas:', error);
    return [];
  }
};


