import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para a pasta db.dados (na raiz do projeto)
// back-end/src/services -> back-end -> raiz -> db.dados
const DB_DADOS_PATH = path.resolve(__dirname, '../../..', 'db.dados');

/**
 * Lista todos os arquivos XLSX na pasta db.dados
 * @returns {Array<string>} - Lista de nomes de arquivos
 */
export const listXlsxFiles = () => {
  try {
    if (!fs.existsSync(DB_DADOS_PATH)) {
      console.warn(`⚠️ Pasta db.dados não encontrada em: ${DB_DADOS_PATH}`);
      return [];
    }

    const files = fs.readdirSync(DB_DADOS_PATH);
    return files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
  } catch (error) {
    console.error('❌ Erro ao listar arquivos XLSX:', error);
    return [];
  }
};

/**
 * Encontra o arquivo XLSX mais recente ou específico
 * @param {string} fileName - Nome do arquivo (opcional, se não informado pega o mais recente)
 * @returns {string|null} - Caminho completo do arquivo ou null
 */
export const findXlsxFile = (fileName = null) => {
  try {
    if (!fs.existsSync(DB_DADOS_PATH)) {
      throw new Error(`Pasta db.dados não encontrada em: ${DB_DADOS_PATH}`);
    }

    if (fileName) {
      const filePath = path.join(DB_DADOS_PATH, fileName);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
      throw new Error(`Arquivo ${fileName} não encontrado em db.dados`);
    }

    // Se não especificou arquivo, pega o mais recente
    const files = listXlsxFiles();
    if (files.length === 0) {
      throw new Error('Nenhum arquivo XLSX encontrado na pasta db.dados');
    }

    // Ordenar por data de modificação (mais recente primeiro)
    const filesWithStats = files.map(file => {
      const filePath = path.join(DB_DADOS_PATH, file);
      const stats = fs.statSync(filePath);
      return { file, path: filePath, mtime: stats.mtime };
    }).sort((a, b) => b.mtime - a.mtime);

    console.log(`📁 Usando arquivo: ${filesWithStats[0].file}`);
    return filesWithStats[0].path;
  } catch (error) {
    console.error('❌ Erro ao encontrar arquivo XLSX:', error);
    throw error;
  }
};

/**
 * Lê um arquivo XLSX e retorna todas as abas
 * @param {string} filePath - Caminho do arquivo XLSX
 * @returns {Object} - Objeto com as abas como chaves e dados como valores
 */
export const readXlsxFile = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const sheets = {};
    const sheetNames = [];

    workbook.eachSheet((worksheet, sheetId) => {
      const sheetName = worksheet.name;
      sheetNames.push(sheetName);
      
      const data = [];
      // Obter número máximo de colunas para garantir que todas sejam lidas
      let maxCols = 0;
      worksheet.eachRow((row) => {
        maxCols = Math.max(maxCols, row.cellCount);
      });
      
      worksheet.eachRow((row, rowNumber) => {
        const rowData = [];
        // Garantir que todas as colunas sejam processadas
        for (let col = 1; col <= maxCols; col++) {
          const cell = row.getCell(col);
          let value = cell.value;
          
          // Se a célula está vazia ou não existe
          if (!cell || value === null || value === undefined || value === '') {
            value = null;
          } else if (typeof value === 'string' && value.trim() === '') {
            value = null;
          } else if (value instanceof Date) {
            // Se for uma data/tempo do Excel, tentar usar o texto formatado primeiro
            const textValue = cell.text;
            if (textValue && /^\d{1,2}:\d{2}:\d{2}/.test(textValue.trim())) {
              // O texto já está formatado como tempo, usar ele
              const timeMatch = textValue.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})/);
              if (timeMatch) {
                const [, h, m, s] = timeMatch;
                value = [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
              } else {
                value = textValue.trim();
              }
            } else {
              // Converter Date para hh:mm:ss
              const numFmt = cell.numFmt;
              
              // Se o formato contém "h", "m" ou "s", é um tempo
              if (numFmt && (numFmt.includes('h') || numFmt.includes('m') || numFmt.includes('s'))) {
                // Converter para hh:mm:ss usando UTC para evitar problemas de timezone
                const hours = value.getUTCHours();
                const minutes = value.getUTCMinutes();
                const seconds = value.getUTCSeconds();
                value = [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
              } else {
                // Pode ser uma data com tempo, extrair apenas o tempo
                const hours = value.getUTCHours();
                const minutes = value.getUTCMinutes();
                const seconds = value.getUTCSeconds();
                
                // Se a data é 1899-12-30 ou similar (data base do Excel), é apenas tempo
                if (value.getUTCFullYear() === 1899 && value.getUTCMonth() === 11 && value.getUTCDate() === 30) {
                  value = [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
                } else {
                  // Tentar extrair tempo da data
                  value = [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
                }
              }
            }
          } else if (typeof value === 'object') {
            // Se for um objeto (formula, rich text, etc), pegar o texto
            if (value.text !== undefined) {
              value = value.text;
            } else if (value.result !== undefined) {
              value = value.result;
              // Se o resultado for Date, converter também
              if (value instanceof Date) {
                const hours = value.getUTCHours();
                const minutes = value.getUTCMinutes();
                const seconds = value.getUTCSeconds();
                value = [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
              }
            } else {
              // Tentar usar o texto formatado da célula
              value = cell.text || String(value);
            }
          } else if (typeof value === 'number') {
            // Para números, verificar o formato da célula
            const numFmt = cell.numFmt || '';
            
            // Se a célula tem formato de tempo, converter
            if (numFmt.includes('h') || numFmt.includes('m') || numFmt.includes('s')) {
              // É um número representando tempo (fração de dia)
              const totalSeconds = Math.round(value * 86400);
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              const seconds = totalSeconds % 60;
              value = [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
            } 
            // Se a célula tem formato de porcentagem, manter como número para processar depois
            // (será convertido na função parsePercentOriginal)
            // Não fazer nada aqui - será processado depois
            // Caso contrário, manter o número como está
          } else if (typeof value === 'string') {
            // Se já é uma string, verificar se está vazia ou é um tempo válido
            const trimmed = value.trim();
            if (trimmed === '' || trimmed === '-' || trimmed === '##' || trimmed === '#N/A' || trimmed === 'Em breve') {
              value = null;
            } else if (/^\d{1,3}:\d{2}:\d{2}$/.test(trimmed)) {
              // Já está no formato correto (pode ter mais de 24h como 128:00:00), manter
              value = trimmed;
            }
            // Caso contrário, manter a string como está (percentuais, etc)
          }
          
          rowData.push(value);
        }
        data.push(rowData);
      });
      
      sheets[sheetName] = data;
    });

    console.log(`✅ Arquivo XLSX lido com sucesso. Abas encontradas: ${sheetNames.join(', ')}`);
    return sheets;
  } catch (error) {
    console.error('❌ Erro ao ler arquivo XLSX:', error);
    throw error;
  }
};

/**
 * Busca dados de um operador específico em uma aba do arquivo XLSX
 * @param {string} sheetName - Nome da aba (OUT, NOV, DEZ)
 * @param {string} operatorName - Nome do operador
 * @param {string} fileName - Nome do arquivo XLSX (opcional)
 * @returns {Object|null} - Dados do operador ou null se não encontrado
 */
export const getOperatorDataFromXlsx = async (sheetName, operatorName, fileName = null) => {
  try {
    const filePath = findXlsxFile(fileName);
    
    // Ler o arquivo para acessar células individuais e pegar texto formatado
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(sheetName.toUpperCase());
    
    if (!worksheet) {
      throw new Error(`Aba "${sheetName.toUpperCase()}" não encontrada no arquivo.`);
    }
    
    // Encontrar a linha do operador
    let operatorRowNumber = null;
    const normalizedOperatorName = operatorName.trim().toLowerCase();
    console.log(`🔍 Procurando operador: "${operatorName}" (normalizado: "${normalizedOperatorName}")`);
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Pular cabeçalho
      const cell = row.getCell(1);
      const cellValue = cell.value;
      const cellText = cell.text;
      const cellValueStr = cellValue ? String(cellValue).trim().toLowerCase() : '';
      const cellTextStr = cellText ? String(cellText).trim().toLowerCase() : '';
      
      // Debug: mostrar primeiras linhas para verificar
      if (rowNumber <= 5) {
        console.log(`Linha ${rowNumber}: value="${cellValue}", text="${cellText}"`);
      }
      
      if (cellValueStr === normalizedOperatorName || cellTextStr === normalizedOperatorName) {
        operatorRowNumber = rowNumber;
        console.log(`✅ Operador encontrado na linha ${rowNumber}`);
        console.log(`   Valor da célula: "${cellValue}" / Texto: "${cellText}"`);
      }
    });
    
    if (!operatorRowNumber) {
      console.log(`⚠️ Operador "${operatorName}" não encontrado na aba "${sheetName.toUpperCase()}"`);
      return null;
    }
    
    const operatorRowFromSheet = worksheet.getRow(operatorRowNumber);
    
    // Obter cabeçalhos para debug - ler TODAS as colunas até a coluna 31 (AE)
    const headerRow = worksheet.getRow(1);
    const headers = [];
    for (let col = 1; col <= 31; col++) {
      const cell = headerRow.getCell(col);
      headers.push(cell.value || cell.text || '(vazio)');
    }
    
    console.log('=== DEBUG: Cabeçalhos da planilha ===');
    console.log('Total de cabeçalhos:', headers.length);
    console.log('Todos os cabeçalhos:', headers.map((h, idx) => `[${idx}]: ${h || '(vazio)'}`));
    
    // Debug: mostrar valores da linha do operador
    console.log('=== DEBUG: Valores da linha do operador ===');
    for (let col = 1; col <= 31; col++) {
      const cell = operatorRowFromSheet.getCell(col);
      const header = headers[col - 1] || `Coluna ${col}`;
      console.log(`[${col - 1}] ${header}: value="${cell.value}", text="${cell.text}"`);
    }

    // Mapear índices das colunas (mesma estrutura do Google Sheets)
    const columnMap = {
      operator: 0,           // Operadores
      calls: 1,              // # Ligações
      tma: 2,                // TMA
      qualityScore: 3,       // Pesq telefone
      qtdPesqTelefone: 4,    // Qtd pesq
      tickets: 5,            // # Tickets
      tmt: 6,                // TMT
      pesquisaTicket: 7,     // Pesquisa Ticket
      qtdPesqTicket: 8,      // Qtd pesq
      notaQualidade: 9,      // Nota qualidade
      qtdAvaliacoes: 10,     // Qtd Avaliações
      totalEscalado: 11,     // Total escalado
      totalLogado: 12,       // Total logado
      percentLogado: 13,     // % logado
      abs: 14,               // ABS
      atrasos: 15,           // Atrasos
      pausaEscalada: 16,     // Pausa escalada
      totalPausas: 17,       // Total de pausas
      percentPausas: 18,     // %
      almocoEscalado: 19,    // Almoço escalado
      almocoRealizado: 20,   // Almoço realizado
      percentAlmoco: 21,     // %
      pausa10Escalada: 22,   // Pausa 10 escalada
      pausa10Realizado: 23,  // Pausa 10 realizado
      percentPausa10: 24,    // %
      pausaBanheiro: 25,     // Pausa banheiro
      percentPausaBanheiro: 26, // %
      pausaFeedback: 27,      // Pausa Feedback
      percentPausaFeedback: 28, // %
      treinamento: 29,       // Treinamento
      percentTreinamento: 30, // %
    };

    // Funções auxiliares de parsing (mesmas do Google Sheets)
    const parseInteger = (value) => {
      if (value === null || value === undefined || value === '' || value === '-') return null;
      if (typeof value === 'number') return Math.round(value);
      const str = String(value).replace(/[^\d-]/g, '');
      const num = parseInt(str, 10);
      return isNaN(num) ? null : num;
    };

    const parseDecimal = (value) => {
      if (value === null || value === undefined || value === '' || value === '-' || 
          String(value).includes('##') || String(value).includes('#N/A')) return null;
      if (typeof value === 'number') return value;
      const str = String(value).replace(/[^\d,.-]/g, '').replace(',', '.');
      const num = parseFloat(str);
      return isNaN(num) ? null : num;
    };

    const parseTime = (value, cellText = null) => {
      if (value === null || value === undefined || value === '' || value === '-' || 
          String(value).includes('##') || String(value).includes('#N/A') ||
          String(value).includes('Em breve') || String(value).trim() === 'Em breve') {
        return null;
      }
      
      // Se for um objeto Date (ExcelJS retorna tempos como Date)
      if (value instanceof Date) {
        // Excel armazena tempos como frações de dia a partir de 1899-12-30 00:00:00
        // O ExcelJS converte isso para um objeto Date
        // Para calcular horas totais, precisamos calcular a diferença em dias
        const excelEpoch = new Date(1899, 11, 30, 0, 0, 0); // 30 de dezembro de 1899 00:00:00
        const diffMs = value.getTime() - excelEpoch.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        // Calcular horas, minutos e segundos totais
        const totalHours = Math.floor(diffDays * 24);
        const remainingFraction = (diffDays * 24) - totalHours;
        const totalMinutes = Math.floor(remainingFraction * 60);
        const remainingSeconds = Math.round((remainingFraction * 60 - totalMinutes) * 60);
        
        // Formatar: se for >= 24 horas, manter formato hhh:mm:ss (sem padding nas horas)
        if (totalHours >= 24) {
          return `${totalHours}:${String(totalMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        } else {
          return [totalHours, totalMinutes, remainingSeconds].map(v => String(v).padStart(2, '0')).join(':');
        }
      }
      
      // Tentar converter número para tempo (se vier como fração de dia do Excel)
      if (typeof value === 'number') {
        // Se o número for muito pequeno (< 1), provavelmente é fração de dia
        if (value < 1 && value >= 0) {
          const totalSeconds = Math.round(value * 86400); // Excel armazena como fração de dia
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
        }
        // Se for um número grande, pode ser segundos totais
        if (value >= 86400) {
          const hours = Math.floor(value / 3600);
          const minutes = Math.floor((value % 3600) / 60);
          const seconds = Math.floor(value % 60);
          return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
        }
      }
      
      const strValue = String(value).trim();
      
      // Se já está no formato correto hh:mm:ss ou hhh:mm:ss (para tempos > 24h)
      if (/^\d{1,3}:\d{2}:\d{2}$/.test(strValue)) {
        // Validar e formatar corretamente
        const parts = strValue.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2], 10);
        
        if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds) && 
            minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60) {
          // Formatar horas com 2 dígitos (ou mais se > 99)
          const hStr = hours.toString().padStart(2, '0');
          const mStr = minutes.toString().padStart(2, '0');
          const sStr = seconds.toString().padStart(2, '0');
          return `${hStr}:${mStr}:${sStr}`;
        }
      }
      
      // Tentar extrair tempo de string que contenha padrão de tempo
      if (typeof value === 'string') {
        const timeMatch = strValue.match(/(\d{1,3}):(\d{2}):(\d{2})/);
        if (timeMatch) {
          const [, h, m, s] = timeMatch;
          const hours = parseInt(h, 10);
          const minutes = parseInt(m, 10);
          const seconds = parseInt(s, 10);
          if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
            return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
          }
        }
      }
      
      return null;
    };

    const parsePercentOriginal = (value, cellText = null) => {
      if (value === null || value === undefined || value === '' || value === '-' ||
          String(value).includes('##') || String(value).includes('#N/A') ||
          String(value).trim() === '##' || String(value).trim() === '#N/A') {
        return null;
      }
      
      // Se for número (ExcelJS retorna porcentagem como decimal: 1.1089 = 110.89%, 0.83 = 83%)
      if (typeof value === 'number') {
        // Se o número é >= 1, já está em formato de porcentagem (1.1089 = 110.89%)
        // Se o número é < 1, é fração decimal (0.83 = 83%)
        if (value >= 1) {
          // Já está em formato de porcentagem, converter para string com vírgula e %
          const percentValue = value.toFixed(2).replace('.', ',');
          return `${percentValue}%`;
        } else {
          // É fração decimal, multiplicar por 100
          const percentValue = (value * 100).toFixed(2).replace('.', ',');
          return `${percentValue}%`;
        }
      }
      
      // Se já é string, verificar se já tem %
      const str = String(value).trim();
      if (str === '##' || str === '#N/A') {
        return null;
      }
      
      // Se não tem %, pode ser um número como string, adicionar %
      if (!str.includes('%')) {
        // Tentar converter para número e formatar
        const numValue = parseFloat(str.replace(',', '.'));
        if (!isNaN(numValue)) {
          // Se o número é < 1, provavelmente é decimal (0.11089 = 11.089%)
          // Se o número é >= 1, provavelmente já está em porcentagem (110.89 = 110.89%)
          if (numValue < 1) {
            const percentValue = (numValue * 100).toFixed(2).replace('.', ',');
            return `${percentValue}%`;
          } else {
            // Já está em formato de porcentagem, só adicionar %
            const percentValue = numValue.toFixed(2).replace('.', ',');
            return `${percentValue}%`;
          }
        }
      }
      
      // Manter formato original da planilha (com % se tiver)
      return str;
    };

    // Extrair dados usando o mapeamento
    const data = {};
    
    console.log('=== DEBUG: Valores das células ===');
    
    for (const [key, index] of Object.entries(columnMap)) {
      // Usar índice baseado em 1 (ExcelJS usa base 1)
      // index é baseado em 0 (0, 1, 2...), então index + 1 = coluna Excel (1, 2, 3...)
      const excelCol = index + 1;
      const cell = operatorRowFromSheet.getCell(excelCol);
      const rawValue = cell.value;
      const cellText = cell.text; // Texto formatado da célula (já vem formatado pelo Excel)
      
      // Debug: mostrar o que está sendo lido
      console.log(`[${index}] ${key}: rawValue=${rawValue}, cellText="${cellText}", tipo=${typeof rawValue}`);
      
      if (key === 'operator') {
        data[key] = rawValue ? String(rawValue).trim() : null;
      } else if (['calls', 'qtdPesqTelefone', 'tickets', 'qtdPesqTicket', 'qtdAvaliacoes', 'abs', 'atrasos'].includes(key)) {
        data[key] = parseInteger(rawValue);
      } else if (['tma', 'tmt', 'totalEscalado', 'totalLogado', 'pausaEscalada', 'totalPausas', 
                   'almocoEscalado', 'almocoRealizado', 'pausa10Escalada', 'pausa10Realizado', 
                   'pausaBanheiro', 'pausaFeedback', 'treinamento'].includes(key)) {
        // Para tempos, converter diretamente do rawValue (que pode ser Date ou número)
        data[key] = parseTime(rawValue, cellText);
      } else if (['qualityScore', 'pesquisaTicket'].includes(key)) {
        data[key] = parseDecimal(rawValue);
      } else if (['notaQualidade', 'percentLogado', 'percentPausas', 'percentAlmoco', 
                   'percentPausa10', 'percentPausaBanheiro', 'percentPausaFeedback', 
                   'percentTreinamento'].includes(key)) {
        // Percentuais - converter do rawValue (que pode ser número decimal)
        // O ExcelJS retorna percentuais como números: 1.1089 = 110.89%, 0.83 = 83%
        data[key] = parsePercentOriginal(rawValue, cellText);
      } else {
        // Outros campos (caso tenha algum que não foi mapeado)
        data[key] = rawValue ? String(rawValue).trim() : null;
      }
    }

    console.log('=== DEBUG: Dados extraídos ===');
    console.log('Operador:', data.operator);
    console.log('Chamadas:', data.calls);
    console.log('TMA:', data.tma);
    console.log('Tickets:', data.tickets);
    console.log('Total Escalado:', data.totalEscalado);
    console.log('Total Logado:', data.totalLogado);
    console.log('% Logado:', data.percentLogado);
    console.log('Pausa Escalada:', data.pausaEscalada);
    console.log('Total Pausas:', data.totalPausas);
    console.log('% Pausas:', data.percentPausas);
    console.log('Pausa 10 Realizado:', data.pausa10Realizado);
    console.log('% Pausa 10:', data.percentPausa10);
    console.log('Pausa Banheiro:', data.pausaBanheiro);
    console.log('% Pausa Banheiro:', data.percentPausaBanheiro);
    console.log('Pausa Feedback:', data.pausaFeedback);
    console.log('% Pausa Feedback:', data.percentPausaFeedback);
    console.log('Treinamento:', data.treinamento);
    console.log('% Treinamento:', data.percentTreinamento);

    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do operador:', error);
    throw error;
  }
};

/**
 * Lista todos os operadores de uma aba específica
 * @param {string} sheetName - Nome da aba (OUT, NOV, DEZ)
 * @param {string} fileName - Nome do arquivo XLSX (opcional)
 * @returns {Array<string>} - Lista de nomes dos operadores
 */
export const listOperatorsFromXlsx = async (sheetName, fileName = null) => {
  try {
    const filePath = findXlsxFile(fileName);
    const sheets = await readXlsxFile(filePath);

    const normalizedSheetName = sheetName.toUpperCase();
    
    if (!sheets[normalizedSheetName]) {
      throw new Error(`Aba "${normalizedSheetName}" não encontrada. Abas disponíveis: ${Object.keys(sheets).join(', ')}`);
    }

    const rows = sheets[normalizedSheetName];
    if (!rows || rows.length === 0) {
      return [];
    }

    // Primeira linha são os cabeçalhos, então começamos da linha 1
    const operators = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row[0] && String(row[0]).trim()) {
        operators.push(String(row[0]).trim());
      }
    }

    console.log(`✅ ${operators.length} operadores encontrados na aba "${normalizedSheetName}"`);
    return operators;
  } catch (error) {
    console.error('❌ Erro ao listar operadores:', error);
    throw error;
  }
};
