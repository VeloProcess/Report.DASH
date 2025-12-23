import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Autenticação
export const login = (googleToken) => api.post('/auth/login', { token: googleToken });
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

// Operadores
export const getMyOperator = () => api.get('/operators/me');
export const getOperatorById = (id) => api.get(`/operators/${id}`);

// Dashboard
export const getDashboardMetrics = (month = null) => {
  const params = month ? { month } : {};
  return api.get('/dashboard/metrics', { params });
};
export const getDashboardMonths = () => api.get('/dashboard/months');
export const getDashboardFeedback = () => api.get('/dashboard/feedback');
export const getDashboardHistory = () => api.get('/dashboard/history');
export const getDashboardOperator = () => api.get('/dashboard/operator');

// Indicadores
export const createIndicators = (data) => api.post('/feedback/indicators', data);

// Feedback
export const generateFeedback = () => api.post('/feedback/generate');
export const getFeedbackByOperator = () => api.get('/feedback');
export const sendFeedbackEmail = () => api.post('/feedback/send-email');

// Logs
export const getLogs = () => api.get('/logs');

// Exportação
export const exportPDF = (month = null) => {
  const params = month ? { month } : {};
  return api.get('/export/pdf', { responseType: 'blob', params });
};

// Gestores (apenas para gestores)
export const getManagerOperators = () => api.get('/manager/operators');
export const getManagerOperatorMetrics = (operatorId, month = null) => {
  const params = month ? { month } : {};
  return api.get(`/manager/operators/${operatorId}/metrics`, { params });
};
export const exportManagerPDF = (operatorId, month = null) => {
  const params = month ? { month } : {};
  return api.get(`/manager/operators/${operatorId}/export/pdf`, { responseType: 'blob', params });
};
export const exportCSV = (month = null) => {
  const params = month ? { month } : {};
  return api.get('/export/csv', { responseType: 'blob', params });
};
export const exportXLSX = (month = null) => {
  const params = month ? { month } : {};
  return api.get('/export/xlsx', { responseType: 'blob', params });
};

// Google Sheets (mantido para compatibilidade, mas requer autenticação)
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

