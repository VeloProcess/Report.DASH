# 🔧 Corrigir Formato da Chave da OpenAI

## ⚠️ Problema Identificado

A chave da OpenAI está causando erro porque pode ter:
- Espaços extras
- Quebras de linha
- Aspas extras
- Caracteres inválidos

Erro: `Bearer ... is not a legal HTTP header value`

## ✅ Solução Aplicada

Melhorei o código para:
1. **Remover espaços** da chave
2. **Remover quebras de linha**
3. **Remover aspas extras**
4. **Validar formato** básico (deve começar com `sk-`)

## 📋 Verificar no Render

### 1. Acessar Variável de Ambiente

1. Acesse: https://dashboard.render.com
2. Vá no projeto `feedback-backend-2jg4`
3. Clique em **"Environment"**
4. Procure por `OPENAI_API_KEY`

### 2. Verificar Formato

A chave deve:
- ✅ Começar com `sk-`
- ✅ Ter aproximadamente 51 caracteres
- ✅ **NÃO ter espaços**
- ✅ **NÃO ter quebras de linha**
- ✅ **NÃO ter aspas** ao redor

### 3. Corrigir se Necessário

Se a chave tiver problemas:

1. Clique em **"Edit"** na variável `OPENAI_API_KEY`
2. **Remova todos os espaços** antes e depois
3. **Remova aspas** se houver (`"` ou `'`)
4. **Remova quebras de linha**
5. A chave deve estar em **uma única linha**
6. Clique em **"Save Changes"**

### 4. Exemplo de Formato Correto

```
sk-proj-sua_chave_openai_aqui_sem_espacos_nem_aspas
```

**NÃO deve ter:**
- Espaços no início ou fim
- Aspas ao redor
- Quebras de linha

### 5. Fazer Redeploy

Após corrigir:
1. No Render, vá em **"Manual Deploy"**
2. Clique em **"Deploy latest commit"**
3. Aguarde o deploy

### 6. Verificar Logs

Após o deploy, verifique os logs:
- `🔑 Chave da OpenAI processada. Tamanho: X caracteres`
- `🔑 Primeiros caracteres: sk-proj-V...`

Se aparecer erro sobre formato, a chave ainda está incorreta.

## ✅ Checklist

- [ ] Chave da OpenAI no Render sem espaços
- [ ] Chave sem aspas ao redor
- [ ] Chave em uma única linha
- [ ] Chave começa com `sk-`
- [ ] Commit e push feitos
- [ ] Redeploy realizado
- [ ] Logs verificados
- [ ] Teste realizado

