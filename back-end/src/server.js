import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database.js';
import authRoutes from './routes/authRoutes.js';
import operatorRoutes from './routes/operatorRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import logRoutes from './routes/logRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import googleSheetsRoutes from './routes/googleSheetsRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import managerFeedbackRoutes from './routes/managerFeedbackRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import operatorConfirmationsRoutes from './routes/operatorConfirmationsRoutes.js';
import operatorFeedbackRoutes from './routes/operatorFeedbackRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3003',
    'https://relatoriosvelotax.vercel.app',
    /\.vercel\.app$/,
    /\.onrender\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware de debug para todas as requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Inicializar banco de dados
initializeDatabase();

// Rotas públicas
console.log('🔍 Verificando authRoutes:', typeof authRoutes, authRoutes ? 'existe' : 'não existe');
if (authRoutes) {
  console.log('✅ authRoutes está definido, registrando rotas...');
  app.use('/api/auth', authRoutes);
  console.log('✅ Rotas /api/auth registradas');
} else {
  console.error('❌ authRoutes não está definido!');
}

// Rota de teste direta para debug
app.post('/api/auth/login-test', (req, res) => {
  console.log('✅ Rota de teste /api/auth/login-test chamada');
  res.json({ test: 'ok', message: 'Rota de teste funcionando' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema de Feedback funcionando' });
});

// Debug: Log de todas as rotas registradas
console.log('📋 Rotas registradas:');
console.log('  - POST /api/auth/login');
console.log('  - GET /api/auth/me');
console.log('  - POST /api/auth/logout');
console.log('  - GET /api/health');
console.log('  - POST /api/auth/login-test (teste)');

// Rotas protegidas (requerem autenticação)
app.use('/api/operators', operatorRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/sheets', googleSheetsRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/manager', managerFeedbackRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/operator/confirmation', operatorConfirmationsRoutes);
app.use('/api/operator/feedbacks', operatorFeedbackRoutes);

// Debug: Log de rotas de métricas registradas
console.log('📋 Rotas de métricas registradas:');
console.log('  - GET /api/metrics');
console.log('  - GET /api/metrics/history');
console.log('  - GET /api/metrics/history/:metricType');
console.log('  - GET /api/metrics/feedback');
console.log('  - GET /api/metrics/feedback/:metricType');
console.log('  - GET /api/metrics/feedback/:metricType/latest');
console.log('📋 Rotas de histórico registradas:');
console.log('  - GET /api/history');

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
