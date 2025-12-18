import express from 'express';
import {
  getOperatorData,
  listOperators,
  getIndicatorsFromSheet,
} from '../controllers/googleSheetsController.js';

const router = express.Router();

// Rota de teste para verificar configuração
router.get('/test', async (req, res) => {
  try {
    const hasEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const hasSpreadsheetId = !!process.env.GOOGLE_SPREADSHEET_ID;
    const hasCredentials = !!(process.env.GOOGLE_CREDENTIALS_JSON || process.env.GOOGLE_CREDENTIALS_PATH);
    
    res.json({
      configured: hasEmail && hasSpreadsheetId && hasCredentials,
      hasEmail,
      hasSpreadsheetId,
      hasCredentials,
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'Não configurado',
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || 'Não configurado',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar dados completos de um operador na planilha
router.get('/operator', getOperatorData);

// Listar todos os operadores de uma aba
router.get('/operators', listOperators);

// Buscar indicadores mapeados para o formato do sistema
router.get('/indicators', getIndicatorsFromSheet);

export default router;

