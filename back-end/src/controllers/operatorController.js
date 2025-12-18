import { addOperator, getOperators, getOperatorById as getOperatorByIdDB } from '../database.js';
import { createLog } from '../services/logService.js';
import { getAvailableOperatorNames } from '../services/emailService.js';

export const createOperator = (req, res) => {
  try {
    const { name, position, team, referenceMonth } = req.body;

    if (!name || !position || !team || !referenceMonth) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios: name, position, team, referenceMonth' 
      });
    }

    const operator = addOperator({
      name,
      position,
      team,
      reference_month: referenceMonth,
    });

    createLog(name, referenceMonth, 'Cadastro de operador', 'success', `Operador ${name} cadastrado com sucesso`);

    res.status(201).json({
      id: operator.id,
      name: operator.name,
      position: operator.position,
      team: operator.team,
      referenceMonth: operator.reference_month,
      message: 'Operador cadastrado com sucesso',
    });
  } catch (error) {
    createLog(null, null, 'Cadastro de operador', 'error', error.message);
    res.status(500).json({ error: 'Erro ao cadastrar operador', details: error.message });
  }
};

export const getAllOperators = (req, res) => {
  try {
    const operators = getOperators();
    res.json(operators.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar operadores', details: error.message });
  }
};

export const getOperatorById = (req, res) => {
  try {
    const { id } = req.params;
    const operator = getOperatorByIdDB(id);

    if (!operator) {
      return res.status(404).json({ error: 'Operador não encontrado' });
    }

    res.json(operator);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar operador', details: error.message });
  }
};

export const getAvailableNames = (req, res) => {
  try {
    const names = getAvailableOperatorNames();
    res.json({ names });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar nomes disponíveis', details: error.message });
  }
};

