import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Configuração do cliente de autenticação
const getAuthClient = async () => {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  
  if (!serviceAccountEmail) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL não configurado no .env');
  }

  // Para service account, precisamos do arquivo JSON de credenciais
  // Vamos tentar ler do .env como JSON string ou de um arquivo
  let credentials;
  
  try {
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      // Se as credenciais estão no .env como JSON string
      let jsonString = process.env.GOOGLE_CREDENTIALS_JSON.trim();
      
      // Remover aspas extras se o JSON estiver entre aspas
      if ((jsonString.startsWith('"') && jsonString.endsWith('"')) || 
          (jsonString.startsWith("'") && jsonString.endsWith("'"))) {
        jsonString = jsonString.slice(1, -1);
      }
      
      // Tentar fazer parse do JSON
      try {
        credentials = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError.message);
        console.error('Primeiros caracteres do JSON:', jsonString.substring(0, 100));
        throw new Error(`Erro ao processar credenciais JSON: ${parseError.message}. Verifique se o JSON está em uma única linha e sem aspas extras no .env`);
      }
    } else if (process.env.GOOGLE_CREDENTIALS_PATH) {
      // Se o caminho do arquivo JSON está no .env
      const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH;
      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`Arquivo de credenciais não encontrado: ${credentialsPath}`);
      }
      const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
      try {
        credentials = JSON.parse(credentialsContent);
      } catch (parseError) {
        throw new Error(`Erro ao processar arquivo JSON: ${parseError.message}`);
      }
    } else {
      throw new Error('GOOGLE_CREDENTIALS_JSON ou GOOGLE_CREDENTIALS_PATH deve estar configurado no .env. Consulte CONFIGURACAO_GOOGLE_SHEETS.md para mais informações.');
    }

    if (!credentials.private_key) {
      throw new Error('Chave privada (private_key) não encontrada nas credenciais');
    }

    // Processar a chave privada corretamente
    let privateKey = credentials.private_key;
    
    // Se a chave está com escape duplo (\\n), converter para quebra de linha real
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Garantir que a chave começa e termina corretamente
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      console.error('⚠️ Formato da chave privada pode estar incorreto');
    }

    console.log('🔑 Chave privada processada. Tamanho:', privateKey.length, 'caracteres');
    console.log('📧 Usando email:', credentials.client_email || serviceAccountEmail);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email || serviceAccountEmail,
        private_key: privateKey,
        project_id: credentials.project_id,
        client_id: credentials.client_id,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return auth;
  } catch (error) {
    if (error.message.includes('JSON')) {
      throw new Error(`Erro ao processar credenciais JSON: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Busca dados de um operador específico em uma aba da planilha
 * @param {string} spreadsheetId - ID da planilha do Google Sheets
 * @param {string} sheetName - Nome da aba (OUT, NOV, DEZ)
 * @param {string} operatorName - Nome do operador
 * @returns {Object|null} - Dados do operador ou null se não encontrado
 */
export const getOperatorDataFromSheet = async (spreadsheetId, sheetName, operatorName) => {
  try {
    if (!spreadsheetId) {
      throw new Error('ID da planilha não fornecido. Configure GOOGLE_SPREADSHEET_ID no .env');
    }

    const auth = await getAuthClient();
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Buscar todos os dados da aba
    let response;
    try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A:AE`, // Buscar todas as colunas até AE (31 colunas)
        });
    } catch (apiError) {
      if (apiError.code === 403 || apiError.message?.includes('Permission denied')) {
        throw new Error(`Sem permissão para acessar a planilha. Verifique se a planilha foi compartilhada com ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL} como Editor.`);
      } else if (apiError.code === 404 || apiError.message?.includes('not found')) {
        throw new Error(`Planilha ou aba "${sheetName}" não encontrada. Verifique se o ID da planilha está correto e se a aba existe.`);
      } else if (apiError.message?.includes('Unable to parse range')) {
        throw new Error(`Aba "${sheetName}" não encontrada na planilha. Verifique se a aba existe e se o nome está correto (OUT, NOV ou DEZ).`);
      }
      throw new Error(`Erro ao acessar a planilha: ${apiError.message || apiError.code}`);
    }

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return null;
    }

    // Primeira linha são os cabeçalhos
    const headers = rows[0];
    
    // Log temporário para debug
    console.log('=== DEBUG: Cabeçalhos da planilha ===');
    console.log('Total de cabeçalhos:', headers.length);
    console.log('Todos os cabeçalhos:', headers.map((h, idx) => `[${idx}]: ${h || '(vazio)'}`));
    
    // Verificar se a estrutura está correta
    if (!headers || headers.length < 15) {
      throw new Error('Estrutura da planilha inválida. Verifique se as colunas estão na ordem correta.');
    }

    // Mapear índices das colunas pela ordem EXATA da planilha conforme cabeçalhos REAIS:
    // 0: Operadores, 1: # Ligações, 2: TMA, 3: Pesq telefone, 4: Qtd pesq,
    // 5: # Tickets, 6: TMT, 7: Pesquisa Ticket, 8: Qtd pesq, 9: Nota qualidade,
    // 10: Qtd Avaliações, 11: Total escalado, 12: Total logado, 13: % logado,
    // 14: ABS, 15: Atrasos, 16: Pausa escalada, 17: Total de pausas, 18: %,
    // 19: Almoço escalado, 20: Almoço realizado, 21: %,
    // 22: Pausa 10 escalada, 23: Pausa 10 realizado, 24: %,
    // 25: Pausa banheiro, 26: %, 27: Pausa Feedback, 28: %, 29: Treinamento, 30: %
    const columnMap = {
      operator: 0,           // Operadores - texto
      calls: 1,              // # Ligações - numero inteiro
      tma: 2,                // TMA - hh:mm:ss
      qualityScore: 3,       // Pesq telefone - 0,00 (formato brasileiro)
      qtdPesqTelefone: 4,    // Qtd pesq - numero inteiro
      tickets: 5,            // # Tickets - numero inteiro
      tmt: 6,                // TMT - hh:mm:ss
      pesquisaTicket: 7,     // Pesquisa Ticket - 0,00 (formato brasileiro)
      qtdPesqTicket: 8,      // Qtd pesq - numero inteiro
      notaQualidade: 9,      // Nota qualidade - % (formato brasileiro)
      qtdAvaliacoes: 10,     // Qtd Avaliações - numero inteiro
      totalEscalado: 11,     // Total escalado - hh:mm:ss
      totalLogado: 12,       // Total logado - hh:mm:ss
      percentLogado: 13,     // % logado - %
      abs: 14,               // ABS - numero inteiro
      atrasos: 15,           // Atrasos - numero inteiro
      pausaEscalada: 16,     // Pausa escalada - hh:mm:ss
      totalPausas: 17,       // Total de pausas - hh:mm:ss
      percentPausas: 18,     // % - %
      almocoEscalado: 19,    // Almoço escalado - hh:mm:ss
      almocoRealizado: 20,   // Almoço realizado - hh:mm:ss
      percentAlmoco: 21,     // % - %
      pausa10Escalada: 22,   // Pausa 10 escalada - hh:mm:ss
      pausa10Realizado: 23,  // Pausa 10 realizado - hh:mm:ss
      percentPausa10: 24,    // % - %
      pausaBanheiro: 25,     // Pausa banheiro - hh:mm:ss
      percentPausaBanheiro: 26, // % (após Pausa banheiro) - %
      pausaFeedback: 27,     // Pausa Feedback - hh:mm:ss
      percentPausaFeedback: 28, // % (após Pausa Feedback) - %
      treinamento: 29,       // Treinamento - hh:mm:ss
      percentTreinamento: 30, // % (após Treinamento) - %
    };

    // Procurar o operador na planilha
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Log temporário para debug - primeira linha de dados
      if (i === 1) {
        console.log('=== DEBUG: Primeira linha de dados ===');
        console.log('Total de colunas na linha:', row.length);
        console.log('Valores da linha:', row.map((val, idx) => `[${idx}]: ${val || '(vazio)'}`));
      }
      
      const rowOperatorName = row[columnMap.operator]?.toString().trim();
      
      if (rowOperatorName && rowOperatorName.toLowerCase() === operatorName.toLowerCase()) {
        // Converter valores para números inteiros
        const parseInteger = (value) => {
          if (!value || value === '') return null;
          const num = parseInt(value.toString().replace(',', '.').trim());
          return isNaN(num) ? null : num;
        };

        // Converter valores para números decimais (formato brasileiro 0,00)
        const parseDecimal = (value) => {
          if (!value || value === '') return null;
          const num = parseFloat(value.toString().replace(',', '.').trim());
          return isNaN(num) ? null : num;
        };

        // Converter valores para números quando apropriado (sem remover %)
        const parseNumber = (value) => {
          if (!value || value === '') return null;
          const num = parseFloat(value.toString().replace(',', '.').trim());
          return isNaN(num) ? null : num;
        };

        // Converter porcentagem (remove % e converte para número) - formato brasileiro 0,00
        const parsePercent = (value) => {
          if (!value || value === '') return null;
          const num = parseFloat(value.toString().replace(',', '.').replace('%', '').trim());
          return isNaN(num) ? null : num;
        };

        // Manter formato original da planilha (com % se tiver)
        const parsePercentOriginal = (value) => {
          if (value === null || value === undefined || value === '') return null;
          const strValue = value.toString().trim();
          // Tratar valores inválidos ou placeholders
          if (strValue === '' || strValue === '-' || strValue === '0' || strValue === '0%' || strValue === '0,00%' || 
              strValue === '##' || strValue === '#N/A' || strValue === '#VALUE!' || strValue === '#REF!' || 
              strValue === '#DIV/0!' || strValue === '#NAME?' || strValue === '#NULL!' || strValue === '#NUM!') {
            return null;
          }
          return strValue;
        };

        // Manter formato original para campos de tempo ou texto (hh:mm:ss ou texto)
        const parseTime = (value) => {
          if (value === null || value === undefined || value === '') return null;
          const strValue = value.toString().trim();
          if (strValue === '' || strValue === '-') return null;
          return strValue;
        };

        return {
          operatorName: rowOperatorName,
          // Campos principais para indicadores do sistema
          calls: parseInteger(row[columnMap.calls]),                    // # Ligações (coluna 1) - numero inteiro
          tma: parseTime(row[columnMap.tma]),                          // TMA (coluna 2) - hh:mm:ss
          qualityScore: parseDecimal(row[columnMap.qualityScore]),      // Pesq telefone (coluna 3) - 0,00 (formato brasileiro)
          abs: parseInteger(row[columnMap.abs]),                        // ABS (coluna 14) - numero inteiro
          // Todos os outros campos da planilha
          qtdPesqTelefone: parseInteger(row[columnMap.qtdPesqTelefone]), // Qtd pesq (coluna 4) - numero inteiro
          tickets: parseInteger(row[columnMap.tickets]),                // # Tickets (coluna 5) - numero inteiro
          tmt: parseTime(row[columnMap.tmt]),                          // TMT (coluna 6) - hh:mm:ss
          pesquisaTicket: parseDecimal(row[columnMap.pesquisaTicket]),  // Pesquisa Ticket (coluna 7) - 0,00 (formato brasileiro)
          qtdPesqTicket: parseInteger(row[columnMap.qtdPesqTicket]),   // Qtd pesq (coluna 8) - numero inteiro
          notaQualidade: parsePercentOriginal(row[columnMap.notaQualidade]), // Nota qualidade (coluna 9) - %
          qtdAvaliacoes: parseInteger(row[columnMap.qtdAvaliacoes]),   // Qtd Avaliações (coluna 10) - numero inteiro
          totalEscalado: parseTime(row[columnMap.totalEscalado]),     // Total escalado (coluna 11) - hh:mm:ss
          totalLogado: parseTime(row[columnMap.totalLogado]),         // Total logado (coluna 12) - hh:mm:ss
          percentLogado: parsePercentOriginal(row[columnMap.percentLogado]), // % logado (coluna 13) - %
          atrasos: parseInteger(row[columnMap.atrasos]),                // Atrasos (coluna 15) - numero inteiro
          pausaEscalada: parseTime(row[columnMap.pausaEscalada]),     // Pausa escalada (coluna 16) - hh:mm:ss
          totalPausas: parseTime(row[columnMap.totalPausas]),         // Total de pausas (coluna 17) - hh:mm:ss
          percentPausas: parsePercentOriginal(row[columnMap.percentPausas]), // % (coluna 18) - %
          almocoEscalado: parseTime(row[columnMap.almocoEscalado]),   // Almoço escalado (coluna 19) - hh:mm:ss
          almocoRealizado: parseTime(row[columnMap.almocoRealizado]), // Almoço realizado (coluna 20) - hh:mm:ss
          percentAlmoco: parsePercentOriginal(row[columnMap.percentAlmoco]), // % (coluna 21) - %
          pausa10Escalada: parseTime(row[columnMap.pausa10Escalada]), // Pausa 10 escalada (coluna 22) - hh:mm:ss
          pausa10Realizado: parseTime(row[columnMap.pausa10Realizado]), // Pausa 10 realizado (coluna 23) - hh:mm:ss
          percentPausa10: parsePercentOriginal(row[columnMap.percentPausa10]), // % (coluna 24) - %
          pausaBanheiro: parseTime(row[columnMap.pausaBanheiro]),     // Pausa banheiro (coluna 25) - hh:mm:ss
          percentPausaBanheiro: parsePercentOriginal(row[columnMap.percentPausaBanheiro]), // % (coluna 26) - %
          pausaFeedback: parseTime(row[columnMap.pausaFeedback]),     // Pausa Feedback (coluna 27) - hh:mm:ss
          percentPausaFeedback: parsePercentOriginal(row[columnMap.percentPausaFeedback]), // % (coluna 28) - %
          treinamento: parseTime(row[columnMap.treinamento]),         // Treinamento (coluna 29) - hh:mm:ss
          percentTreinamento: parsePercentOriginal(row[columnMap.percentTreinamento]), // % (coluna 30) - %
        };
      }
    }

    return null; // Operador não encontrado
  } catch (error) {
    console.error('Erro ao buscar dados da planilha:', error);
    // Se já é um erro formatado, apenas relançar
    if (error.message && (error.message.includes('permissão') || error.message.includes('não encontrada') || error.message.includes('Credenciais'))) {
      throw error;
    }
    // Caso contrário, criar uma mensagem mais amigável
    throw new Error(`Erro ao buscar dados da planilha: ${error.message || 'Erro desconhecido'}`);
  }
};

/**
 * Lista todos os operadores disponíveis em uma aba da planilha
 * @param {string} spreadsheetId - ID da planilha do Google Sheets
 * @param {string} sheetName - Nome da aba (OUT, NOV, DEZ)
 * @returns {Array} - Lista de nomes dos operadores
 */
export const listOperatorsFromSheet = async (spreadsheetId, sheetName) => {
  try {
    if (!spreadsheetId) {
      throw new Error('ID da planilha não fornecido. Configure GOOGLE_SPREADSHEET_ID no .env');
    }

    const auth = await getAuthClient();
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`, // Buscar apenas a coluna A (Operadores)
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return [];
    }

    // Remover cabeçalho e retornar lista de operadores
    return rows.slice(1)
      .map(row => row[0]?.toString().trim())
      .filter(name => name && name !== '');
  } catch (error) {
    console.error('Erro ao listar operadores da planilha:', error);
    throw error;
  }
};

