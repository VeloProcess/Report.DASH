# 🔍 Diagnóstico da Chave da OpenAI

## 📋 Chave Fornecida

```
sk-proj-sua_chave_openai_aqui
```

## ✅ Verificações Necessárias

### 1. Verificar se a Chave Está Ativa

1. Acesse: https://platform.openai.com/api-keys
2. Faça login
3. Procure pela chave que começa com `sk-proj-...`
4. Verifique se está **ativa** (não revogada)
5. Se não aparecer ou estiver revogada, **crie uma nova chave**

### 2. Verificar Créditos (MUITO IMPORTANTE)

A API da OpenAI **requer créditos** na conta:

1. Acesse: https://platform.openai.com/account/billing
2. Verifique se há **créditos disponíveis**
3. Se mostrar **$0.00** ou **sem créditos**, você precisa:
   - Adicionar método de pagamento
   - Adicionar créditos (mínimo geralmente $5-10)
   - Aguardar alguns minutos para processar

**⚠️ SEM CRÉDITOS, A API NÃO FUNCIONA, MESMO COM CHAVE VÁLIDA!**

### 3. Verificar Chave no Render

1. Acesse: https://dashboard.render.com
2. Vá no projeto `feedback-backend-2jg4`
3. Clique em **"Environment"**
4. Procure por `OPENAI_API_KEY`
5. Clique em **"Edit"**
6. **Verifique se está EXATAMENTE assim** (sem espaços, sem aspas, em uma linha):
   ```
   sk-proj-sua_chave_openai_aqui_sem_espacos_nem_aspas
   ```
7. Se estiver diferente, **cole novamente** exatamente como está acima
8. **Remova qualquer espaço** antes ou depois
9. **Remova aspas** se houver
10. Clique em **"Save Changes"**

### 4. Testar a Chave Diretamente

Teste se a chave funciona usando este comando (no PowerShell ou CMD):

```powershell
curl https://api.openai.com/v1/models -H "Authorization: Bearer sk-proj-sua_chave_openai_aqui"
```

**Se retornar lista de modelos**: A chave está funcionando ✅
**Se retornar erro 401**: A chave está inválida ou sem créditos ❌

### 5. Verificar Logs do Render

Após fazer redeploy, verifique os logs:

- ✅ Deve aparecer: `🔑 Chave da OpenAI processada. Tamanho: X caracteres`
- ✅ Deve aparecer: `🔑 Primeiros caracteres: sk-proj-...`
- ✅ Deve aparecer: `🔑 Últimos caracteres: ...izZcqEA`
- ❌ **NÃO deve aparecer**: `Incorrect API key provided`

## 🎯 Causa Mais Provável

**Falta de créditos na conta OpenAI**. Mesmo com chave válida, a API não funciona sem créditos.

## ✅ Solução Rápida

1. **Verifique créditos**: https://platform.openai.com/account/billing
2. **Se não houver créditos**: Adicione método de pagamento e créditos
3. **Aguarde alguns minutos** para processar
4. **Teste novamente**

## 📝 Checklist

- [ ] Chave verificada em https://platform.openai.com/api-keys (ativa)
- [ ] **Créditos verificados** em https://platform.openai.com/account/billing ⚠️
- [ ] Chave verificada no Render (formato correto)
- [ ] Chave testada diretamente (curl)
- [ ] Redeploy feito no Render
- [ ] Logs verificados
- [ ] Teste realizado

