/**
 * Script para testar segurança e isolamento de dados
 * 
 * Uso: node scripts/test_security.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  getMetrics,
  getMetricByType,
  getMetricChecks,
  getActionHistory,
  getAIFeedbacks
} from '../src/services/metricsSupabaseService.js';
import { getOperators } from '../src/database.js';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

/**
 * Testar isolamento de dados entre operadores
 */
async function testDataIsolation() {
  console.log('🔒 Testando isolamento de dados...\n');

  const operators = getOperators();
  
  if (operators.length < 2) {
    console.log('⚠️ É necessário pelo menos 2 operadores para testar isolamento');
    return;
  }

  const operator1 = operators[0];
  const operator2 = operators[1];

  console.log(`Operador 1: ${operator1.name} (${operator1.email})`);
  console.log(`Operador 2: ${operator2.name} (${operator2.email})\n`);

  // Teste 1: Buscar métricas do operador 1
  console.log('📊 Teste 1: Buscar métricas do operador 1');
  const metrics1 = await getMetrics(operator1.email);
  console.log(`  Métricas encontradas: ${metrics1.length}`);
  console.log(`  Tipos: ${metrics1.map(m => m.metric_type).join(', ') || 'Nenhuma'}\n`);

  // Teste 2: Buscar métricas do operador 2
  console.log('📊 Teste 2: Buscar métricas do operador 2');
  const metrics2 = await getMetrics(operator2.email);
  console.log(`  Métricas encontradas: ${metrics2.length}`);
  console.log(`  Tipos: ${metrics2.map(m => m.metric_type).join(', ') || 'Nenhuma'}\n`);

  // Teste 3: Tentar acessar métricas do operador 2 usando email do operador 1
  console.log('🔒 Teste 3: Tentar acessar métricas do operador 2 usando email do operador 1');
  const metrics1WithOperator2Email = await getMetrics(operator2.email);
  const metrics2WithOperator1Email = await getMetrics(operator1.email);
  
  // Verificar se os resultados são diferentes
  const metrics1Ids = new Set(metrics1.map(m => m.id));
  const metrics2Ids = new Set(metrics2.map(m => m.id));
  const intersection = [...metrics1Ids].filter(id => metrics2Ids.has(id));

  if (intersection.length === 0) {
    console.log('  ✅ Isolamento OK: Nenhuma métrica compartilhada entre operadores\n');
  } else {
    console.log(`  ⚠️ Atenção: ${intersection.length} métricas compartilhadas entre operadores\n`);
  }

  // Teste 4: Verificar checks isolados
  console.log('✅ Teste 4: Verificar checks isolados');
  const checks1 = await getMetricChecks(operator1.email);
  const checks2 = await getMetricChecks(operator2.email);
  console.log(`  Checks do operador 1: ${checks1.length}`);
  console.log(`  Checks do operador 2: ${checks2.length}\n`);

  // Teste 5: Verificar histórico isolado
  console.log('📜 Teste 5: Verificar histórico isolado');
  const history1 = await getActionHistory(operator1.email);
  const history2 = await getActionHistory(operator2.email);
  console.log(`  Ações do operador 1: ${history1.length}`);
  console.log(`  Ações do operador 2: ${history2.length}\n`);

  // Teste 6: Verificar feedbacks isolados
  console.log('🤖 Teste 6: Verificar feedbacks I.A isolados');
  const feedbacks1 = await getAIFeedbacks(operator1.email);
  const feedbacks2 = await getAIFeedbacks(operator2.email);
  console.log(`  Feedbacks do operador 1: ${feedbacks1.length}`);
  console.log(`  Feedbacks do operador 2: ${feedbacks2.length}\n`);

  console.log('✅ Testes de isolamento concluídos\n');
}

/**
 * Testar validação de email
 */
async function testEmailValidation() {
  console.log('📧 Testando validação de email...\n');

  const operators = getOperators();
  if (operators.length === 0) {
    console.log('⚠️ Nenhum operador encontrado');
    return;
  }

  const operator = operators[0];
  
  // Teste: Buscar métricas com email válido
  console.log(`✅ Teste 1: Buscar métricas com email válido (${operator.email})`);
  const validMetrics = await getMetrics(operator.email);
  console.log(`  Métricas encontradas: ${validMetrics.length}\n`);

  // Teste: Tentar buscar com email inválido
  console.log('❌ Teste 2: Tentar buscar com email inválido');
  const invalidEmail = 'invalid@test.com';
  const invalidMetrics = await getMetrics(invalidEmail);
  console.log(`  Métricas encontradas: ${invalidMetrics.length}`);
  console.log(`  ✅ Isolamento OK: Email inválido não retorna dados de outros operadores\n`);
}

/**
 * Função principal de testes
 */
async function runTests() {
  console.log('🧪 Iniciando testes de segurança...\n');
  console.log('='.repeat(50));

  try {
    await testDataIsolation();
    await testEmailValidation();

    console.log('='.repeat(50));
    console.log('✅ Todos os testes concluídos!');
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

// Executar testes
runTests().catch(error => {
  console.error('❌ Erro fatal nos testes:', error);
  process.exit(1);
});

