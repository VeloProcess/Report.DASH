import { getAllLogs, getLogsByOperator } from '../services/logService.js';

export const getLogs = (req, res) => {
  try {
    const { operatorName } = req.query;
    
    let logs;
    if (operatorName) {
      logs = getLogsByOperator(operatorName);
    } else {
      logs = getAllLogs();
    }

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar logs', details: error.message });
  }
};

