import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Operadores
export const createOperator = (data) => api.post('/operators', data);
export const getAllOperators = () => api.get('/operators');
export const getOperatorById = (id) => api.get(`/operators/${id}`);
export const getAvailableOperatorNames = () => api.get('/operators/available-names');

// Indicadores
export const createIndicators = (data) => api.post('/feedback/indicators', data);

// Feedback
export const generateFeedback = (operatorId) => 
  api.post('/feedback/generate', { operatorId });
export const getFeedbackByOperator = (operatorId) => 
  api.get(`/feedback/operator/${operatorId}`);
export const sendFeedbackEmail = (operatorId) => 
  api.post('/feedback/send-email', { operatorId });

// Logs
export const getLogs = (operatorName = null) => {
  const params = operatorName ? { operatorName } : {};
  return api.get('/logs', { params });
};

// Google Sheets
export const getIndicatorsFromSheet = (sheetName, operatorName, spreadsheetId = null) => {
  const params = { sheetName, operatorName };
  if (spreadsheetId) params.spreadsheetId = spreadsheetId;
  return api.get('/sheets/indicators', { params });
};

export const listOperatorsFromSheet = (sheetName, spreadsheetId = null) => {
  const params = { sheetName };
  if (spreadsheetId) params.spreadsheetId = spreadsheetId;
  return api.get('/sheets/operators', { params });
};

export default api;

