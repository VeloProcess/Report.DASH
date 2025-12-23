import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wouqpkddfvksofnxgtff.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

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
    console.log(`🔑 Usando: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key'}`);
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

