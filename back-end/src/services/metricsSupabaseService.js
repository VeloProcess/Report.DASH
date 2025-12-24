import supabase from './supabaseService.js';

/**
 * Serviço para gerenciar métricas no Supabase
 * Todas as funções garantem isolamento por email do operador autenticado
 */

// ============================================
// Métricas Atuais
// ============================================

/**
 * Buscar métricas atuais de um operador
 * @param {string} email - Email do operador (sempre do token, nunca do frontend)
 * @returns {Promise<Array>} Array de métricas
 */
export const getMetrics = async (email) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando array vazio.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('email', email)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar métricas do Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return [];
  }
};

/**
 * Buscar uma métrica específica por tipo
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica (ex: 'chamadas', 'tickets', 'qualidade', 'pausas')
 * @returns {Promise<Object|null>} Métrica ou null
 */
export const getMetricByType = async (email, metricType) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando null.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('email', email)
      .eq('metric_type', metricType)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum resultado encontrado (normal)
        return null;
      }
      console.error('Erro ao buscar métrica do Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar métrica:', error);
    return null;
  }
};

/**
 * Salvar ou atualizar uma métrica
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica
 * @param {Object} metricValue - Valor da métrica (JSONB)
 * @returns {Promise<Object>} Métrica salva
 */
export const saveMetric = async (email, metricType, metricValue) => {
  if (!supabase) {
    throw new Error('Supabase não configurado. Configure SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY no .env');
  }

  try {
    const { data, error } = await supabase
      .from('metrics')
      .upsert({
        email: email,
        metric_type: metricType,
        metric_value: metricValue,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email,metric_type',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar métrica no Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar métrica:', error);
    throw error;
  }
};

/**
 * Salvar múltiplas métricas de uma vez
 * @param {string} email - Email do operador
 * @param {Array<{type: string, value: Object}>} metrics - Array de métricas
 * @returns {Promise<Array>} Métricas salvas
 */
export const saveMultipleMetrics = async (email, metrics) => {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  try {
    const metricsToSave = metrics.map(m => ({
      email: email,
      metric_type: m.type,
      metric_value: m.value,
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('metrics')
      .upsert(metricsToSave, {
        onConflict: 'email,metric_type',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Erro ao salvar múltiplas métricas no Supabase:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao salvar múltiplas métricas:', error);
    throw error;
  }
};

// ============================================
// Histórico de Métricas
// ============================================

/**
 * Buscar histórico de métricas de um operador
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica (opcional)
 * @param {Date} startDate - Data inicial (opcional)
 * @param {Date} endDate - Data final (opcional)
 * @returns {Promise<Array>} Array de histórico
 */
export const getMetricsHistory = async (email, metricType = null, startDate = null, endDate = null) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando array vazio.');
    return [];
  }

  try {
    let query = supabase
      .from('metrics_history')
      .select('*')
      .eq('email', email)
      .order('snapshot_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    if (startDate) {
      query = query.gte('snapshot_date', startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte('snapshot_date', endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar histórico de métricas do Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico de métricas:', error);
    return [];
  }
};

/**
 * Criar snapshot de métricas no histórico
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica
 * @param {Object} metricValue - Valor da métrica
 * @param {Date} snapshotDate - Data do snapshot (padrão: hoje)
 * @returns {Promise<Object>} Snapshot criado
 */
export const createMetricsSnapshot = async (email, metricType, metricValue, snapshotDate = null) => {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  try {
    const date = snapshotDate || new Date();
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('metrics_history')
      .insert({
        email: email,
        metric_type: metricType,
        metric_value: metricValue,
        snapshot_date: dateStr
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar snapshot no Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar snapshot:', error);
    throw error;
  }
};

// ============================================
// Checks de Métricas
// ============================================

/**
 * Buscar checks de métricas de um operador
 * @param {string} email - Email do operador
 * @returns {Promise<Array>} Array de checks
 */
export const getMetricChecks = async (email) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando array vazio.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('metric_checks')
      .select('*')
      .eq('email', email)
      .order('check_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar checks do Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar checks:', error);
    return [];
  }
};

/**
 * Buscar check de uma métrica específica
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica
 * @returns {Promise<Object|null>} Check ou null
 */
export const getMetricCheck = async (email, metricType) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando null.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('metric_checks')
      .select('*')
      .eq('email', email)
      .eq('metric_type', metricType)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erro ao buscar check do Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar check:', error);
    return null;
  }
};

/**
 * Marcar ou desmarcar uma métrica
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica
 * @param {boolean} checked - Estado do check
 * @returns {Promise<Object>} Check atualizado
 */
export const setMetricCheck = async (email, metricType, checked) => {
  if (!supabase) {
    console.error('❌ Supabase não configurado. Não é possível salvar check.');
    throw new Error('Supabase não configurado. Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env');
  }

  try {
    console.log('📝 Tentando salvar check no Supabase:', { email, metricType, checked });
    
    const checkData = {
      email: email,
      metric_type: metricType,
      checked: checked,
      check_date: new Date().toISOString()
    };

    console.log('📦 Dados do check:', checkData);

    // Primeiro, tentar verificar se a tabela existe fazendo uma query simples
    const { data: testData, error: testError } = await supabase
      .from('metric_checks')
      .select('id')
      .limit(1);

    if (testError && testError.code === '42P01') {
      throw new Error(`Tabela 'metric_checks' não existe no Supabase. Execute o script back-end/scripts/create_metrics_tables.sql no SQL Editor do Supabase Dashboard para criar as tabelas necessárias.`);
    }

    // Tentar inserir/atualizar
    const { data, error } = await supabase
      .from('metric_checks')
      .upsert(checkData, {
        onConflict: 'email,metric_type',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar check no Supabase:', error);
      console.error('❌ Código do erro:', error.code);
      console.error('❌ Mensagem do erro:', error.message);
      console.error('❌ Detalhes do erro:', error.details);
      console.error('❌ Hint do erro:', error.hint);
      
      // Verificar se a tabela existe
      if (error.code === '42P01') {
        throw new Error(`Tabela 'metric_checks' não existe no Supabase. Execute o script back-end/scripts/create_metrics_tables.sql no SQL Editor do Supabase Dashboard.`);
      }
      
      // Verificar se é problema de RLS
      if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new Error(`Erro de permissão no Supabase. Verifique se as RLS policies estão configuradas corretamente ou se está usando a SERVICE_ROLE_KEY. Erro: ${error.message}`);
      }
      
      throw new Error(`Erro do Supabase: ${error.message} (Código: ${error.code})`);
    }

    console.log('✅ Check salvo com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao salvar check:', error);
    throw error;
  }
};

// ============================================
// Histórico de Ações
// ============================================

/**
 * Registrar uma ação no histórico
 * @param {string} email - Email do operador
 * @param {string} action - Tipo da ação (ex: 'login', 'view_dashboard', 'check_metric', 'generate_feedback', 'export')
 * @param {Object} context - Contexto adicional da ação (opcional)
 * @returns {Promise<Object>} Ação registrada
 */
export const logAction = async (email, action, context = null) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Ação não registrada.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('action_history')
      .insert({
        email: email,
        action: action,
        context: context || {},
        action_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // Se for erro de RLS, apenas logar como warning (não crítico)
      if (error.code === '42501') {
        console.warn('⚠️ Erro de RLS ao registrar ação (não crítico). Execute o script fix_rls_policies.sql no Supabase:', error.message);
        return null;
      }
      console.error('Erro ao registrar ação no Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao registrar ação:', error);
    return null;
  }
};

/**
 * Buscar histórico de ações de um operador
 * @param {string} email - Email do operador
 * @param {Date} startDate - Data inicial (opcional)
 * @param {Date} endDate - Data final (opcional)
 * @param {string} actionType - Tipo de ação específica (opcional)
 * @returns {Promise<Array>} Array de ações
 */
export const getActionHistory = async (email, startDate = null, endDate = null, actionType = null) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando array vazio.');
    return [];
  }

  try {
    let query = supabase
      .from('action_history')
      .select('*')
      .eq('email', email)
      .order('action_date', { ascending: false });

    if (actionType) {
      query = query.eq('action', actionType);
    }

    if (startDate) {
      query = query.gte('action_date', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('action_date', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar histórico de ações do Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico de ações:', error);
    return [];
  }
};

// ============================================
// Feedbacks I.A
// ============================================

/**
 * Buscar feedbacks I.A de um operador
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica (opcional)
 * @returns {Promise<Array>} Array de feedbacks
 */
export const getAIFeedbacks = async (email, metricType = null) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando array vazio.');
    return [];
  }

  try {
    let query = supabase
      .from('ai_feedbacks')
      .select('*')
      .eq('email', email)
      .order('generated_at', { ascending: false });

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar feedbacks I.A do Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar feedbacks I.A:', error);
    return [];
  }
};

/**
 * Buscar feedback I.A mais recente de uma métrica específica
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica
 * @returns {Promise<Object|null>} Feedback ou null
 */
export const getLatestAIFeedback = async (email, metricType) => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Retornando null.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('ai_feedbacks')
      .select('*')
      .eq('email', email)
      .eq('metric_type', metricType)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erro ao buscar feedback I.A do Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar feedback I.A:', error);
    return null;
  }
};

/**
 * Salvar feedback I.A gerado
 * @param {string} email - Email do operador
 * @param {string} metricType - Tipo da métrica
 * @param {string} feedbackText - Texto do feedback
 * @returns {Promise<Object>} Feedback salvo
 */
export const saveAIFeedback = async (email, metricType, feedbackText) => {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  try {
    const { data, error } = await supabase
      .from('ai_feedbacks')
      .insert({
        email: email,
        metric_type: metricType,
        feedback_text: feedbackText,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // Se for erro de duplicata no mesmo dia, tentar atualizar
      if (error.code === '23505') {
        // Buscar o feedback existente do dia
        const today = new Date().toISOString().split('T')[0];
        const existing = await supabase
          .from('ai_feedbacks')
          .select('*')
          .eq('email', email)
          .eq('metric_type', metricType)
          .gte('generated_at', `${today}T00:00:00`)
          .lte('generated_at', `${today}T23:59:59`)
          .single();

        if (existing.data) {
          // Atualizar feedback existente
          const { data: updated, error: updateError } = await supabase
            .from('ai_feedbacks')
            .update({
              feedback_text: feedbackText,
              generated_at: new Date().toISOString()
            })
            .eq('id', existing.data.id)
            .select()
            .single();

          if (updateError) {
            console.error('Erro ao atualizar feedback I.A no Supabase:', updateError);
            throw updateError;
          }

          return updated;
        }
      }

      console.error('Erro ao salvar feedback I.A no Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar feedback I.A:', error);
    throw error;
  }
};

