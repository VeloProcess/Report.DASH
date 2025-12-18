# 🔧 Corrigir Erro 500 ao Gerar Feedback

## ⚠️ Problema

Erro 500 ao tentar gerar feedback com IA. Pode ser causado por:
1. Chave da OpenAI não configurada no Render
2. Chave inválida ou expirada
3. Erro na chamada da API da OpenAI
4. Problema com os dados dos indicadores

## ✅ Soluções Aplicadas

1. **Validação da chave da OpenAI** antes de fazer a chamada
2. **Mensagens de erro mais específicas** para facilitar debug
3. **Logs detalhados** para identificar o problema

## 📋 Verificar no Render

### 1. Verificar Variável de Ambiente

1. Acesse: https://dashboard.render.com
2. Vá no projeto `feedback-backend-2jg4`
3. Clique em **"Environment"**
4. Verifique se existe `OPENAI_API_KEY`
5. Verifique se o valor está correto

### 2. Obter Chave da OpenAI

Se não tiver a chave:

1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em **"Create new secret key"**
4. Copie a chave gerada
5. No Render, adicione:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Cole a chave copiada
6. Clique em **"Save Changes"**
7. Faça **redeploy** do serviço

### 3. Verificar Logs

Após fazer commit e deploy, verifique os logs:

1. No Render, vá em **"Logs"**
2. Procure por:
   - `❌ OPENAI_API_KEY não configurada`
   - `OPENAI_API_KEY configurada: true/false`
   - `❌ Erro ao gerar feedback com OpenAI`

Os logs vão mostrar exatamente qual é o problema.

## 🔄 Próximos Passos

### 1. Fazer Commit e Push

```bash
git add back-end/src/integrations/openai/openaiService.js
git add back-end/src/controllers/feedbackController.js
git commit -m "Melhorar tratamento de erros na geração de feedback"
git push origin main
```

### 2. Configurar OPENAI_API_KEY no Render

Se ainda não estiver configurada, adicione no Render.

### 3. Fazer Redeploy

Após configurar a variável, faça redeploy:
1. No Render, vá em **"Manual Deploy"**
2. Clique em **"Deploy latest commit"**

### 4. Testar Novamente

Após o deploy, tente gerar feedback novamente.

## 🆘 Se Ainda Não Funcionar

1. **Verifique os logs do Render** para ver a mensagem de erro exata
2. **Teste a chave da OpenAI** em outro lugar para garantir que está válida
3. **Verifique se há créditos** na sua conta OpenAI
4. **Verifique se o modelo** `gpt-4o-mini` está disponível na sua conta

## ✅ Checklist

- [ ] Variável `OPENAI_API_KEY` configurada no Render
- [ ] Chave da OpenAI válida e com créditos
- [ ] Commit e push feitos
- [ ] Deploy no Render concluído
- [ ] Logs verificados
- [ ] Teste realizado

