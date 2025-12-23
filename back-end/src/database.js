import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const operatorsFile = path.join(dataDir, 'operators.json');
const indicatorsFile = path.join(dataDir, 'indicators.json');
const feedbacksFile = path.join(dataDir, 'feedbacks.json');
const logsFile = path.join(dataDir, 'logs.json');

// Debug: Log dos caminhos
console.log('📂 Diretório atual (process.cwd()):', process.cwd());
console.log('📂 Diretório do módulo (__dirname):', __dirname);
console.log('📂 Diretório de dados (dataDir):', dataDir);
console.log('📂 Arquivo operators.json:', operatorsFile);
console.log('📂 Arquivo existe?', fs.existsSync(operatorsFile));

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

// Inicializar banco de dados
export const initializeDatabase = () => {
  initFile(operatorsFile);
  initFile(indicatorsFile);
  initFile(feedbacksFile);
  initFile(logsFile);
  console.log('✅ Banco de dados (JSON) inicializado com sucesso');
};
