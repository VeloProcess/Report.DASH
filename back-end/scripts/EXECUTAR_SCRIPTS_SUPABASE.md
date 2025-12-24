# 📋 Ordem de Execução dos Scripts SQL no Supabase

## ⚠️ IMPORTANTE: Execute os scripts nesta ordem!

### Passo 1: Criar Tabelas de Métricas
1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: `wouqpkddfvksofnxgtff`
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo: `back-end/scripts/create_metrics_tables.sql`
6. Copie **TODO** o conteúdo
7. Cole no SQL Editor
8. Clique em **Run** (ou `Ctrl+Enter`)
9. ✅ Verifique se apareceu "Success. No rows returned"

### Passo 2: Criar Tabela de Confirmações
1. No mesmo SQL Editor, clique em **New Query**
2. Abra o arquivo: `back-end/scripts/create_operator_confirmations_table.sql`
3. Copie **TODO** o conteúdo
4. Cole no SQL Editor
5. Clique em **Run**
6. ✅ Verifique se apareceu "Success. No rows returned"

### Passo 3: Corrigir RLS Policies (Opcional)
1. No mesmo SQL Editor, clique em **New Query**
2. Abra o arquivo: `back-end/scripts/fix_rls_policies.sql`
3. Copie **TODO** o conteúdo
4. Cole no SQL Editor
5. Clique em **Run**
6. ✅ Verifique as mensagens de sucesso

## 🔍 Verificar se as Tabelas Foram Criadas

1. No menu lateral do Supabase, clique em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - ✅ `metrics`
   - ✅ `metrics_history`
   - ✅ `metric_checks`
   - ✅ `action_history`
   - ✅ `ai_feedbacks`
   - ✅ `operator_confirmations`

## ❌ Se Der Erro

### Erro: "relation does not exist"
- **Causa**: Tentou executar `fix_rls_policies.sql` antes de `create_metrics_tables.sql`
- **Solução**: Execute primeiro `create_metrics_tables.sql`

### Erro: "permission denied" ou "row-level security"
- **Causa**: RLS está bloqueando operações
- **Solução**: Execute `fix_rls_policies.sql` após criar as tabelas

### Erro: "duplicate key value"
- **Causa**: Tentou executar o script duas vezes
- **Solução**: Normal, pode ignorar (as tabelas já existem)

## ✅ Após Executar Todos os Scripts

1. Reinicie o servidor backend:
   ```bash
   cd back-end
   npm start
   ```

2. Verifique os logs do servidor - não deve aparecer mais erros de RLS

3. Teste o sistema:
   - Acesse o dashboard
   - Marque o checkbox "Compreendi"
   - Adicione observações
   - Verifique se salva corretamente

