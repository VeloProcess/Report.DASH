import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { isManager } from '../utils/managerUtils.js';
import { getOperators } from '../database.js';
import { getOperatorByEmail, getOperatorNameByEmail } from '../utils/operatorUtils.js';
import { 
  getMetricsByEmail, 
  convertMetricsToDashboardFormat,
  getAvailableMonths
} from '../services/metricsService.js';
import { getLatestIndicatorByOperatorId, getLatestFeedbackByOperatorId } from '../database.js';
import { getManagerFeedbackByOperatorAndMonth, getOperatorById } from '../database.js';
import { exportToPDF } from '../services/exportService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para carregar email mapping
const loadEmailMapping = () => {
  const possiblePaths = [
    path.join(__dirname, '../controllers/send_email.JSON'),
    path.join(process.cwd(), 'src/controllers/send_email.JSON'),
    path.join(process.cwd(), 'back-end/src/controllers/send_email.JSON'),
    path.join(__dirname, '../../src/controllers/send_email.JSON'),
  ];

  for (const emailMappingPath of possiblePaths) {
    try {
      if (fs.existsSync(emailMappingPath)) {
        const emailMappingContent = fs.readFileSync(emailMappingPath, 'utf-8');
        const parsed = JSON.parse(emailMappingContent);
        return parsed;
      }
    } catch (error) {
      console.error(`Erro ao carregar email mapping de ${emailMappingPath}:`, error.message);
    }
  }

  return {};
};

// Função auxiliar para obter lista completa de operadores (do send_email.JSON + operators.json)
// Remove duplicatas baseado no email (chave única)
const getAllOperatorsComplete = () => {
  const operatorsFromDB = getOperators();
  const emailMapping = loadEmailMapping();
  
  // Criar um mapa de operadores do DB por email (chave única)
  const operatorsByEmail = new Map();
  operatorsFromDB.forEach(op => {
    // Tentar encontrar email do operador no mapping
    for (const [name, email] of Object.entries(emailMapping)) {
      if (name.toLowerCase().trim() === op.name.toLowerCase().trim()) {
        operatorsByEmail.set(email.toLowerCase(), op);
        break;
      }
    }
  });
  
  // Criar mapa de nomes normalizados para detectar duplicatas
  const namesMap = new Map();
  
  // Criar lista completa de operadores baseada no send_email.JSON
  const allOperators = [];
  const processedEmails = new Set(); // Para evitar duplicatas por email
  let nextId = Math.max(...operatorsFromDB.map(op => op.id || 0), 0) + 1;
  
  // Processar todos os operadores do send_email.JSON
  for (const [name, email] of Object.entries(emailMapping)) {
    const normalizedEmail = email.toLowerCase();
    
    // Pular se já processamos este email (duplicata)
    if (processedEmails.has(normalizedEmail)) {
      continue;
    }
    
    processedEmails.add(normalizedEmail);
    
    // Verificar se já existe operador com este email no DB
    const existingOperator = operatorsByEmail.get(normalizedEmail);
    
    if (existingOperator) {
      // Operador existe no DB, usar dados do DB
      const hasMetrics = !!getMetricsByEmail(email);
      allOperators.push({
        ...existingOperator,
        email: email,
        hasMetrics,
      });
    } else {
      // Verificar se já existe operador com nome similar (normalizado)
      const normalizedName = name.toLowerCase().trim();
      
      if (!namesMap.has(normalizedName)) {
        // Operador não existe no DB e nome não está duplicado, criar entrada básica
        const hasMetrics = !!getMetricsByEmail(email);
        allOperators.push({
          id: nextId++,
          name: name,
          position: 'Assistente de Atendimento', // Valor padrão
          team: 'Equipe Atendimento', // Valor padrão
          email: email,
          hasMetrics,
          reference_month: null,
          created_at: new Date().toISOString()
        });
        
        namesMap.set(normalizedName, true);
      }
    }
  }
  
  // Ordenar por nome
  allOperators.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  
  return allOperators;
};

const router = express.Router();

// Middleware para verificar se é gestor
const requireManager = (req, res, next) => {
  console.log('🔍 Verificando acesso de gestor:', {
    hasUser: !!req.user,
    email: req.user?.email,
    isManager: req.user?.isManager,
    userData: req.user
  });
  
  if (!req.user) {
    return res.status(403).json({
      error: 'Acesso negado: Autenticação necessária',
      code: 'NOT_AUTHENTICATED'
    });
  }
  
  // Verificar também diretamente pelo email caso o token não tenha isManager
  const email = req.user.email;
  if (!req.user.isManager && !isManager(email)) {
    console.log('❌ Usuário não é gestor:', email);
    return res.status(403).json({
      error: 'Acesso negado: Apenas gestores podem acessar esta funcionalidade',
      code: 'NOT_MANAGER',
      debug: {
        email: email,
        isManagerInToken: req.user.isManager,
        isManagerByEmail: isManager(email)
      }
    });
  }
  
  console.log('✅ Acesso de gestor autorizado:', email);
  next();
};

// Todas as rotas requerem autenticação e ser gestor
router.use(authenticateToken);
router.use(requireManager);

/**
 * GET /api/manager/operators
 * Lista todos os operadores (apenas para gestores)
 * Inclui TODOS os operadores do send_email.JSON, mesmo que não estejam no operators.json
 */
router.get('/operators', async (req, res) => {
  try {
    const allOperators = getAllOperatorsComplete();
    
    res.json({
      success: true,
      operators: allOperators,
      total: allOperators.length,
    });
  } catch (error) {
    console.error('Erro ao listar operadores:', error);
    res.status(500).json({
      error: 'Erro ao listar operadores',
      details: error.message
    });
  }
});

/**
 * GET /api/manager/operators/:operatorId/metrics
 * Retorna métricas de um operador específico (apenas para gestores)
 * Query params:
 *   - month (opcional): "Outubro", "Novembro", "Dezembro"
 */
router.get('/operators/:operatorId/metrics', async (req, res) => {
  try {
    const operatorId = parseInt(req.params.operatorId);
    const month = req.query.month || null;
    
    // Buscar operador na lista completa (inclui todos do send_email.JSON)
    const allOperators = getAllOperatorsComplete();
    const operator = allOperators.find(op => op.id === operatorId);
    
    if (!operator) {
      return res.status(404).json({
        error: 'Operador não encontrado'
      });
    }
    
    const operatorEmail = operator.email;
    
    if (!operatorEmail) {
      return res.status(404).json({
        error: 'Email do operador não encontrado'
      });
    }
    
    // Buscar métricas
    let metricsData = getMetricsByEmail(operatorEmail, month);
    let indicators = null;
    
    // Buscar feedback do gestor para o mês selecionado
    const currentYear = new Date().getFullYear();
    const managerFeedback = month ? await getManagerFeedbackByOperatorAndMonth(operatorId, month, currentYear) : null;
    
    if (metricsData) {
      indicators = convertMetricsToDashboardFormat(metricsData, month);
      if (indicators) {
        const availableMonths = getAvailableMonths(operatorEmail);
        return res.json({
          hasData: true,
          indicators,
          source: 'Metrics.json',
          operator: {
            id: operator.id,
            name: operator.name,
            email: operatorEmail,
            position: operator.position,
            team: operator.team,
          },
          month: month || 'atual',
          availableMonths: availableMonths,
          managerFeedback: managerFeedback || null,
        });
      }
    }
    
    // Fallback: buscar no sistema antigo
    const oldIndicators = getLatestIndicatorByOperatorId(operatorId);
    if (oldIndicators) {
      return res.json({
        hasData: true,
        indicators: oldIndicators,
        source: 'indicators.json',
        operator: {
          id: operator.id,
          name: operator.name,
          email: operatorEmail,
          position: operator.position,
          team: operator.team,
        },
        managerFeedback: managerFeedback || null,
      });
    }
    
    return res.json({
      hasData: false,
      message: 'Nenhuma métrica encontrada para este operador',
      operator: {
        id: operator.id,
        name: operator.name,
        email: operatorEmail,
        position: operator.position,
        team: operator.team,
      },
      managerFeedback: managerFeedback || null,
    });
  } catch (error) {
    console.error('Erro ao buscar métricas do operador:', error);
    res.status(500).json({
      error: 'Erro ao buscar métricas do operador',
      details: error.message
    });
  }
});

/**
 * GET /api/manager/operators/:operatorId/export/pdf
 * Exporta PDF de um operador específico (apenas para gestores)
 * Query params:
 *   - month (opcional): "Outubro", "Novembro", "Dezembro"
 */
router.get('/operators/:operatorId/export/pdf', async (req, res) => {
  try {
    const operatorId = parseInt(req.params.operatorId);
    const month = req.query.month || null;
    
    // Buscar operador na lista completa (inclui todos do send_email.JSON)
    const allOperators = getAllOperatorsComplete();
    const operator = allOperators.find(op => op.id === operatorId);
    
    if (!operator) {
      return res.status(404).json({
        error: 'Operador não encontrado'
      });
    }
    
    const operatorEmail = operator.email;
    
    if (!operatorEmail) {
      return res.status(404).json({
        error: 'Email do operador não encontrado'
      });
    }
    
    // Criar objeto userData para exportação
    const userDataForExport = {
      email: operatorEmail,
      operatorId: operator.id,
      operatorName: operator.name,
    };
    
    // Exportar PDF
    const pdfBuffer = await exportToPDF(userDataForExport, month);
    
    const monthSuffix = month ? `_${month}` : '';
    const filename = `feedback_${operator.name.replace(/\s+/g, '_')}${monthSuffix}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erro ao exportar PDF do operador:', error);
    res.status(500).json({
      error: 'Erro ao exportar PDF do operador',
      details: error.message
    });
  }
});

export default router;

