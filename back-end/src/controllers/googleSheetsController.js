import { 
  getOperatorDataFromSheet, 
  listOperatorsFromSheet 
} from '../integrations/google/googleSheetsService.js';
import { createLog } from '../services/logService.js';

/**
 * Busca dados de um operador específico na planilha do Google Sheets
 */
export const getOperatorData = async (req, res) => {
  try {
    const spreadsheetId = req.query.spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID;
    const { sheetName, operatorName } = req.query;

    if (!spreadsheetId || !sheetName || !operatorName) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios: sheetName, operatorName (spreadsheetId pode estar no .env)' 
      });
    }

    // Validar nome da aba (OUT, NOV, DEZ)
    const validSheets = ['OUT', 'NOV', 'DEZ'];
    if (!validSheets.includes(sheetName.toUpperCase())) {
      return res.status(400).json({ 
        error: 'sheetName deve ser uma das seguintes: OUT, NOV, DEZ' 
      });
    }

    const data = await getOperatorDataFromSheet(
      spreadsheetId, 
      sheetName.toUpperCase(), 
      operatorName
    );

    if (!data) {
      return res.status(404).json({ 
        error: `Operador "${operatorName}" não encontrado na aba "${sheetName}"` 
      });
    }

    res.json(data);
  } catch (error) {
    createLog(null, null, 'Busca de dados na planilha', 'error', error.message);
    res.status(500).json({ 
      error: 'Erro ao buscar dados da planilha', 
      details: error.message 
    });
  }
};

/**
 * Lista todos os operadores disponíveis em uma aba da planilha
 */
export const listOperators = async (req, res) => {
  try {
    const spreadsheetId = req.query.spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID;
    const { sheetName } = req.query;

    if (!spreadsheetId || !sheetName) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios: sheetName (spreadsheetId pode estar no .env)' 
      });
    }

    // Validar nome da aba (OUT, NOV, DEZ)
    const validSheets = ['OUT', 'NOV', 'DEZ'];
    if (!validSheets.includes(sheetName.toUpperCase())) {
      return res.status(400).json({ 
        error: 'sheetName deve ser uma das seguintes: OUT, NOV, DEZ' 
      });
    }

    const operators = await listOperatorsFromSheet(
      spreadsheetId, 
      sheetName.toUpperCase()
    );

    res.json({ operators });
  } catch (error) {
    createLog(null, null, 'Listagem de operadores da planilha', 'error', error.message);
    res.status(500).json({ 
      error: 'Erro ao listar operadores da planilha', 
      details: error.message 
    });
  }
};

/**
 * Busca dados da planilha e mapeia para o formato de indicadores do sistema
 */
export const getIndicatorsFromSheet = async (req, res) => {
  try {
    const spreadsheetId = req.query.spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID;
    const { sheetName, operatorName } = req.query;

    console.log('Busca de indicadores:', { spreadsheetId, sheetName, operatorName });

    if (!spreadsheetId || !sheetName || !operatorName) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios: sheetName, operatorName (spreadsheetId pode estar no .env)' 
      });
    }

    // Decodificar o nome do operador (pode vir com + ou %20)
    const decodedOperatorName = decodeURIComponent(operatorName.replace(/\+/g, ' '));
    console.log('Nome do operador decodificado:', decodedOperatorName);

    const data = await getOperatorDataFromSheet(
      spreadsheetId, 
      sheetName.toUpperCase(), 
      decodedOperatorName
    );

    if (!data) {
      return res.status(404).json({ 
        error: `Operador "${operatorName}" não encontrado na aba "${sheetName}"` 
      });
    }

    // Mapear dados da planilha para o formato de indicadores do sistema
    // Mapeamento correto conforme ordem das colunas:
    // calls = # Ligações (coluna 1)
    // tma = TMA (coluna 2)
    // qualityScore = Pesq telefone (coluna 3)
    // absenteeism = ABS (coluna 12)
    const indicators = {
      calls: data.calls || null,                    // # Ligações
      tma: data.tma || null,                        // TMA
      qualityScore: data.qualityScore || null,      // Pesq telefone
      absenteeism: data.abs || null,                // ABS
      // Dados adicionais da planilha (podem ser úteis para o feedback)
      additionalData: {
        qtdPesqTelefone: data.qtdPesqTelefone,
        tickets: data.tickets,                      // # Tickets
        tmt: data.tmt,                              // TMT
        pesquisaTicket: data.pesquisaTicket,
        qtdPesqTicket: data.qtdPesqTicket,
        notaQualidade: data.notaQualidade,          // Nota qualidade
        qtdAvaliacoes: data.qtdAvaliacoes,          // Qtd Avaliações
        totalEscalado: data.totalEscalado,
        totalLogado: data.totalLogado,
        percentLogado: data.percentLogado,
        atrasos: data.atrasos,                      // Atrasos
        pausaEscalada: data.pausaEscalada,
        totalPausas: data.totalPausas,              // Total de pausas
        percentPausas: data.percentPausas,
        almocoEscalado: data.almocoEscalado,
        almocoRealizado: data.almocoRealizado,
        percentAlmoco: data.percentAlmoco,
        pausa10Escalada: data.pausa10Escalada,
        pausa10Realizado: data.pausa10Realizado,
        percentPausa10: data.percentPausa10,
        pausaBanheiro: data.pausaBanheiro,
        percentPausaBanheiro: data.percentPausaBanheiro,
        pausaFeedback: data.pausaFeedback,
        percentPausaFeedback: data.percentPausaFeedback,
        treinamento: data.treinamento,
        percentTreinamento: data.percentTreinamento,
      }
    };

    createLog(
      decodedOperatorName, 
      sheetName, 
      'Busca de indicadores da planilha', 
      'success', 
      `Indicadores buscados da planilha para ${decodedOperatorName}`
    );

    res.json(indicators);
  } catch (error) {
    console.error('Erro ao buscar indicadores da planilha:', error);
    console.error('Stack trace:', error.stack);
    
    createLog(null, null, 'Busca de indicadores da planilha', 'error', error.message);
    
    // Mensagens de erro mais amigáveis
    let errorMessage = error.message || 'Erro desconhecido';
    
    if (error.message?.includes('GOOGLE_CREDENTIALS') || error.message?.includes('não configurado')) {
      errorMessage = 'Credenciais do Google não configuradas. Verifique o arquivo .env e consulte CONFIGURACAO_GOOGLE_SHEETS.md';
    } else if (error.message?.includes('Permission denied') || error.message?.includes('403') || error.code === 403) {
      errorMessage = `Sem permissão para acessar a planilha. Verifique se a planilha foi compartilhada com o email ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL} como Editor.`;
    } else if (error.message?.includes('not found') || error.message?.includes('404') || error.code === 404) {
      errorMessage = 'Planilha ou aba não encontrada. Verifique se o ID da planilha está correto no .env e se a aba existe.';
    } else if (error.message?.includes('Unable to parse range')) {
      errorMessage = `Aba "${sheetName}" não encontrada na planilha. Verifique se a aba existe e se o nome está correto (OUT, NOV ou DEZ).`;
    } else if (error.message?.includes('Coluna')) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: 'Erro ao buscar indicadores da planilha', 
      details: errorMessage,
      originalError: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

