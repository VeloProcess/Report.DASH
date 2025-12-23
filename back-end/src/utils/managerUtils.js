import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de emails de gestores
const MANAGER_EMAILS = [
  'emerson.jose@velotax.com.br',
  'anderson.silva@velotax.com.br',
  'caroline.santiago@velotax.com.br',
  'gabriel.araujo@velotax.com.br',
  'joao.silva@velotax.com.br',
  'nathalia.villanova@velotax.com.br',
  'nayara.ribeiro@velotax.com.br',
  'octavio.silva@velotax.com.br',
  'shirley.cunha@velotax.com.br',
  'vanessa.souza@velotax.com.br',
].map(email => email.toLowerCase().trim());

/**
 * Verifica se um email pertence a um gestor
 * @param {string} email - Email do usuário
 * @returns {boolean} True se for gestor
 */
export const isManager = (email) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return MANAGER_EMAILS.includes(normalizedEmail);
};

/**
 * Retorna a lista de emails de gestores
 * @returns {Array<string>} Lista de emails de gestores
 */
export const getManagerEmails = () => {
  return [...MANAGER_EMAILS];
};

