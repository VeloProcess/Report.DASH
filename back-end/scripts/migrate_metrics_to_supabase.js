/**
 * Script para migrar métricas do JSON para Supabase
 * 
 * Uso: node scripts/migrate_metrics_to_supabase.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import {
  saveMetric,
  createMetricsSnapshot,
  logAction
} from '../src/services/metricsSupabaseService.js';
import { getOperators } from '../src/database.js';
import { getOperatorByEmail } from '../src/utils/operatorUtils.js';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Buscar métricas do arquivo Metrics.json
 */
function getMetricsFromJSON() {
  const possiblePaths = [
    join(__dirname, '..', 'data', 'Metrics.json'),
    join(process.cwd(), 'data', 'Metrics.json'),
    join(process.cwd(), 'back-end', 'data', 'Metrics.json')
  ];

  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      console.log(`✅ Arquivo Metrics.json encontrado em: ${path}`);
      const content = fs.readFileSync(path, 'utf8');
      return JSON.parse(content);
    }
  }

  console.error('❌ Arquivo Metrics.json não encontrado');
  return null;
}

/**
 * Converter métricas do formato JSON para formato Supabase
 */
function convertMetricsToSupabaseFormat(metricsData, email) {
  const metrics = [];

  // Mapear tipos de métricas
  const metricTypes = {
    chamadas: {
      calls: metricsData.chamadas?.qtd_chamadas,
      tma: metricsData.chamadas?.tma
    },
    tickets: {
      tickets: metricsData.tickets?.qtd_tickets,
      tmt: metricsData.tickets?.tmt
    },
    qualidade: {
      nota_qualidade: metricsData.qualidade?.nota_qualidade,
      qtd_avaliacoes: metricsData.qualidade?.qtd_avaliacoes
    },
    pausas: {
      percent_logado: metricsData.pausas?.percent_logado,
      pausa_escalada: metricsData.pausas?.pausa_escalada,
      total_pausas: metricsData.pausas?.total_pausas,
      almoco_escalado: metricsData.pausas?.almoco_escalado,
      almoco_realizado: metricsData.pausas?.almoco_realizado,
      pausa10_escalada: metricsData.pausas?.pausa10_escalada,
      pausa10_realizado: metricsData.pausas?.pausa10_realizado,
      pausa_banheiro: metricsData.pausas?.pausa_banheiro,
      pausa_feedback: metricsData.pausas?.pausa_feedback
    }
  };

  // Criar métricas para cada tipo
  Object.keys(metricTypes).forEach(type => {
    const value = metricTypes[type];
    if (value && Object.values(value).some(v => v !== null && v !== undefined)) {
      metrics.push({
        type,
        value
      });
    }
  });

  return metrics;
}

/**
 * Migrar métricas de um operador
 */
async function migrateOperatorMetrics(operator, metricsData) {
  try {
    const email = operator.email;
    console.log(`\n📊 Migrando métricas para: ${operator.name} (${email})`);

    // Buscar métricas do operador no JSON
    const operatorMetrics = metricsData.operadores?.find(
      op => op.nome?.toLowerCase() === operator.name?.toLowerCase()
    );

    if (!operatorMetrics) {
      console.log(`⚠️ Nenhuma métrica encontrada para ${operator.name}`);
      return;
    }

    // Converter para formato Supabase
    const supabaseMetrics = convertMetricsToSupabaseFormat(operatorMetrics, email);

    if (supabaseMetrics.length === 0) {
      console.log(`⚠️ Nenhuma métrica válida para migrar`);
      return;
    }

    // Salvar métricas no Supabase
    for (const metric of supabaseMetrics) {
      try {
        await saveMetric(email, metric.type, metric.value);
        console.log(`  ✅ Métrica ${metric.type} salva`);
      } catch (error) {
        console.error(`  ❌ Erro ao salvar métrica ${metric.type}:`, error.message);
      }
    }

    // Criar snapshot inicial
    for (const metric of supabaseMetrics) {
      try {
        await createMetricsSnapshot(email, metric.type, metric.value);
        console.log(`  ✅ Snapshot criado para ${metric.type}`);
      } catch (error) {
        console.error(`  ❌ Erro ao criar snapshot ${metric.type}:`, error.message);
      }
    }

    console.log(`✅ Migração concluída para ${operator.name}`);
  } catch (error) {
    console.error(`❌ Erro ao migrar métricas de ${operator.name}:`, error);
  }
}

/**
 * Função principal de migração
 */
async function migrate() {
  console.log('🚀 Iniciando migração de métricas para Supabase...\n');

  // Verificar se Supabase está configurado
  const supabase = await import('../src/services/supabaseService.js');
  if (!supabase.default) {
    console.error('❌ Supabase não está configurado!');
    console.error('💡 Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env');
    process.exit(1);
  }

  // Buscar métricas do JSON
  const metricsData = getMetricsFromJSON();
  if (!metricsData) {
    console.error('❌ Não foi possível carregar métricas do JSON');
    process.exit(1);
  }

  // Buscar operadores
  const operators = getOperators();
  if (!operators || operators.length === 0) {
    console.error('❌ Nenhum operador encontrado');
    process.exit(1);
  }

  console.log(`📋 Encontrados ${operators.length} operadores\n`);

  // Migrar métricas de cada operador
  let successCount = 0;
  let errorCount = 0;

  for (const operator of operators) {
    try {
      await migrateOperatorMetrics(operator, metricsData);
      successCount++;
    } catch (error) {
      console.error(`❌ Erro ao migrar operador ${operator.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Resumo da Migração:');
  console.log(`  ✅ Sucesso: ${successCount}`);
  console.log(`  ❌ Erros: ${errorCount}`);
  console.log('='.repeat(50));

  process.exit(0);
}

// Executar migração
migrate().catch(error => {
  console.error('❌ Erro fatal na migração:', error);
  process.exit(1);
});

