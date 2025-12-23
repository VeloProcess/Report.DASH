import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DADOS_PATH = path.resolve(__dirname, '..', 'db.dados');

async function testRead() {
  try {
    // Encontrar arquivo mais recente
    const fs = await import('fs');
    const files = fs.readdirSync(DB_DADOS_PATH).filter(f => f.endsWith('.xlsx'));
    if (files.length === 0) {
      console.log('❌ Nenhum arquivo XLSX encontrado');
      return;
    }
    
    const filePath = path.join(DB_DADOS_PATH, files[0]);
    console.log(`📁 Lendo arquivo: ${files[0]}`);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Testar aba DEZ
    const worksheet = workbook.getWorksheet('DEZ');
    if (!worksheet) {
      console.log('❌ Aba DEZ não encontrada');
      return;
    }
    
    console.log('\n=== CABEÇALHOS ===');
    const headerRow = worksheet.getRow(1);
    for (let col = 1; col <= 31; col++) {
      const cell = headerRow.getCell(col);
      console.log(`[${col - 1}] ${cell.value || cell.text || '(vazio)'}`);
    }
    
    console.log('\n=== PRIMEIRA LINHA DE DADOS ===');
    const dataRow = worksheet.getRow(2);
    for (let col = 1; col <= 31; col++) {
      const cell = dataRow.getCell(col);
      const header = headerRow.getCell(col).value || headerRow.getCell(col).text || `Col ${col}`;
      console.log(`[${col - 1}] ${header}: value="${cell.value}", text="${cell.text}"`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testRead();


