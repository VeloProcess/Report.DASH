# ✅ Configurar Vercel com o Backend do Render

## 🎯 Backend Configurado

Seu backend está rodando em:
```
https://feedback-backend-2jg4.onrender.com
```

## 📋 Próximos Passos

### Passo 1: Verificar se o Backend Está Funcionando

Teste acessando:
```
https://feedback-backend-2jg4.onrender.com/api/health
```

Deve retornar:
```json
{"status":"ok","message":"Sistema de Feedback funcionando"}
```

### Passo 2: Configurar Variável de Ambiente no Vercel

1. Acesse: https://vercel.com
2. Vá no seu projeto (relatoriosvelotax)
3. Clique em **"Settings"** → **"Environment Variables"**
4. Adicione uma nova variável:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://feedback-backend-2jg4.onrender.com/api`
   - **Environment**: Marque todas as opções (Production, Preview, Development)
5. Clique em **"Save"**

### Passo 3: Fazer Novo Deploy do Frontend

**Opção A - Via Dashboard:**
1. No Vercel, vá em **"Deployments"**
2. Clique nos três pontos (...) do último deployment
3. Selecione **"Redeploy"**
4. Aguarde o deploy completar

**Opção B - Via Git:**
```bash
git add .
git commit -m "Configurar API URL para produção"
git push origin main
```

O Vercel vai fazer deploy automaticamente.

### Passo 4: Verificar se Está Funcionando

Após o deploy:
1. Acesse: `https://relatoriosvelotax.vercel.app`
2. Teste criar um operador
3. Teste buscar dados da planilha
4. Verifique se não há erros no console do navegador

## 🔍 Troubleshooting

### Erro de CORS

Se aparecer erro de CORS, o backend já está configurado para aceitar requisições do Vercel. Mas se ainda der erro:

1. Verifique se o CORS no backend está correto (já está configurado)
2. Verifique se a URL no Vercel está correta: `https://feedback-backend-2jg4.onrender.com/api`

### Erro 404 no Frontend

- Verifique se `VITE_API_URL` está configurada no Vercel
- Verifique se o valor está correto: `https://feedback-backend-2jg4.onrender.com/api`
- Faça um novo deploy após configurar a variável

### Backend não responde

- Verifique se o backend está rodando: `https://feedback-backend-2jg4.onrender.com/api/health`
- Verifique os logs no Render
- Certifique-se de que todas as variáveis de ambiente estão configuradas no Render

## ✅ Checklist Final

- [ ] Backend funcionando: `https://feedback-backend-2jg4.onrender.com/api/health`
- [ ] Variável `VITE_API_URL` configurada no Vercel
- [ ] Valor da variável: `https://feedback-backend-2jg4.onrender.com/api`
- [ ] Novo deploy do frontend feito
- [ ] Frontend testado e funcionando

## 🎉 Pronto!

Após seguir esses passos, seu sistema completo deve estar funcionando:
- ✅ Backend: Render (`https://feedback-backend-2jg4.onrender.com`)
- ✅ Frontend: Vercel (`https://relatoriosvelotax.vercel.app`)
- ✅ Comunicação configurada entre eles

