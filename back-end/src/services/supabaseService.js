import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wouqpkddfvksofnxgtff.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

let supabase = null;

// Debug: Verificar quais chaves estão configuradas (sem mostrar valores completos)
console.log('🔍 Verificando configuração do Supabase:');
console.log(`  - SUPABASE_URL: ${SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`  - SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? `✅ Configurado (${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ Não configurado'}`);
console.log(`  - SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? `✅ Configurado (${SUPABASE_ANON_KEY.substring(0, 20)}...)` : '❌ Não configurado'}`);
console.log(`  - Chave que será usada: ${SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : SUPABASE_ANON_KEY ? 'Anon Key' : 'NENHUMA'}`);

// Criar cliente Supabase apenas se a chave estiver configurada
if (SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Cliente Supabase configurado');
    console.log(`📡 URL: ${SUPABASE_URL}`);
    console.log(`🔑 Usando: ${SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key'}`);
    
    // Testar conexão fazendo uma query simples
    supabase.from('manager_feedbacks').select('id').limit(1).then(({ error }) => {
      if (error) {
        console.error('❌ Erro ao testar conexão com Supabase:', error.message);
        if (error.message.includes('Invalid API key')) {
          console.error('💡 A chave API está inválida. Verifique:');
          console.error('   1. Se a Service Role Key está correta no Render');
          console.error('   2. Se a chave não foi revogada no Supabase');
          console.error('   3. Se está usando a Service Role Key (não a Anon Key)');
        }
      } else {
        console.log('✅ Conexão com Supabase testada com sucesso');
      }
    });
  } catch (error) {
    console.error('❌ Erro ao criar cliente Supabase:', error.message);
    supabase = null;
  }
} else {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY não configurado no .env');
  console.warn('⚠️ Feedbacks de gestores não funcionarão até configurar o Supabase');
  console.warn('⚠️ Adicione as variáveis ao arquivo back-end/.env');
}

// Exportar cliente ou null
export default supabase;

