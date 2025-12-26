import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOperators } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Carrega o mapeamento de emails do arquivo send_email.JSON
 * @returns {Object} Objeto com mapeamento nome -> email
 */
const loadEmailMapping = () => {
  const possiblePaths = [
    path.join(__dirname, '../controllers/send_email.JSON'),
    path.join(process.cwd(), 'src/controllers/send_email.JSON'),
    path.join(process.cwd(), 'back-end/src/controllers/send_email.JSON'),
    path.join(__dirname, '../../src/controllers/send_email.JSON'),
  ];

  for (const emailMappingPath of possiblePaths) {
    try {
      if (fs.existsSync(emailMappingPath)) {
        const emailMappingContent = fs.readFileSync(emailMappingPath, 'utf-8');
        const parsed = JSON.parse(emailMappingContent);
        return parsed;
      }
    } catch (error) {
      console.error(`Erro ao carregar email mapping de ${emailMappingPath}:`, error.message);
    }
  }

  return {};
};

/**
 * Busca o nome do operador pelo email
 * @param {string} email - Email do operador
 * @returns {string|null} Nome do operador ou null se não encontrado
 */
export const getOperatorNameByEmail = (email) => {
  const emailMapping = loadEmailMapping();
  const normalizedEmail = email.toLowerCase().trim();
  
  // Buscar por email exato
  for (const [name, mappedEmail] of Object.entries(emailMapping)) {
    if (mappedEmail.toLowerCase().trim() === normalizedEmail) {
      return name;
    }
  }
  
  return null;
};

/**
 * Busca operador completo pelo email
 * @param {string} email - Email do operador
 * @returns {Object|null} Operador completo ou null se não encontrado
 */
export const getOperatorByEmail = (email) => {
  console.log(`🔍 Buscando operador por email: ${email}`);
  
  const operatorName = getOperatorNameByEmail(email);
  
  if (!operatorName) {
    console.log(`⚠️ Nome não encontrado em send_email.JSON para email: ${email}`);
    return null;
  }
  
  console.log(`✅ Nome encontrado em send_email.JSON: "${operatorName}"`);
  
  const operators = getOperators();
  console.log(`📊 Total de operadores no banco: ${operators.length}`);
  
  // Normalizar nome para busca
  const normalizedName = operatorName.toLowerCase().trim();
  
  // Tentar busca exata primeiro
  let operator = operators.find(op => {
    const opName = op.name?.toLowerCase().trim();
    return opName === normalizedName;
  });
  
  if (operator) {
    console.log(`✅ Operador encontrado (busca exata): ID ${operator.id} - "${operator.name}"`);
    return operator;
  }
  
  // Tentar busca parcial (contém)
  operator = operators.find(op => {
    const opName = op.name?.toLowerCase().trim();
    return opName && (opName.includes(normalizedName) || normalizedName.includes(opName));
  });
  
  if (operator) {
    console.log(`✅ Operador encontrado (busca parcial): ID ${operator.id} - "${operator.name}"`);
    return operator;
  }
  
  // Tentar buscar por palavras-chave (primeiro e último nome)
  const nameParts = normalizedName.split(' ').filter(p => p.length > 2);
  if (nameParts.length > 0) {
    operator = operators.find(op => {
      const opName = op.name?.toLowerCase().trim();
      if (!opName) return false;
      
      // Verificar se pelo menos 2 palavras-chave coincidem
      const matchingParts = nameParts.filter(part => opName.includes(part));
      return matchingParts.length >= Math.min(2, nameParts.length);
    });
    
    if (operator) {
      console.log(`✅ Operador encontrado (busca por palavras-chave): ID ${operator.id} - "${operator.name}"`);
      return operator;
    }
  }
  
  console.log(`❌ Operador não encontrado em operators.json para nome: "${operatorName}"`);
  console.log(`📋 Nomes disponíveis no banco (primeiros 10):`, operators.slice(0, 10).map(o => o.name));
  
  return null;
};

/**
 * Busca o email do operador pelo ID
 * @param {number|string} operatorId - ID do operador
 * @returns {string|null} Email do operador ou null se não encontrado
 */
export const getOperatorEmailById = (operatorId) => {
  const operators = getOperators();
  const operator = operators.find(op => op.id === parseInt(operatorId));
  
  if (!operator) {
    return null;
  }
  
  // Buscar email no send_email.JSON pelo nome do operador
  const emailMapping = loadEmailMapping();
  const operatorName = operator.name;
  
  // Buscar email pelo nome
  for (const [name, email] of Object.entries(emailMapping)) {
    if (name.toLowerCase().trim() === operatorName.toLowerCase().trim()) {
      return email;
    }
  }
  
  // Se não encontrou no mapping, verificar se o operador tem email direto
  if (operator.email) {
    return operator.email;
  }
  
  return null;
};

/**
 * Valida se um operadorId pertence ao email autenticado
 * @param {string} email - Email autenticado
 * @param {number|string} operatorId - ID do operador a validar
 * @returns {boolean} True se o operadorId pertence ao email
 */
export const validateOperatorAccess = (email, operatorId) => {
  const operator = getOperatorByEmail(email);
  
  if (!operator) {
    return false;
  }
  
  return operator.id === parseInt(operatorId);
};

