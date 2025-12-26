# Como Configurar a Service Role Key do Supabase

## O que é a Service Role Key?

A **Service Role Key** é uma chave especial do Supabase que:
- Bypassa todas as políticas RLS (Row Level Security)
- Permite que o backend faça operações administrativas
- **NUNCA deve ser exposta no frontend** (apenas no backend)

## Como Obter a Service Role Key

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** (⚙️) no menu lateral
4. Clique em **API** nas configurações
5. Na seção **Project API keys**, você verá duas chaves:
   - **anon/public key** - Para uso no frontend (já configurada)
   - **service_role key** - Para uso no backend (precisa configurar)

6. Clique no ícone de **olho** 👁️ ao lado da **service_role key** para revelá-la
7. Copie a chave completa (começa com `eyJ...`)

## Como Configurar no Render

### Opção 1: Via Dashboard do Render (Recomendado)

1. Acesse o [Render Dashboard](https://dashboard.render.com)
2. Selecione seu serviço backend
3. Vá em **Environment** no menu lateral
4. Clique em **Add Environment Variable**
5. Adicione:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Cole a service role key copiada do Supabase
6. Clique em **Save Changes**
7. O serviço será reiniciado automaticamente

### Opção 2: Via arquivo .env (Desenvolvimento Local)

1. Abra o arquivo `back-end/.env`
2. Adicione a linha:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
   ```
3. Substitua `sua_service_role_key_aqui` pela chave copiada do Supabase
4. Salve o arquivo
5. Reinicie o servidor backend

## Verificação

Após configurar, você deve ver nos logs do backend:

```
✅ Cliente Supabase configurado
📡 URL: https://seu-projeto.supabase.co
🔑 Usando: Service Role Key
```

Se aparecer "Anon Key" em vez de "Service Role Key", significa que a variável não foi configurada corretamente.

## Segurança

⚠️ **IMPORTANTE:**
- A Service Role Key **NUNCA** deve ser commitada no Git
- Adicione `.env` ao `.gitignore` se ainda não estiver
- Use apenas no backend, nunca no frontend
- Se a chave for exposta, revogue-a imediatamente no Supabase e gere uma nova

## Troubleshooting

### Erro: "Supabase não configurado"
- Verifique se a variável `SUPABASE_SERVICE_ROLE_KEY` está configurada
- Verifique se o nome da variável está correto (case-sensitive)
- Reinicie o serviço após adicionar a variável

### Erro: "nova linha viola a política de segurança em nível de linha"
- Isso significa que o backend está usando a anon key em vez da service role key
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada corretamente
- Verifique os logs para confirmar qual chave está sendo usada

