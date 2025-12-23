import { getLogsByOperatorName } from '../database.js';

export const getLogs = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    // Retornar apenas logs do operador autenticado
    const operatorName = req.user.operatorName;
    const logs = getLogsByOperatorName(operatorName);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs', details: error.message });
  }
};

