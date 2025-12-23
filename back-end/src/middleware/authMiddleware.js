import { verifySessionToken } from '../services/authService.js';
import { createLog } from '../services/logService.js';

/**
 * Middleware de autenticação
 * Valida token JWT e adiciona req.user com dados do usuário autenticado
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de autenticação não fornecido',
        code: 'NO_TOKEN'
      });
    }

    // Verificar token
    const userData = verifySessionToken(token);

    if (!userData) {
      return res.status(401).json({ 
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = {
      email: userData.email,
      operatorId: userData.operatorId,
      operatorName: userData.operatorName,
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar autenticação',
      details: error.message 
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Não bloqueia se não houver token, mas adiciona req.user se houver
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const userData = verifySessionToken(token);
      if (userData) {
        req.user = {
          email: userData.email,
          operatorId: userData.operatorId,
          operatorName: userData.operatorName,
        };
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

