# ⚡ Guia Rápido - Deploy no Render

## 🎯 Passos Essenciais

### 1. Acesse o Render
👉 https://render.com

### 2. Faça Login com GitHub
- Clique em "Get Started for Free"
- Escolha "Sign in with GitHub"

### 3. Crie Novo Web Service
- Clique em **"New +"** → **"Web Service"**
- Conecte seu repositório: `VeloProcess/Relatorios`

### 4. Configure Assim:

```
Nome: feedback-backend
Root Directory: back-end
Branch: main
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

### 5. Adicione Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```
PORT=3000
NODE_ENV=production
GOOGLE_SERVICE_ACCOUNT_EMAIL=reports@reports-480617.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID=1bgVkcQfZApa56woA1ZrmmqISt6XEuNknMhCapHXK4qI
GOOGLE_CREDENTIALS_JSON={cole o JSON completo aqui em uma linha}
OPENAI_API_KEY=sua_chave_aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
```

### 6. Clique em "Create Web Service"

### 7. Aguarde o Build (5-10 minutos)

### 8. Copie a URL do Backend

Você receberá uma URL como: `https://feedback-backend.onrender.com`

### 9. Configure no Vercel

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione:
   - **Nome**: `VITE_API_URL`
   - **Valor**: `https://feedback-backend.onrender.com/api`
3. Faça novo deploy do frontend

## ✅ Pronto!

Agora seu sistema deve funcionar:
- Backend: Render
- Frontend: Vercel
- Comunicação entre eles configurada

## 🆘 Problemas?

- **Build falhou?** → Veja os logs no Render
- **CORS error?** → Já está configurado no código
- **404 no frontend?** → Verifique se `VITE_API_URL` está configurado no Vercel

