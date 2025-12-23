# Configuração do Supabase para Feedbacks de Gestores

## Visão Geral

O sistema de feedbacks de gestores agora usa Supabase PostgreSQL ao invés de arquivo JSON para armazenamento persistente e escalável.

## Passo 1: Criar Tabela no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `back-end/scripts/create_supabase_table.sql`
6. Clique em **Run** para executar o SQL

Isso criará:
- Tabela `manager_feedbacks` com todas as colunas necessárias
- Índices para buscas rápidas
- Trigger para atualizar `updated_at` automaticamente
- Constraint UNIQUE para evitar feedbacks duplicados por operador/mês/ano

## Passo 2: Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env` na pasta `back-end/`:

```env
# Supabase
SUPABASE_URL=https://wouqpkddfvksofnxgtff.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXFwa2RkZnZrc29mbnhndGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTU4MTAsImV4cCI6MjA4MjA5MTgxMH0.3DzMYz_6TG-BUKAGC4Pjx7BM8kabf57_vTDk3jNilJA

# Opcional: Service Role Key (recomendado para backend)
# Permite bypass de Row Level Security (RLS)
# SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### Como Obter as Chaves:

1. No Supabase Dashboard, vá em **Settings** > **API**
2. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key (opcional) → `SUPABASE_SERVICE_ROLE_KEY`

**Nota:** Se você não tiver `SUPABASE_SERVICE_ROLE_KEY`, o sistema usará `SUPABASE_ANON_KEY`. Certifique-se de que o RLS está desabilitado na tabela `manager_feedbacks` (o script SQL já faz isso).

## Passo 3: Instalar Dependência

Execute no terminal na pasta `back-end/`:

```bash
npm install
```

Isso instalará `@supabase/supabase-js` que foi adicionado ao `package.json`.

## Passo 4: Configurar no Render (Deploy)

Se você está usando Render para deploy:

1. Acesse seu projeto no Render Dashboard
2. Vá em **Environment**
3. Adicione as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (opcional)

## Verificação

Após configurar, reinicie o servidor e verifique os logs:

```
✅ Cliente Supabase configurado
📡 URL: https://wouqpkddfvksofnxgtff.supabase.co
🔑 Usando: Anon Key (ou Service Role Key)
```

## Estrutura da Tabela

```sql
manager_feedbacks
├── id (BIGSERIAL PRIMARY KEY)
├── operator_id (INTEGER NOT NULL)
├── month (VARCHAR(20) NOT NULL) - "Outubro", "Novembro", "Dezembro"
├── year (INTEGER NOT NULL)
├── feedback_text (TEXT NOT NULL)
├── manager_email (VARCHAR(255) NOT NULL)
├── manager_name (VARCHAR(255) NOT NULL)
├── created_at (TIMESTAMPTZ DEFAULT NOW())
└── updated_at (TIMESTAMPTZ DEFAULT NOW())

UNIQUE(operator_id, month, year)
```

## Troubleshooting

### Erro: "relation 'manager_feedbacks' does not exist"
- Execute o script SQL no Supabase Dashboard para criar a tabela

### Erro: "new row violates row-level security policy"
- Desabilite RLS na tabela: `ALTER TABLE manager_feedbacks DISABLE ROW LEVEL SECURITY;`
- Ou use `SUPABASE_SERVICE_ROLE_KEY` que bypassa RLS

### Erro: "Invalid API key"
- Verifique se as chaves estão corretas no `.env`
- Certifique-se de não ter espaços extras nas chaves
- Reinicie o servidor após alterar variáveis de ambiente

## Migração de Dados (se necessário)

Se você tiver dados no arquivo `manager_feedbacks.json` que precisam ser migrados:

1. Leia o arquivo JSON
2. Use o SQL Editor do Supabase para inserir os dados:

```sql
INSERT INTO manager_feedbacks (operator_id, month, year, feedback_text, manager_email, manager_name, created_at, updated_at)
VALUES 
  (1, 'Dezembro', 2024, 'Texto do feedback...', 'email@exemplo.com', 'Nome Gestor', '2024-12-20T10:30:00Z', '2024-12-20T10:30:00Z'),
  -- Adicione mais linhas conforme necessário
ON CONFLICT (operator_id, month, year) DO NOTHING;
```

