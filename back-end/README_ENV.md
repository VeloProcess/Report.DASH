# 📋 Configurar Variáveis de Ambiente

## ⚠️ IMPORTANTE

O arquivo `.env` **NÃO** está no controle de versão (Git) por segurança.

Você precisa criar o arquivo `.env` manualmente na pasta `back-end/`.

## 📝 Criar arquivo `.env`

1. Crie um arquivo chamado `.env` na pasta `back-end/`
2. Copie o conteúdo abaixo e preencha com suas chaves:

```env
# Porta do servidor
PORT=3000

# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL=reports@reports-480617.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID=1bgVkcQfZApa56woA1ZrmmqISt6XEuNknMhCapHXK4qI
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"reports-480617",...}

# APIs de IA (OBRIGATÓRIO - pelo menos uma)
GROQ_API_KEY=gsk_sua_chave_groq_aqui
GEMINI_API_KEY=AIzaSy_sua_chave_gemini_aqui

# Email (para envio de feedback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
```

## 🔑 Como Obter as Chaves

### Groq (Principal):
1. Acesse: https://console.groq.com/
2. Faça login ou crie uma conta
3. Vá em **"API Keys"**
4. Clique em **"Create API Key"**
5. Copie a chave (começa com `gsk_...`)

### Gemini (Fallback):
1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave (começa com `AIzaSy...`)

## ✅ Verificar Configuração

Execute o script `VERIFICAR_APIS.bat` na raiz do projeto para verificar se as chaves estão configuradas.

## 🆘 Problemas

Se você receber o erro "Nenhuma API de IA configurada":
1. Verifique se o arquivo `.env` está na pasta `back-end/`
2. Verifique se as chaves estão escritas corretamente (sem espaços extras)
3. Reinicie o servidor após adicionar as chaves

