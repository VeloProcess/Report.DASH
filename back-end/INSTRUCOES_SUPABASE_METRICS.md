# 📋 Instruções para Configurar Tabelas de Métricas no Supabase

## ⚠️ Problema Identificado

O erro `500 Internal Server Error` ao salvar checks de métricas indica que a tabela `metric_checks` não existe no Supabase ou há um problema de permissão.

## 🔧 Solução

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `wouqpkddfvksofnxgtff`

### Passo 2: Executar o Script SQL

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**
3. Abra o arquivo `back-end/scripts/create_metrics_tables.sql`
4. Copie **TODO** o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **"Run"** ou pressione `Ctrl+Enter`

### Passo 3: Verificar se as Tabelas Foram Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver as seguintes tabelas:
   - ✅ `metrics`
   - ✅ `metrics_history`
   - ✅ `metric_checks`
   - ✅ `action_history`
   - ✅ `ai_feedbacks`

### Passo 4: Verificar RLS Policies

1. No menu lateral, clique em **"Authentication"** > **"Policies"**
2. Verifique se as policies foram criadas para cada tabela
3. **IMPORTANTE**: Como estamos usando `SERVICE_ROLE_KEY` no backend, as RLS policies não devem bloquear operações, mas é bom verificar

### Passo 5: Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `back-end/.env` contém:

```env
SUPABASE_URL=https://wouqpkddfvksofnxgtff.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXFwa2RkZnZrc29mbnhndGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTU4MTAsImV4cCI6MjA4MjA5MTgxMH0.3DzMYz_6TG-BUKAGC4Pjx7BM8kabf57_vTDk3jNilJA
```

**OU** (recomendado para produção):

```env
SUPABASE_URL=https://wouqpkddfvksofnxgtff.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### Passo 6: Reiniciar o Servidor Backend

Após executar o script SQL:

```bash
cd back-end
npm start
```

## 🔍 Verificação de Erros Comuns

### Erro: "Tabela não existe" (42P01)
- **Solução**: Execute o script `create_metrics_tables.sql` no SQL Editor

### Erro: "Permission denied" (42501)
- **Solução**: Verifique se está usando `SERVICE_ROLE_KEY` no `.env` ao invés de `ANON_KEY`

### Erro: "Row-level security policy violation"
- **Solução**: Use `SERVICE_ROLE_KEY` que bypassa RLS, ou ajuste as policies no Supabase

## 📝 Estrutura das Tabelas Criadas

### `metric_checks`
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR(255) NOT NULL)
- `metric_type` (VARCHAR(100) NOT NULL)
- `checked` (BOOLEAN DEFAULT false)
- `check_date` (TIMESTAMP DEFAULT NOW())
- **UNIQUE(email, metric_type)**

## ✅ Teste Manual

Após configurar, teste inserindo um registro manualmente no SQL Editor:

```sql
INSERT INTO metric_checks (email, metric_type, checked)
VALUES ('teste@example.com', 'chamadas', true)
ON CONFLICT (email, metric_type) 
DO UPDATE SET checked = EXCLUDED.checked, check_date = NOW();
```

Se funcionar, o problema está resolvido!

