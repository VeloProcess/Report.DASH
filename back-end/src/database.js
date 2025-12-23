import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from './services/supabaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tentar múltiplos caminhos possíveis (para funcionar localmente e no Render)
const possibleDataDirs = [
  path.join(__dirname, '..', 'data'), // Local: src/../data
  path.join(process.cwd(), 'data'), // Render com rootDir: back-end/data
  path.join(process.cwd(), 'back-end', 'data'), // Render sem rootDir
  path.join(__dirname, '../../data'), // Alternativo
];

let dataDir = null;
let operatorsFile = null;
let indicatorsFile = null;
let feedbacksFile = null;
let logsFile = null;
let managerFeedbacksFile = null;

// Encontrar o diretório data que existe
for (const dir of possibleDataDirs) {
  if (fs.existsSync(dir)) {
    dataDir = dir;
    console.log(`✅ Diretório data encontrado em: ${dataDir}`);
    break;
  }
}

// Se não encontrou, usar o primeiro (será criado)
if (!dataDir) {
  dataDir = possibleDataDirs[0];
  console.log(`⚠️ Diretório data não encontrado, usando: ${dataDir}`);
}

operatorsFile = path.join(dataDir, 'operators.json');
indicatorsFile = path.join(dataDir, 'indicators.json');
feedbacksFile = path.join(dataDir, 'feedbacks.json');
logsFile = path.join(dataDir, 'logs.json');
managerFeedbacksFile = path.join(dataDir, 'manager_feedbacks.json');

// Debug: Log dos caminhos
console.log('📂 Diretório atual (process.cwd()):', process.cwd());
console.log('📂 Diretório do módulo (__dirname):', __dirname);
console.log('📂 Diretório de dados escolhido (dataDir):', dataDir);
console.log('📂 Arquivo operators.json:', operatorsFile);
console.log('📂 Arquivo operators.json existe?', fs.existsSync(operatorsFile));

// Garantir que o diretório data existe
if (!fs.existsSync(dataDir)) {
  console.log('⚠️ Diretório data não existe, criando...');
  fs.mkdirSync(dataDir, { recursive: true });
} else {
  console.log('✅ Diretório data existe');
}

// Verificar se operators.json existe
if (fs.existsSync(operatorsFile)) {
  const operators = JSON.parse(fs.readFileSync(operatorsFile, 'utf8'));
  console.log(`✅ operators.json encontrado com ${Array.isArray(operators) ? operators.length : 0} operadores`);
} else {
  console.log('❌ operators.json NÃO encontrado!');
}

// Inicializar arquivos JSON se não existirem
const initFile = (filePath, defaultValue = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
  }
};

// Ler dados de um arquivo JSON
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Escrever dados em um arquivo JSON
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Operadores
export const getOperators = () => readData(operatorsFile);
export const saveOperators = (operators) => writeData(operatorsFile, operators);
export const addOperator = (operator) => {
  const operators = getOperators();
  const newOperator = {
    id: operators.length > 0 ? Math.max(...operators.map(o => o.id)) + 1 : 1,
    ...operator,
    created_at: new Date().toISOString(),
  };
  operators.push(newOperator);
  saveOperators(operators);
  return newOperator;
};
export const getOperatorById = (id) => {
  const operators = getOperators();
  return operators.find(o => o.id === parseInt(id));
};

// Indicadores
export const getIndicators = () => readData(indicatorsFile);
export const saveIndicators = (indicators) => writeData(indicatorsFile, indicators);
export const addIndicator = (indicator) => {
  const indicators = getIndicators();
  const newIndicator = {
    id: indicators.length > 0 ? Math.max(...indicators.map(i => i.id)) + 1 : 1,
    ...indicator,
    created_at: new Date().toISOString(),
  };
  indicators.push(newIndicator);
  saveIndicators(indicators);
  return newIndicator;
};
export const getLatestIndicatorByOperatorId = (operatorId) => {
  const indicators = getIndicators();
  const operatorIndicators = indicators
    .filter(i => i.operator_id === parseInt(operatorId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return operatorIndicators[0] || null;
};

// Feedbacks
export const getFeedbacks = () => readData(feedbacksFile);
export const saveFeedbacks = (feedbacks) => writeData(feedbacksFile, feedbacks);
export const addFeedback = (feedback) => {
  const feedbacks = getFeedbacks();
  const newFeedback = {
    id: feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.id)) + 1 : 1,
    ...feedback,
    created_at: new Date().toISOString(),
  };
  feedbacks.push(newFeedback);
  saveFeedbacks(feedbacks);
  return newFeedback;
};
export const getLatestFeedbackByOperatorId = (operatorId) => {
  const feedbacks = getFeedbacks();
  const operatorFeedbacks = feedbacks
    .filter(f => f.operator_id === parseInt(operatorId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return operatorFeedbacks[0] || null;
};
export const getAllFeedbacksWithOperators = () => {
  const feedbacks = getFeedbacks();
  const operators = getOperators();
  return feedbacks
    .map(feedback => {
      const operator = operators.find(o => o.id === feedback.operator_id);
      return {
        ...feedback,
        operator_name: operator?.name,
        position: operator?.position,
        team: operator?.team,
        reference_month: operator?.reference_month,
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// Logs
export const getLogs = () => readData(logsFile);
export const saveLogs = (logs) => writeData(logsFile, logs);
export const addLog = (log) => {
  const logs = getLogs();
  const newLog = {
    id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
    ...log,
    created_at: new Date().toISOString(),
  };
  logs.push(newLog);
  saveLogs(logs);
  return newLog;
};
export const getLogsByOperatorName = (operatorName) => {
  const logs = getLogs();
  return logs
    .filter(log => log.operator_name === operatorName)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};
export const getAllLogsLimited = (limit = 100) => {
  const logs = getLogs();
  return logs
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
};

// Manager Feedbacks - Usando Supabase
export const getManagerFeedbacks = async () => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando array vazio.');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('manager_feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar feedbacks do Supabase:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error);
    return [];
  }
};

export const saveManagerFeedbacks = async (feedbacks) => {
  // Esta função não é mais necessária com Supabase, mas mantida para compatibilidade
  console.warn('saveManagerFeedbacks: Função obsoleta com Supabase. Use saveManagerFeedback individualmente.');
  return feedbacks;
};

export const getManagerFeedbackByOperatorAndMonth = async (operatorId, month, year) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando null.');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('manager_feedbacks')
      .select('*')
      .eq('operator_id', parseInt(operatorId))
      .eq('month', month)
      .eq('year', parseInt(year))
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum resultado encontrado (normal)
        return null;
      }
      console.error('Erro ao buscar feedback do Supabase:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar feedback:', error);
    return null;
  }
};

export const saveManagerFeedback = async (feedback) => {
  if (!supabase) {
    throw new Error('Supabase não configurado. Configure SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY no .env');
  }
  
  try {
    // Usar UPSERT (INSERT ... ON CONFLICT UPDATE) para criar ou atualizar
    const { data, error } = await supabase
      .from('manager_feedbacks')
      .upsert({
        operator_id: feedback.operator_id,
        month: feedback.month,
        year: feedback.year,
        feedback_text: feedback.feedback_text,
        manager_email: feedback.manager_email,
        manager_name: feedback.manager_name,
      }, {
        onConflict: 'operator_id,month,year',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar feedback no Supabase:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    throw error;
  }
};

export const deleteManagerFeedback = async (id) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Não é possível deletar feedback.');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('manager_feedbacks')
      .delete()
      .eq('id', parseInt(id));
    
    if (error) {
      console.error('Erro ao deletar feedback do Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar feedback:', error);
    return false;
  }
};

export const getManagerFeedbacksByOperator = async (operatorId) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando array vazio.');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('manager_feedbacks')
      .select('*')
      .eq('operator_id', parseInt(operatorId))
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar feedbacks do operador no Supabase:', error);
      return [];
    }
    
    // Ordenar manualmente por ano e mês (mais recente primeiro)
    const monthOrder = { 'Dezembro': 12, 'Novembro': 11, 'Outubro': 10 };
    return (data || []).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return (monthOrder[b.month] || 0) - (monthOrder[a.month] || 0);
    });
  } catch (error) {
    console.error('Erro ao buscar feedbacks do operador:', error);
    return [];
  }
};

// Inicializar banco de dados
export const initializeDatabase = () => {
  initFile(operatorsFile);
  initFile(indicatorsFile);
  initFile(feedbacksFile);
  initFile(logsFile);
  // managerFeedbacksFile não é mais necessário (usando Supabase)
  console.log('✅ Banco de dados (JSON) inicializado com sucesso');
  console.log('✅ Feedbacks de gestores agora usam Supabase');
};
