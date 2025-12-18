# 🚀 Como Fazer Deploy no Vercel

## ⚠️ Problema Atual

O erro 404 no Vercel acontece porque a aplicação não está configurada corretamente para deploy.

## 📋 Estrutura do Projeto

Este projeto tem:
- **Frontend**: React + Vite (em `front-end/`)
- **Backend**: Node.js + Express (em `back-end/`)

## 🔧 Solução: Deploy Separado

O Vercel funciona melhor quando você faz deploy separado do frontend e backend.

### Opção 1: Deploy do Frontend no Vercel (Recomendado)

1. **Instale o Vercel CLI** (se ainda não tiver):
   ```bash
   npm install -g vercel
   ```

2. **Faça login no Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy do Frontend**:
   ```bash
   cd front-end
   vercel
   ```
   - Escolha as opções padrão
   - O Vercel vai detectar automaticamente que é um projeto Vite

4. **Configure as variáveis de ambiente no Vercel**:
   - Acesse: https://vercel.com/seu-projeto/settings/environment-variables
   - Adicione a variável:
     ```
     VITE_API_URL=https://seu-backend.vercel.app
     ```

### Opção 2: Deploy do Backend no Vercel (Serverless Functions)

O backend precisa ser convertido para Serverless Functions do Vercel.

1. **Crie a pasta `api` na raiz**:
   ```
   api/
   └── index.js
   ```

2. **Configure o `vercel.json`** para usar Serverless Functions

### Opção 3: Deploy do Backend em Outro Serviço (Recomendado)

Para aplicações com backend completo (não apenas APIs), é melhor usar:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com
- **Fly.io**: https://fly.io

## 🎯 Solução Rápida: Deploy do Frontend

Para fazer funcionar rapidamente:

1. **Build do Frontend**:
   ```bash
   cd front-end
   npm run build
   ```

2. **Deploy no Vercel**:
   ```bash
   vercel --prod
   ```

3. **Configure a URL da API**:
   - No arquivo `front-end/src/services/api.js`, altere:
   ```javascript
   const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';
   ```

4. **Adicione variável de ambiente no Vercel**:
   - `VITE_API_URL`: URL do seu backend (ex: `https://seu-backend.railway.app`)

## 📝 Arquivos Criados

- `vercel.json`: Configuração principal do Vercel
- `front-end/vercel.json`: Configuração específica do frontend

## ⚠️ Importante

- O backend precisa estar rodando em algum lugar (Railway, Render, etc.)
- Configure as variáveis de ambiente do backend no serviço escolhido
- O frontend vai fazer chamadas para a API do backend

## 🆘 Ainda com Problemas?

1. Verifique os logs do Vercel: https://vercel.com/seu-projeto/logs
2. Verifique se o build está funcionando: `npm run build` na pasta `front-end`
3. Certifique-se de que todas as variáveis de ambiente estão configuradas

