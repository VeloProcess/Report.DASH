import { getOperatorById as getOperatorByIdDB } from '../database.js';
import { createLog } from '../services/logService.js';
import { getOperatorByEmail } from '../utils/operatorUtils.js';

/**
 * GET /api/operators/me
 * Retorna dados do operador autenticado
 */
export const getMyOperator = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    const operator = getOperatorByEmail(req.user.email);

    if (!operator) {
      return res.status(404).json({ error: 'Operador não encontrado' });
    }

    res.json(operator);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar operador', details: error.message });
  }
};

/**
 * GET /api/operators/:id
 * Retorna operador por ID (apenas se for o próprio operador autenticado)
 */
export const getOperatorById = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    const { id } = req.params;
    const operator = getOperatorByIdDB(id);

    if (!operator) {
      return res.status(404).json({ error: 'Operador não encontrado' });
    }

    // Validar que o operador solicitado é o mesmo do usuário autenticado
    const authenticatedOperator = getOperatorByEmail(req.user.email);
    if (!authenticatedOperator || authenticatedOperator.id !== parseInt(id)) {
      return res.status(403).json({ 
        error: 'Acesso negado: Você não tem permissão para acessar estes dados' 
      });
    }

    res.json(operator);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar operador', details: error.message });
  }
};

