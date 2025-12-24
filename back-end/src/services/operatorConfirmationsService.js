import supabase from './supabaseService.js';

/**
 * Serviço para gerenciar confirmações de operadores
 * Armazena se o operador compreendeu suas métricas/feedbacks e suas observações
 */

/**
 * Buscar confirmação de um operador para um mês específico
 * @param {string} email - Email do operador
 * @param {string} month - Mês (ex: "Dezembro", "Novembro", "Outubro")
 * @param {number} year - Ano
 * @returns {Promise<Object|null>} Confirmação ou null
 */
export const getOperatorConfirmation = async (email, month, year) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando null.');
    return null;
  }

  try {
    const { data, error } = await supabase
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
 * Salvar ou atualizar confirmação de um operador
 * @param {string} email - Email do operador
 * @param {string} month - Mês
 * @param {number} year - Ano
 * @param {boolean} understood - Se o operador compreendeu
 * @param {string} observations - Observações do operador
 * @returns {Promise<Object>} Confirmação salva
 */
export const saveOperatorConfirmation = async (email, month, year, understood, observations = '') => {
  if (!supabase) {
    throw new Error('Supabase não configurado. Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env');
  }

  try {
    const confirmationData = {
      email: email,
      month: month,
      year: year,
      understood: understood,
      observations: observations || '',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('operator_confirmations')
      .upsert(confirmationData, {
        onConflict: 'email,month,year',
        ignoreDuplicates: false
      })
      .select()
      .single();

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

