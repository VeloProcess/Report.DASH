# 🔍 Verificar Chave da OpenAI

## ⚠️ Problema

A chave está sendo rejeitada pela OpenAI mesmo sendo a mesma chave. Possíveis causas:

1. **Chave revogada ou expirada**
2. **Sem créditos na conta OpenAI**
3. **Chave com espaços/caracteres extras no Render**
4. **Chave incorreta no Render**

## ✅ Verificações Necessárias

### 1. Verificar se a Chave Está Ativa

1. Acesse: https://platform.openai.com/api-keys
2. Verifique se a chave `sk-proj-...` está listada
3. Verifique se está **ativa** (não revogada)
4. Se estiver revogada ou não aparecer, **crie uma nova chave**

### 2. Verificar Créditos na Conta

1. Acesse: https://platform.openai.com/account/billing
2. Verifique se há **créditos disponíveis**
3. Se não houver créditos, **adicione créditos** (mínimo geralmente $5-10)
4. Aguarde alguns minutos para processar

### 3. Verificar Chave no Render

1. Acesse: https://dashboard.render.com
2. Vá no projeto `feedback-backend-2jg4`
3. Clique em **"Environment"**
4. Procure por `OPENAI_API_KEY`
5. Clique em **"Edit"**
6. **Verifique se a chave está EXATAMENTE assim** (sem espaços, sem aspas):
   ```
   sk-proj-sua_chave_openai_aqui_sem_espacos_nem_aspas
   ```
7. Se estiver diferente, **cole novamente** exatamente como está acima
8. Clique em **"Save Changes"**

### 4. Testar a Chave Diretamente

Você pode testar se a chave funciona usando curl ou Postman:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-proj-sua_chave_openai_aqui"
```

Se retornar lista de modelos, a chave está funcionando.
Se retornar erro 401, a chave está inválida ou sem créditos.

### 5. Criar Nova Chave (Se Necessário)

Se a chave não funcionar:

1. Acesse: https://platform.openai.com/api-keys
2. Clique em **"Create new secret key"**
3. Dê um nome (ex: "Sistema de Feedback - Nova")
4. Clique em **"Create secret key"**
5. **COPIE A NOVA CHAVE**
6. Cole no Render substituindo a antiga
7. Faça redeploy

## 🔍 Verificar Logs do Render

Após fazer as correções, verifique os logs:

- Deve aparecer: `🔑 Chave da OpenAI processada. Tamanho: X caracteres`
- Deve aparecer: `🔑 Primeiros caracteres: sk-proj-V...`
- **NÃO deve aparecer**: `Incorrect API key provided`

## ✅ Checklist

- [ ] Chave verificada em https://platform.openai.com/api-keys (ativa)
- [ ] Créditos verificados em https://platform.openai.com/account/billing
- [ ] Chave verificada no Render (formato correto, sem espaços)
- [ ] Chave testada diretamente (curl ou Postman)
- [ ] Nova chave criada se necessário
- [ ] Redeploy feito no Render
- [ ] Logs verificados
- [ ] Teste realizado

## 💡 Dica

Se a chave não funcionar mesmo após todas as verificações, **crie uma nova chave**. Às vezes chaves antigas podem ter problemas ou ter sido revogadas automaticamente.

