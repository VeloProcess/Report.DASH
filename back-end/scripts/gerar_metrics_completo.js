/**
 * Script para gerar Metrics.json completo com todos os operadores
 * Baseado em send_email.JSON
 * 
 * Execute: node scripts/gerar_metrics_completo.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmailFile = path.join(__dirname, '../src/controllers/send_email.JSON');
const metricsFile = path.join(__dirname, '../data/Metrics.json');

/**
 * Template de estrutura vazia para um operador
 */
const createEmptyOperatorStructure = (email, nome) => {
  return {
    login: {
      email: email,
      nome: nome,
      metricas_atualizadas_em: new Date().toLocaleString('pt-BR'),
      dados: {
        chamadas: {
          ligacoes: 0,
          tma: "00:00:00",
          nota_telefone: 0,
          quantidade_notas: 0
        },
        tickets: {
          quantidade: 0,
          tmt: "00:00:00",
          nota_ticket: 0,
          quantidade_notas: 0
        },
        qualidade: {
          nota: 0,
          quantidade: 0
        },
        pausas_tempo_logado: {
          total_escalado: "00:00:00",
          total_cumprido: "00:00:00",
          abs: 0,
          atrasos: 0,
          pausa_escalada: "00:00:00",
          pausa_realizada: "00:00:00",
          pausa_almoco_escalada: "00:00:00",
          pausa_almoco_realizada: "00:00:00",
          pausa_10_escalada: "00:00:00",
          pausa_10_realizada: "00:00:00",
          pausa_banheiro: "00:00:00",
          pausa_feedback: "00:00:00",
          pausa_treinamento: "00:00:00"
        }
      }
    }
  };
};

/**
 * Gera Metrics.json completo com todos os operadores
 */
const generateCompleteMetricsFile = () => {
  try {
    console.log('🔄 Gerando Metrics.json completo...\n');
    
    // Carregar mapeamento de emails
    const emailMapping = JSON.parse(fs.readFileSync(sendEmailFile, 'utf-8'));
    console.log(`📧 Encontrados ${Object.keys(emailMapping).length} operadores em send_email.JSON\n`);
    
    const metricsStructure = {};
    let created = 0;
    let preserved = 0;
    
    // Para cada operador no mapeamento
    for (const [nome, email] of Object.entries(emailMapping)) {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Verificar se já existe no arquivo atual
      let existingData = null;
      if (fs.existsSync(metricsFile)) {
        try {
          const currentMetrics = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
          
          // Verificar se já existe (em qualquer estrutura)
          if (currentMetrics[normalizedEmail]) {
            existingData = currentMetrics[normalizedEmail];
          } else if (currentMetrics.login && currentMetrics.login.email === email) {
            existingData = currentMetrics.login;
          } else {
            // Buscar em outras estruturas
            for (const key in currentMetrics) {
              const entry = currentMetrics[key];
              if (entry && entry.login && entry.login.email === email) {
                existingData = entry.login;
                break;
              }
            }
          }
        } catch (error) {
          console.log(`⚠️ Erro ao ler arquivo existente, criando novo: ${error.message}`);
        }
      }
      
      if (existingData && existingData.dados) {
        // Preservar dados existentes, apenas atualizar email e nome se necessário
        metricsStructure[normalizedEmail] = {
          login: {
            ...existingData,
            email: email,
            nome: nome,
            // Manter metricas_atualizadas_em se existir, senão atualizar
            metricas_atualizadas_em: existingData.metricas_atualizadas_em || new Date().toLocaleString('pt-BR')
          }
        };
        preserved++;
        console.log(`✅ Preservado: ${nome} (${email})`);
      } else {
        // Criar estrutura vazia
        metricsStructure[normalizedEmail] = createEmptyOperatorStructure(email, nome);
        created++;
        console.log(`📝 Criado: ${nome} (${email})`);
      }
    }
    
    // Salvar arquivo
    fs.writeFileSync(metricsFile, JSON.stringify(metricsStructure, null, 2), 'utf-8');
    
    console.log(`\n✅ Arquivo Metrics.json gerado com sucesso!`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - Total de operadores: ${Object.keys(metricsStructure).length}`);
    console.log(`   - Novos criados: ${created}`);
    console.log(`   - Dados preservados: ${preserved}`);
    console.log(`📁 Localização: ${metricsFile}`);
    console.log(`\n💡 Agora você pode editar manualmente os valores em cada operador!`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar Metrics.json:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('gerar_metrics_completo')) {
  generateCompleteMetricsFile();
}

export { generateCompleteMetricsFile, createEmptyOperatorStructure };

