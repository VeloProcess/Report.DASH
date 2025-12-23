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
// Teste direto antes de usar o router
app.post('/api/auth/login-test', (req, res) => {
  console.log('✅ Rota de teste /api/auth/login-test chamada');
  res.json({ test: 'ok', message: 'Rota de teste funcionando' });
});

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema de Feedback funcionando' });
});

// Debug: Log de todas as rotas registradas
console.log('📋 Rotas registradas:');
console.log('  - POST /api/auth/login');
console.log('  - GET /api/auth/me');
console.log('  - POST /api/auth/logout');
console.log('  - GET /api/health');

// Rotas protegidas (requerem autenticação)
app.use('/api/operators', operatorRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/sheets', googleSheetsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

