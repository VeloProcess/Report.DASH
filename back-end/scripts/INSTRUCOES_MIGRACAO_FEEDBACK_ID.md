# Instruções de Migração - Sistema de Feedback ID

## Objetivo
Vincular confirmações de operadores diretamente ao ID do feedback, garantindo que cada feedback tenha sua própria confirmação única.

## Passos de Migração

### 1. Executar Scripts SQL no Supabase

Execute os scripts SQL na seguinte ordem no SQL Editor do Supabase Dashboard:

#### Passo 1: Adicionar coluna `feedback_code` na tabela `manager_feedbacks`
```sql
-- Execute: back-end/scripts/add_feedback_code_column.sql
```
Este script:
- Adiciona a coluna `feedback_code VARCHAR(20) UNIQUE`
- Cria função para gerar códigos sequenciais (FB00001, FB00002, etc.)
- Cria trigger para gerar código automaticamente ao inserir novo feedback

#### Passo 2: Modificar tabela `operator_confirmations`
```sql
-- Execute: back-end/scripts/modify_operator_confirmations_table.sql
```
Este script:
- Adiciona coluna `feedback_id INTEGER`
- Remove constraint `UNIQUE(email, month, year)`
- Adiciona constraint `UNIQUE(feedback_id)` (uma confirmação por feedback)
- Adiciona índice em `feedback_id`

#### Passo 3: Migrar dados existentes
```sql
-- Execute: back-end/scripts/migrate_feedback_codes.sql
```
Este script:
- Gera códigos sequenciais para feedbacks existentes sem código
- **EXCLUI todas as confirmações antigas** (que não têm feedback_id)
- Verifica se todos os feedbacks têm código

#### Passo 4 (Opcional): Corrigir constraint se necessário
Se você receber erro "não existe nenhuma restrição única ou de exclusão que corresponda à especificação ON CONFLICT":
```sql
-- Execute: back-end/scripts/fix_feedback_id_constraint.sql
```
Este script verifica e cria a constraint UNIQUE(feedback_id) se não existir.

### 2. Reiniciar o Backend

Após executar os scripts SQL, reinicie o servidor backend para garantir que as mudanças sejam aplicadas.

## Mudanças Implementadas

### Backend
- ✅ `operatorConfirmationsService.js`: Novas funções para buscar/salvar por `feedback_id`
- ✅ `operatorConfirmationsRoutes.js`: Rotas atualizadas para receber `feedbackId`
- ✅ `managerFeedbackRoutes.js`: Exclui confirmação por `feedback_id` ao deletar feedback
- ✅ `operatorFeedbackRoutes.js`: Busca confirmações por `feedback_id`

### Frontend
- ✅ `OperatorConfirmation.jsx`: Recebe `feedbackId` como prop obrigatória
- ✅ `Dashboard.jsx`: Passa `feedback.id` ao componente `OperatorConfirmation`
- ✅ `HistoryTimeline.jsx`: Usa `feedback.id` ao salvar confirmações
- ✅ `api.js`: Funções atualizadas para incluir `feedbackId` no body

## Estrutura de Dados

### Tabela `manager_feedbacks`
- Nova coluna: `feedback_code VARCHAR(20) UNIQUE` (ex: FB00001)
- Código gerado automaticamente pelo trigger SQL

### Tabela `operator_confirmations`
- Nova coluna: `feedback_id INTEGER UNIQUE`
- Constraint `UNIQUE(feedback_id)` garante uma confirmação por feedback
- Colunas `email`, `month`, `year` mantidas para compatibilidade/relatórios

## Fluxo de Dados

1. **Gestor cria feedback** → Trigger SQL gera código (ex: FB00001) → Salva com `feedback_id`
2. **Operador recebe feedback** → Vê código FB00001
3. **Operador marca check + observações** → Vincula ao `feedback_id` específico
4. **Cada feedback tem sua própria confirmação independente**

## Importante

⚠️ **ATENÇÃO**: O script de migração (`migrate_feedback_codes.sql`) **EXCLUI todas as confirmações antigas** que não têm `feedback_id`. Isso é intencional para garantir que apenas confirmações vinculadas a feedbacks específicos existam.

## Verificação

Após a migração, verifique:
1. Todos os feedbacks têm `feedback_code` (ex: FB00001, FB00002)
2. Confirmações são vinculadas por `feedback_id`, não por `email/month/year`
3. Cada feedback pode ter sua própria confirmação independente
4. Ao excluir um feedback, sua confirmação também é excluída

