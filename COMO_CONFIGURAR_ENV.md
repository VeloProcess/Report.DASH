# 🔧 Como Configurar o Arquivo .env

## ⚠️ Problema: "API não configurada" ou retorna "false"

Isso significa que o arquivo `.env` não está configurado corretamente ou não está sendo lido.

## 📋 Passo a Passo

### 1. Verificar se o arquivo existe

O arquivo `.env` deve estar na pasta `back-end/` (não na raiz do projeto).

**Caminho correto:** `back-end/.env`

### 2. Criar/Editar o arquivo `.env`

1. Abra o arquivo `back-end/.env` em um editor de texto (Notepad, VS Code, etc.)
2. Adicione estas linhas:

```env
GROQ_API_KEY=gsk_sua_chave_groq_aqui
GEMINI_API_KEY=AIzaSy_sua_chave_gemini_aqui
```

### 3. Formato CORRETO ✅

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Formato ERRADO ❌

```env
# ERRADO - com espaços
GROQ_API_KEY = gsk_xxxxx

# ERRADO - com aspas
GROQ_API_KEY="gsk_xxxxx"

# ERRADO - com comentário na mesma linha
GROQ_API_KEY=gsk_xxxxx # minha chave

# ERRADO - vazio
GROQ_API_KEY=
```

### 5. Verificar o arquivo

Execute o script `VERIFICAR_ENV.bat` para verificar se está correto.

### 6. Reiniciar o Backend

**IMPORTANTE:** Após editar o `.env`, você DEVE reiniciar o backend:

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente:
   ```bash
   cd back-end
   npm run dev
   ```

### 7. Verificar nos Logs

Ao iniciar o backend, você deve ver:

```
✅ Chave do Groq processada. Tamanho: XX caracteres
✅ Chave do Gemini processada. Tamanho: XX caracteres
```

Se aparecer:
```
❌ GROQ_API_KEY não configurada no .env
❌ GEMINI_API_KEY não configurada no .env
```

Significa que:
- O arquivo `.env` não está na pasta `back-end/`
- As linhas não estão escritas corretamente
- Você não reiniciou o backend após editar

## 🆘 Problemas Comuns

### "Arquivo .env não encontrado"
- Certifique-se de que o arquivo está em `back-end/.env` (não na raiz)
- O arquivo pode estar oculto - habilite "Mostrar arquivos ocultos" no Windows

### "API retorna false mesmo configurada"
- Verifique se não há espaços extras antes ou depois do `=`
- Verifique se não há aspas ao redor das chaves
- Reinicie o backend após editar o `.env`
- Verifique se o arquivo está salvo corretamente

### "Chave inválida"
- Verifique se copiou a chave completa
- Verifique se não há espaços ou caracteres extras
- Tente gerar uma nova chave na plataforma

## 📝 Exemplo Completo de `.env`

```env
# Porta do servidor
PORT=3000

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=reports@reports-480617.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID=1bgVkcQfZApa56woA1ZrmmqISt6XEuNknMhCapHXK4qI
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}

# APIs de IA (OBRIGATÓRIO)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
```

