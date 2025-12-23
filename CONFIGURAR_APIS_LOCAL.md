# 🔑 Configurar APIs para Desenvolvimento Local

## ⚠️ Problema

O sistema precisa de pelo menos uma API de IA configurada para gerar feedback:
- **Groq** (recomendado - mais rápido)
- **Gemini** (fallback)

## 📋 Passo a Passo

### 1. Obter Chaves de API

#### Groq (Principal):
1. Acesse: https://console.groq.com/
2. Faça login ou crie uma conta
3. Vá em **"API Keys"**
4. Clique em **"Create API Key"**
5. Copie a chave (começa com `gsk_...`)

#### Gemini (Fallback):
1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave (começa com `AIzaSy...`)

### 2. Configurar no arquivo `.env`

1. Abra o arquivo `back-end/.env` (se não existir, crie um novo)
2. Adicione as seguintes linhas:

```env
# Groq (Principal)
GROQ_API_KEY=gsk_sua_chave_groq_aqui

# Gemini (Fallback)
GEMINI_API_KEY=AIzaSy_sua_chave_gemini_aqui
```

**⚠️ IMPORTANTE:**
- Não adicione espaços antes ou depois do `=`
- Não coloque aspas ao redor da chave
- Substitua `sua_chave_groq_aqui` e `sua_chave_gemini_aqui` pelas chaves reais

### 3. Exemplo de `.env` completo:

```env
PORT=3000

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=reports@reports-480617.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID=1bgVkcQfZApa56woA1ZrmmqISt6XEuNknMhCapHXK4qI
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}

# APIs de IA
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
```

### 4. Reiniciar o Backend

Após adicionar as chaves:

1. Pare o servidor backend (Ctrl+C no terminal)
2. Inicie novamente:
   ```bash
   cd back-end
   npm run dev
   ```

### 5. Verificar se Funcionou

Ao iniciar o backend, você deve ver nos logs:

```
🔑 Chave do Groq processada. Tamanho: XX caracteres
🔑 Chave do Gemini processada. Tamanho: XX caracteres
```

Se aparecer:
```
❌ GROQ_API_KEY não configurada
❌ GEMINI_API_KEY não configurada
```

Significa que as chaves não foram configuradas corretamente. Verifique:
- Se o arquivo `.env` está na pasta `back-end/`
- Se as chaves estão escritas corretamente (sem espaços extras)
- Se reiniciou o servidor após adicionar as chaves

## ✅ Checklist

- [ ] Chave do Groq obtida
- [ ] Chave do Gemini obtida
- [ ] Arquivo `.env` criado/editado em `back-end/`
- [ ] Chaves adicionadas no formato correto
- [ ] Backend reiniciado
- [ ] Logs mostram que as chaves foram carregadas
- [ ] Teste de geração de feedback funcionando

## 🆘 Problemas Comuns

### Erro: "Nenhuma API de IA configurada"
- Verifique se o arquivo `.env` está na pasta `back-end/`
- Verifique se as chaves estão escritas corretamente
- Reinicie o servidor após adicionar as chaves

### Erro: "Invalid API key"
- Verifique se copiou a chave completa
- Verifique se não há espaços extras
- Tente gerar uma nova chave na plataforma

### Erro: "Rate limit exceeded"
- Você atingiu o limite de requisições
- Aguarde alguns minutos ou use a outra API (Gemini)

