import express from 'express';
import { processLogin } from '../services/authService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getOperatorByEmail } from '../utils/operatorUtils.js';
import { isManager } from '../utils/managerUtils.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Valida token Google OAuth e cria sessão
 */
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Recebida requisição POST /api/auth/login');
    console.log('📦 Body recebido:', { hasToken: !!req.body.token });
    
    const { token } = req.body;

    if (!token) {
      console.log('❌ Token não fornecido');
      return res.status(400).json({ 
        error: 'Token Google não fornecido' 
      });
    }

    const result = await processLogin(token);

    console.log(`✅ Login bem-sucedido para: ${result.user.email}`);

    res.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    
    // Não bloquear mais o acesso - permitir login mesmo sem operador cadastrado
    // O sistema mostrará mensagem de "sem dados" no dashboard
    
    res.status(401).json({ 
      error: 'Erro ao fazer login',
      details: error.message 
    });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const operator = getOperatorByEmail(req.user.email);
    const managerStatus = isManager(req.user.email);
    
    if (!operator && !managerStatus) {
      return res.status(404).json({ 
        error: 'Operador não encontrado' 
      });
    }

    res.json({
      email: req.user.email,
      operatorId: req.user.operatorId,
      operatorName: req.user.operatorName,
      name: operator?.name || req.user.operatorName,
      position: operator?.position || null,
      team: operator?.team || null,
      referenceMonth: operator?.reference_month || null,
      isManager: managerStatus,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar dados do usuário',
      details: error.message 
    });
  }
});

/**
 * POST /api/auth/logout
 * Encerra sessão (no caso de JWT, apenas confirma logout no frontend)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Com JWT, o logout é feito no frontend removendo o token
    // Aqui apenas confirmamos
    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ 
      error: 'Erro ao fazer logout',
      details: error.message 
    });
  }
});

export default router;

