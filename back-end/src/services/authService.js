import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getOperatorByEmail } from '../utils/operatorUtils.js';
import { isManager } from '../utils/managerUtils.js';

dotenv.config();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

/**
 * Valida token Google OAuth e retorna informações do usuário
 * @param {string} token - Token Google OAuth
 * @returns {Promise<Object>} Informações do usuário { email, name, picture }
 */
export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload.email) {
      throw new Error('Email não encontrado no token Google');
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Erro ao validar token Google:', error);
    throw new Error('Token Google inválido ou expirado');
  }
};

/**
 * Busca operador pelo email e valida se existe
 * @param {string} email - Email do operador
 * @returns {Object|null} Operador encontrado ou null
 */
export const findOperatorByEmail = (email) => {
  const operator = getOperatorByEmail(email);
  
  if (!operator) {
    console.warn(`⚠️ Tentativa de acesso com email não cadastrado: ${email}`);
    return null;
  }
  
  return operator;
};

/**
 * Cria token JWT para sessão
 * @param {Object} userData - Dados do usuário { email, operatorId, operatorName }
 * @returns {string} Token JWT
 */
export const createSessionToken = (userData) => {
  // Verificar se é gestor (com tratamento de erro caso isManager não esteja disponível)
  let managerStatus = false;
  try {
    managerStatus = isManager(userData.email);
  } catch (error) {
    console.error('⚠️ Erro ao verificar status de gestor no token:', error);
    managerStatus = false; // Por padrão, não é gestor
  }
  
  return jwt.sign(
    {
      email: userData.email,
      operatorId: userData.operatorId,
      operatorName: userData.operatorName,
      isManager: managerStatus,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Verifica e decodifica token JWT
 * @param {string} token - Token JWT
 * @returns {Object|null} Dados do usuário ou null se inválido
 */
export const verifySessionToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token de sessão:', error);
    return null;
  }
};

/**
 * Processa login completo: valida token Google, busca operador e cria sessão
 * @param {string} googleToken - Token Google OAuth
 * @returns {Promise<Object>} { token, user: { email, operatorId, operatorName } }
 */
export const processLogin = async (googleToken) => {
  try {
    // Validar token Google
    const googleUser = await verifyGoogleToken(googleToken);
    
    console.log(`🔐 Processando login para email: ${googleUser.email}`);
    
    // Buscar operador pelo email
    const operator = findOperatorByEmail(googleUser.email);
    
    // Permitir login mesmo sem operador cadastrado (mas sem dados)
    let operatorId = null;
    let operatorName = googleUser.name || googleUser.email.split('@')[0];
    
    if (operator) {
      operatorId = operator.id;
      operatorName = operator.name;
      console.log(`✅ Operador encontrado: ID ${operatorId} - "${operatorName}"`);
    } else {
      console.log(`⚠️ Operador não encontrado, mas permitindo login para: ${googleUser.email}`);
      // Criar um ID temporário baseado no email para manter compatibilidade
      operatorId = 0; // ID especial para operadores não cadastrados
    }
    
    // Verificar se é gestor (com tratamento de erro caso isManager não esteja disponível)
    let managerStatus = false;
    try {
      managerStatus = isManager(googleUser.email);
    } catch (error) {
      console.error('⚠️ Erro ao verificar status de gestor:', error);
      managerStatus = false; // Por padrão, não é gestor
    }
    
    // Criar token de sessão
    const sessionToken = createSessionToken({
      email: googleUser.email,
      operatorId: operatorId,
      operatorName: operatorName,
    });
    
    return {
      token: sessionToken,
      user: {
        email: googleUser.email,
        operatorId: operatorId,
        operatorName: operatorName,
        name: operatorName,
        position: operator?.position || null,
        team: operator?.team || null,
        hasOperatorData: !!operator,
        isManager: managerStatus,
      },
    };
  } catch (error) {
    console.error('❌ Erro completo no processLogin:', error);
    throw error;
  }
};

