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
export const getCompleteHistory = () => api.get('/manager/history/complete');

// Feedback de Gestores
export const getManagerFeedback = (operatorId, month = null, year = null) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return api.get(`/manager/feedback/${operatorId}`, { params });
};
export const saveManagerFeedback = (operatorId, month, year, feedbackText) => {
  return api.post('/manager/feedback', {
    operatorId,
    month,
    year,
    feedbackText,
  });
};
export const updateManagerFeedback = (feedbackId, feedbackText) => {
  return api.put(`/manager/feedback/${feedbackId}`, {
    feedbackText,
  });
};
export const deleteManagerFeedback = (feedbackId) => {
  return api.delete(`/manager/feedback/${feedbackId}`);
};

// Métricas
export const getMetrics = () => api.get('/metrics');
export const getMetricByType = (metricType) => api.get(`/metrics/${metricType}`);
export const saveMetric = (metricType, metricValue) => api.post('/metrics', { metricType, metricValue });
export const saveMultipleMetrics = (metrics) => api.post('/metrics/batch', { metrics });
export const getMetricsHistory = (metricType = null, startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const url = metricType ? `/metrics/history/${metricType}` : '/metrics/history';
  return api.get(url, { params });
};
export const createMetricsSnapshot = (metricType, snapshotDate = null) => 
  api.post('/metrics/snapshot', { metricType, snapshotDate });

// Checks de Métricas
export const getMetricChecks = () => api.get('/metrics/checks/all');
export const getMetricCheck = (metricType) => api.get(`/metrics/checks/${metricType}`);
export const setMetricCheck = (metricType, checked) => 
  api.post('/metrics/checks', { metricType, checked });

// Feedbacks I.A
export const getAIFeedbacks = (metricType = null) => {
  const url = metricType ? `/metrics/feedback/${metricType}` : '/metrics/feedback';
  return api.get(url);
};
export const getLatestAIFeedback = (metricType) => api.get(`/metrics/feedback/${metricType}/latest`);
export const generateAIFeedback = (metricType, forceRegenerate = false) => 
  api.post('/metrics/generate-feedback', { metricType, forceRegenerate });

// Histórico de Ações
export const getActionHistory = (startDate = null, endDate = null, actionType = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (actionType) params.actionType = actionType;
  return api.get('/history', { params });
};

// Confirmações de Operadores
export const getOperatorConfirmation = (month, year = null) => {
  const params = { month };
  if (year) params.year = year;
  return api.get('/operator/confirmation', { params });
};

export const saveOperatorConfirmation = (month, year, understood, observations = '') => {
  return api.post('/operator/confirmation', {
    month,
    year,
    understood,
    observations
  });
};

// Feedbacks de Gestores para o Operador
export const getOperatorFeedbacks = (month = null, year = null) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return api.get('/operator/feedbacks', { params });
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

