# 🚀 Solução Rápida para o Erro 404 no Vercel

## 🔍 Problema Identificado

O erro 404 no Vercel (`relatoriosvelotax.vercel.app`) acontece porque:

1. **O frontend está configurado para usar `localhost:3000`** - isso não funciona em produção
2. **O backend precisa estar deployado** em algum lugar
3. **As variáveis de ambiente não estão configuradas** no Vercel

## ✅ Solução Passo a Passo

### Passo 1: Atualizar a Configuração da API

Já atualizei o arquivo `front-end/src/services/api.js` para usar variáveis de ambiente.

### Passo 2: Fazer Build do Frontend

```bash
cd front-end
npm run build
```

### Passo 3: Deploy no Vercel

**Opção A - Via Vercel Dashboard:**
1. Acesse: https://vercel.com
2. Clique em "Add New Project"
3. Conecte seu repositório GitHub
4. Configure:
   - **Root Directory**: `front-end`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

**Opção B - Via CLI:**
```bash
cd front-end
npm install -g vercel
vercel login
vercel --prod
```

### Passo 4: Configurar Variáveis de Ambiente no Vercel

1. Acesse seu projeto no Vercel: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione:
   - **Nome**: `VITE_API_URL`
   - **Valor**: URL do seu backend (ex: `https://seu-backend.railway.app` ou `https://seu-backend.render.com`)

### Passo 5: Deploy do Backend

O backend precisa estar rodando em algum lugar. Opções:

**Railway (Recomendado - Grátis):**
1. Acesse: https://railway.app
2. Conecte seu GitHub
3. Crie novo projeto
4. Adicione o diretório `back-end`
5. Configure variáveis de ambiente:
   - `PORT=3000`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL=...`
   - `GOOGLE_SPREADSHEET_ID=...`
   - `GOOGLE_CREDENTIALS_JSON=...`
   - `OPENAI_API_KEY=...`
   - `SMTP_HOST=...`
   - `SMTP_PORT=...`
   - `SMTP_USER=...`
   - `SMTP_PASS=...`

**Render (Alternativa):**
1. Acesse: https://render.com
2. Crie novo Web Service
3. Conecte seu repositório
4. Configure:
   - **Root Directory**: `back-end`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Passo 6: Atualizar URL da API no Vercel

Depois de fazer deploy do backend, atualize a variável `VITE_API_URL` no Vercel com a URL do backend.

## 🎯 Resumo

1. ✅ Frontend: Deploy no Vercel
2. ✅ Backend: Deploy no Railway/Render
3. ✅ Configurar `VITE_API_URL` no Vercel apontando para o backend
4. ✅ Configurar todas as variáveis de ambiente no backend

## 🆘 Ainda com Problemas?

- Verifique os logs do Vercel
- Verifique se o build está funcionando localmente
- Certifique-se de que o backend está acessível publicamente

