import { 
  getOperatorDataFromXlsx, 
  listOperatorsFromXlsx 
} from '../services/xlsxService.js';
import { createLog } from '../services/logService.js';

/**
 * Busca dados de um operador específico na planilha do Google Sheets
 */
export const getOperatorData = async (req, res) => {
  try {
    const { sheetName, operatorName, fileName } = req.query;

    if (!sheetName || !operatorName) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios: sheetName, operatorName' 
      });
    }

    // Validar nome da aba (OUT, NOV, DEZ)
    const validSheets = ['OUT', 'NOV', 'DEZ'];
    if (!validSheets.includes(sheetName.toUpperCase())) {
      return res.status(400).json({ 
        error: 'sheetName deve ser uma das seguintes: OUT, NOV, DEZ' 
      });
    }

    const data = await getOperatorDataFromXlsx(
      sheetName.toUpperCase(), 
      operatorName,
      fileName || null
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
    const { sheetName, fileName } = req.query;

    if (!sheetName) {
      return res.status(400).json({ 
        error: 'Parâmetro obrigatório: sheetName' 
      });
    }

    // Validar nome da aba (OUT, NOV, DEZ)
    const validSheets = ['OUT', 'NOV', 'DEZ'];
    if (!validSheets.includes(sheetName.toUpperCase())) {
      return res.status(400).json({ 
        error: 'sheetName deve ser uma das seguintes: OUT, NOV, DEZ' 
      });
    }

    const operators = await listOperatorsFromXlsx(
      sheetName.toUpperCase(),
      fileName || null
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
    const { sheetName, operatorName, fileName } = req.query;

    console.log('Busca de indicadores:', { sheetName, operatorName, fileName });

    if (!sheetName || !operatorName) {
      return res.status(400).json({ 
        error: 'Parâmetros obrigatórios: sheetName, operatorName' 
      });
    }

    // Decodificar o nome do operador (pode vir com + ou %20)
    const decodedOperatorName = decodeURIComponent(operatorName.replace(/\+/g, ' '));
    console.log('Nome do operador decodificado:', decodedOperatorName);

    const data = await getOperatorDataFromXlsx(
      sheetName.toUpperCase(), 
      decodedOperatorName,
      fileName || null
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
    
    if (error.message?.includes('db.dados') || error.message?.includes('não encontrada')) {
      errorMessage = 'Pasta db.dados não encontrada ou arquivo XLSX não encontrado. Verifique se a pasta existe na raiz do projeto e se contém um arquivo .xlsx';
    } else if (error.message?.includes('Aba') && error.message?.includes('não encontrada')) {
      errorMessage = `Aba "${sheetName}" não encontrada no arquivo. Verifique se a aba existe e se o nome está correto (OUT, NOV ou DEZ).`;
    } else if (error.message?.includes('Operador') && error.message?.includes('não encontrado')) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: 'Erro ao buscar indicadores da planilha', 
      details: errorMessage,
      originalError: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

