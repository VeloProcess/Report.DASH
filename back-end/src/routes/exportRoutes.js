import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { exportToPDF, exportToCSV, exportToXLSX } from '../services/exportService.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * GET /api/export/pdf
 * Exporta dados do operador autenticado em PDF
 * Query params:
 *   - month (opcional): "Outubro", "Novembro", "Dezembro" - retorna métricas do mês específico
 */
router.get('/pdf', async (req, res) => {
  try {
    const month = req.query.month || null; // Mês solicitado via query param
    console.log(`📄 Exportando PDF para operador: ${req.user.operatorName}, mês: ${month || 'padrão'}`);
    
    const pdfBuffer = await exportToPDF(req.user, month);
    
    const monthSuffix = month ? `_${month}` : '';
    const filename = `feedback_${req.user.operatorName.replace(/\s+/g, '_')}${monthSuffix}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Erro ao exportar PDF:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao exportar PDF',
      details: error.message 
    });
  }
});

/**
 * GET /api/export/csv
 * Exporta dados do operador autenticado em CSV
 */
router.get('/csv', async (req, res) => {
  try {
    const csv = await exportToCSV(req.user);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dados_${req.user.operatorName.replace(/\s+/g, '_')}.csv"`);
    
    res.send(csv);
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    res.status(500).json({ 
      error: 'Erro ao exportar CSV',
      details: error.message 
    });
  }
});

/**
 * GET /api/export/xlsx
 * Exporta dados do operador autenticado em XLSX
 */
router.get('/xlsx', async (req, res) => {
  try {
    const xlsxBuffer = await exportToXLSX(req.user);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="dados_${req.user.operatorName.replace(/\s+/g, '_')}.xlsx"`);
    
    res.send(xlsxBuffer);
  } catch (error) {
    console.error('Erro ao exportar XLSX:', error);
    res.status(500).json({ 
      error: 'Erro ao exportar XLSX',
      details: error.message 
    });
  }
});

export default router;

