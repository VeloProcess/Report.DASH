# 🔧 Corrigir Backend no Render - Erro 404

## Problema
Erro: `POST https://feedback-backend-2jg4.onrender.com/api/auth/login 404 (Not Found)`

## Causa
O backend no Render não está com as rotas atualizadas ou não está rodando corretamente.

## Solução

### 1. Verificar se o Backend está Rodando
Acesse: https://feedback-backend-2jg4.onrender.com/api/health

Se retornar `{"status":"ok",...}` o backend está rodando.
Se retornar erro, o backend não está rodando.

### 2. Fazer Novo Deploy do Backend no Render

**Opção A: Deploy Manual**
1. Acesse: https://dashboard.render.com
2. Vá no seu serviço backend
3. Clique em "Manual Deploy" > "Deploy latest commit"

**Opção B: Deploy via Git**
```bash
# Fazer commit vazio para forçar deploy
git commit --allow-empty -m "chore: Forçar redeploy do backend no Render"
git push origin main
```

### 3. Verificar Configurações no Render

No dashboard do Render, verifique:

1. **Build Command:**
   ```
   cd back-end && npm install
   ```

2. **Start Command:**
   ```
   cd back-end && npm start
   ```

3. **Environment Variables:**
   Certifique-se de que todas as variáveis estão configuradas:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET`
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - E outras necessárias

### 4. Verificar Logs do Render

No dashboard do Render:
1. Vá em "Logs"
2. Verifique se há erros
3. Procure por mensagens como "Servidor rodando em..."

### 5. Verificar se o package.json tem o script "start"

O `back-end/package.json` deve ter:
```json
{
  "scripts": {
    "start": "node src/server.js"
  }
}
```

## Verificação

Após o deploy:
1. Acesse: https://feedback-backend-2jg4.onrender.com/api/health
2. Deve retornar: `{"status":"ok","message":"Sistema de Feedback funcionando"}`
3. Tente fazer login novamente no frontend

## Se ainda não funcionar

1. Verifique os logs do Render para erros específicos
2. Verifique se todas as dependências estão instaladas
3. Verifique se o arquivo `src/server.js` existe e está correto
4. Verifique se a porta está configurada corretamente (Render usa `process.env.PORT`)

