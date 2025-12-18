import { addLog, getAllLogsLimited, getLogsByOperatorName } from '../database.js';

export const createLog = (operatorName, referenceMonth, action, status, message) => {
  addLog({
    operator_name: operatorName || null,
    reference_month: referenceMonth || null,
    action,
    status,
    message: message || null,
  });
};

export const getAllLogs = () => {
  return getAllLogsLimited(100);
};

export const getLogsByOperator = (operatorName) => {
  return getLogsByOperatorName(operatorName);
};

