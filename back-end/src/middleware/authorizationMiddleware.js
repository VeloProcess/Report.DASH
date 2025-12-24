import { validateOperatorAccess, getOperatorByEmail } from '../utils/operatorUtils.js';
import { createLog } from '../services/logService.js';

/**
 * Middleware de autorização
 * Garante que o usuário só acesse seus próprios dados
 * REGRA CRÍTICA: Email sempre vem do token, nunca do frontend
 */
export const authorizeOperatorAccess = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Autenticação necessária',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Garantir que email sempre vem do token
    if (!req.user.email) {
      return res.status(401).json({ 
        error: 'Email não encontrado no token de autenticação',
        code: 'NO_EMAIL_IN_TOKEN'
      });
    }

    const { email, operatorId: authenticatedOperatorId } = req.user;
    
    // Remover qualquer email que possa ter vindo do frontend
    if (req.body && req.body.email) {
      console.warn(`⚠️ SECURITY: Tentativa de enviar email no body. Removendo. Email do token será usado: ${email}`);
      delete req.body.email;
    }
    if (req.query && req.query.email) {
      console.warn(`⚠️ SECURITY: Tentativa de enviar email no query. Removendo. Email do token será usado: ${email}`);
      delete req.query.email;
    }
    if (req.params && req.params.email) {
      console.warn(`⚠️ SECURITY: Tentativa de enviar email nos params. Removendo. Email do token será usado: ${email}`);
      delete req.params.email;
    }

    // Se houver operatorId nos parâmetros da rota, validar acesso
    if (req.params.operatorId) {
      const requestedOperatorId = parseInt(req.params.operatorId);
      
      if (!validateOperatorAccess(email, requestedOperatorId)) {
        createLog(
          req.user.operatorName,
          null,
          'Tentativa de acesso não autorizado',
          'error',
          `Tentativa de acessar operador ID ${requestedOperatorId} com email ${email}`
        );
        
        return res.status(403).json({ 
          error: 'Acesso negado: Você não tem permissão para acessar estes dados',
          code: 'UNAUTHORIZED_ACCESS'
        });
      }
    }

    // Se houver operatorId no body, validar acesso
    if (req.body.operatorId) {
      const requestedOperatorId = parseInt(req.body.operatorId);
      
      if (!validateOperatorAccess(email, requestedOperatorId)) {
        createLog(
          req.user.operatorName,
          null,
          'Tentativa de acesso não autorizado',
          'error',
          `Tentativa de modificar operador ID ${requestedOperatorId} com email ${email}`
        );
        
        return res.status(403).json({ 
          error: 'Acesso negado: Você não tem permissão para modificar estes dados',
          code: 'UNAUTHORIZED_ACCESS'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de autorização:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar autorização',
      details: error.message 
    });
  }
};

/**
 * Middleware para garantir que todas as queries filtrem por email autenticado
 * Substitui qualquer operatorId fornecido pelo operador autenticado
 */
export const enforceOperatorFilter = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Autenticação necessária',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const { operatorId: authenticatedOperatorId } = req.user;

    // Se operatorId for 0, significa que o operador não está cadastrado
    // Permitir continuar, mas não substituir IDs válidos
    if (authenticatedOperatorId === 0 || authenticatedOperatorId === null) {
      // Remover operatorId dos parâmetros para evitar buscas inválidas
      if (req.params.operatorId) {
        delete req.params.operatorId;
      }
      if (req.body.operatorId) {
        delete req.body.operatorId;
      }
      if (req.query.operatorId) {
        delete req.query.operatorId;
      }
      return next();
    }

    // Garantir que sempre usamos o operatorId do usuário autenticado
    if (req.params.operatorId) {
      req.params.operatorId = authenticatedOperatorId;
    }

    if (req.body.operatorId) {
      req.body.operatorId = authenticatedOperatorId;
    }

    if (req.query.operatorId) {
      req.query.operatorId = authenticatedOperatorId;
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de filtro:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar filtro',
      details: error.message 
    });
  }
};

