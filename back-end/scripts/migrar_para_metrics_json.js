/**
 * Script para migrar dados do sistema antigo para Metrics.json
 * ou criar estrutura inicial baseada em send_email.JSON
 * 
 * Execute: node scripts/migrar_para_metrics_json.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOperators, getLatestIndicatorByOperatorId } from '../src/database.js';
import { getOperatorNameByEmail } from '../src/utils/operatorUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const metricsFile = path.join(__dirname, '../data/Metrics.json');
const sendEmailFile = path.join(__dirname, '../src/controllers/send_email.JSON');

/**
 * Converte indicadores do formato antigo para formato Metrics.json
 */
const convertIndicatorsToMetricsFormat = (indicators, operatorName, email) => {
  if (!indicators) return null;
  
  return {
    login: {
      email: email,
      nome: operatorName,
      metricas_atualizadas_em: new Date().toLocaleString('pt-BR'),
      dados: {
        chamadas: {
          ligacoes: indicators.calls || 0,
          tma: indicators.tma || "00:00:00",
          nota_telefone: indicators.quality_score || 0,
          quantidade_notas: indicators.qtd_pesq_telefone || 0
        },
        tickets: {
          quantidade: indicators.tickets || 0,
          tmt: indicators.tmt || "00:00:00",
          nota_ticket: indicators.pesquisa_ticket || 0,
          quantidade_notas: indicators.qtd_pesq_ticket || 0
        },
        qualidade: {
          nota: indicators.nota_qualidade || indicators.quality_score || 0,
          quantidade: indicators.qtd_avaliacoes || indicators.qtd_pesq_telefone || 0
        },
        pausas_tempo_logado: {
          total_escalado: indicators.total_escalado || "00:00:00",
          total_cumprido: indicators.total_logado || "00:00:00",
          abs: indicators.absenteeism || indicators.abs || 0,
          atrasos: indicators.atrasos || 0,
          pausa_escalada: indicators.pausa_escalada || "00:00:00",
          pausa_realizada: indicators.total_pausas || "00:00:00",
          pausa_almoco_escalada: indicators.almoco_escalado || "00:00:00",
          pausa_almoco_realizada: indicators.almoco_realizado || "00:00:00",
          pausa_10_escalada: indicators.pausa_10_escalada || "00:00:00",
          pausa_10_realizada: indicators.pausa_10_realizado || "00:00:00",
          pausa_banheiro: indicators.pausa_banheiro || "00:00:00",
          pausa_feedback: indicators.pausa_feedback || "00:00:00",
          pausa_treinamento: indicators.treinamento || "00:00:00"
        }
      }
    }
  };
};

/**
 * Cria estrutura inicial do Metrics.json baseada em send_email.JSON
 */
const createInitialMetricsStructure = () => {
  try {
    // Carregar mapeamento de emails
    const emailMapping = JSON.parse(fs.readFileSync(sendEmailFile, 'utf-8'));
    const operators = getOperators();
    const metricsStructure = {};
    
    console.log('🔄 Criando estrutura inicial do Metrics.json...');
    
    // Para cada email no mapeamento
    for (const [name, email] of Object.entries(emailMapping)) {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Buscar operador por nome
      const operator = operators.find(op => 
        op.name?.toLowerCase().trim() === name.toLowerCase().trim()
      );
      
      // Buscar indicadores mais recentes
      let indicators = null;
      if (operator) {
        indicators = getLatestIndicatorByOperatorId(operator.id);
      }
      
      // Criar estrutura
      if (indicators) {
        metricsStructure[normalizedEmail] = convertIndicatorsToMetricsFormat(
          indicators,
          name,
          email
        );
        console.log(`✅ Criado para ${email} (com dados)`);
      } else {
        // Criar estrutura vazia
        metricsStructure[normalizedEmail] = {
          login: {
            email: email,
            nome: name,
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
        console.log(`✅ Criado para ${email} (estrutura vazia)`);
      }
    }
    
    // Salvar arquivo
    fs.writeFileSync(metricsFile, JSON.stringify(metricsStructure, null, 2), 'utf-8');
    console.log(`\n✅ Arquivo Metrics.json criado com ${Object.keys(metricsStructure).length} operadores!`);
    console.log(`📁 Localização: ${metricsFile}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar estrutura:', error);
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createInitialMetricsStructure();
}

export { createInitialMetricsStructure, convertIndicatorsToMetricsFormat };

