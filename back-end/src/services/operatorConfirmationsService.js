import supabase from './supabaseService.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Criar cliente Supabase com service role key para bypassar RLS
// Isso garante que operações do backend funcionem mesmo se RLS estiver habilitado
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wouqpkddfvksofnxgtff.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente com service role key (bypassa RLS)
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Usar cliente admin se disponível, senão usar o cliente padrão
const supabaseClient = supabaseAdmin || supabase;

/**
 * Serviço para gerenciar confirmações de operadores
 * Armazena se o operador compreendeu suas métricas/feedbacks e suas observações
 */

/**
 * Buscar confirmação por feedback_id
 * @param {number} feedbackId - ID do feedback
 * @returns {Promise<Object|null>} Confirmação ou null
 */
export const getOperatorConfirmationByFeedbackId = async (feedbackId) => {
  if (!supabaseClient) {
    console.warn('⚠️ Supabase não configurado. Retornando null.');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('operator_confirmations')
      .select('*')
      .eq('feedback_id', feedbackId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar confirmação por feedback_id:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Erro ao buscar confirmação por feedback_id:', error);
    return null;
  }
};

/**
 * Buscar confirmação de um operador para um mês específico (DEPRECATED - usar getOperatorConfirmationByFeedbackId)
 * @param {string} email - Email do operador
 * @param {string} month - Mês (ex: "Dezembro", "Novembro", "Outubro")
 * @param {number} year - Ano
 * @returns {Promise<Object|null>} Confirmação ou null
 * @deprecated Use getOperatorConfirmationByFeedbackId instead
 */
export const getOperatorConfirmation = async (email, month, year) => {
  if (!supabaseClient) {
    console.warn('⚠️ Supabase não configurado. Retornando null.');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('operator_confirmations')
      .select('*')
      .eq('email', email)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar confirmação:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Erro ao buscar confirmação:', error);
    return null;
  }
};

/**
 * Salvar ou atualizar confirmação vinculada a um feedback específico
 * @param {number} feedbackId - ID do feedback
 * @param {string} email - Email do operador
 * @param {string} month - Mês
 * @param {number} year - Ano
 * @param {boolean} understood - Se o operador compreendeu
 * @param {string} observations - Observações do operador
 * @returns {Promise<Object>} Confirmação salva
 */
export const saveOperatorConfirmationByFeedbackId = async (feedbackId, email, month, year, understood, observations = '') => {
  if (!supabaseClient) {
    throw new Error('Supabase não configurado. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  }

  if (!feedbackId) {
    throw new Error('feedbackId é obrigatório');
  }

  console.log(`💾 saveOperatorConfirmationByFeedbackId chamado: feedbackId=${feedbackId}, email=${email}`);

  try {
    // Primeiro, verificar se já existe uma confirmação para este feedback_id
    const existingConfirmation = await getOperatorConfirmationByFeedbackId(feedbackId);
    console.log(`🔍 Confirmação existente encontrada:`, existingConfirmation ? 'SIM' : 'NÃO');
    
    const confirmationData = {
      feedback_id: feedbackId,
      email: email,
      month: month,
      year: year,
      understood: understood,
      observations: observations || '',
      updated_at: new Date().toISOString()
    };

    let data, error;
    
    if (existingConfirmation) {
      // Se já existe, fazer UPDATE
      console.log(`📝 Fazendo UPDATE da confirmação para feedback_id=${feedbackId}`);
      const result = await supabaseClient
        .from('operator_confirmations')
        .update(confirmationData)
        .eq('feedback_id', feedbackId)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Se não existe, fazer INSERT
      console.log(`➕ Fazendo INSERT da confirmação para feedback_id=${feedbackId}`);
      const result = await supabaseClient
        .from('operator_confirmations')
        .insert(confirmationData)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('❌ Erro ao salvar confirmação:', error);
      throw new Error(`Erro ao salvar confirmação: ${error.message}`);
    }

    console.log(`✅ Confirmação salva com sucesso para feedback_id=${feedbackId}`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao salvar confirmação:', error);
    throw error;
  }
};

/**
 * Salvar ou atualizar confirmação de um operador (DEPRECATED - usar saveOperatorConfirmationByFeedbackId)
 * @param {string} email - Email do operador
 * @param {string} month - Mês
 * @param {number} year - Ano
 * @param {boolean} understood - Se o operador compreendeu
 * @param {string} observations - Observações do operador
 * @returns {Promise<Object>} Confirmação salva
 * @deprecated Use saveOperatorConfirmationByFeedbackId instead
 */
export const saveOperatorConfirmation = async (email, month, year, understood, observations = '') => {
  if (!supabaseClient) {
    throw new Error('Supabase não configurado. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  }

  try {
    // Primeiro, verificar se já existe uma confirmação para este email/month/year
    const existingConfirmation = await getOperatorConfirmation(email, month, year);
    
    const confirmationData = {
      email: email,
      month: month,
      year: year,
      understood: understood,
      observations: observations || '',
      updated_at: new Date().toISOString()
    };

    let data, error;
    
    if (existingConfirmation) {
      // Se já existe, fazer UPDATE
      const result = await supabaseClient
        .from('operator_confirmations')
        .update(confirmationData)
        .eq('email', email)
        .eq('month', month)
        .eq('year', year)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Se não existe, fazer INSERT
      const result = await supabaseClient
        .from('operator_confirmations')
        .insert(confirmationData)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Erro ao salvar confirmação:', error);
      throw new Error(`Erro ao salvar confirmação: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar confirmação:', error);
    throw error;
  }
};

/**
 * Excluir confirmação por feedback_id
 * @param {number} feedbackId - ID do feedback
 * @returns {Promise<boolean>} True se excluído com sucesso
 */
export const deleteOperatorConfirmationByFeedbackId = async (feedbackId) => {
  if (!supabaseClient) {
    console.warn('⚠️ Supabase não configurado. Não é possível excluir confirmação.');
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('operator_confirmations')
      .delete()
      .eq('feedback_id', feedbackId);

    if (error) {
      console.error('Erro ao excluir confirmação por feedback_id:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir confirmação por feedback_id:', error);
    return false;
  }
};

/**
 * Excluir confirmação de um operador para um mês específico (DEPRECATED - usar deleteOperatorConfirmationByFeedbackId)
 * @param {string} email - Email do operador
 * @param {string} month - Mês
 * @param {number} year - Ano
 * @returns {Promise<boolean>} True se excluído com sucesso
 * @deprecated Use deleteOperatorConfirmationByFeedbackId instead
 */
export const deleteOperatorConfirmation = async (email, month, year) => {
  if (!supabaseClient) {
    console.warn('⚠️ Supabase não configurado. Não é possível excluir confirmação.');
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('operator_confirmations')
      .delete()
      .eq('email', email)
      .eq('month', month)
      .eq('year', year);

    if (error) {
      console.error('Erro ao excluir confirmação:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir confirmação:', error);
    return false;
  }
};

