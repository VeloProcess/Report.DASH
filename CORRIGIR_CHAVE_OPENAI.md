# 🔑 Corrigir Chave da OpenAI no Render

## ⚠️ Problema Identificado

A chave da OpenAI está configurada com o valor placeholder `sua_chav*********aqui` ao invés da chave real.

## ✅ Solução

### 1. Obter Chave da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Se não tiver uma chave, clique em **"Create new secret key"**
4. Dê um nome para a chave (ex: "Sistema de Feedback")
5. Clique em **"Create secret key"**
6. **COPIE A CHAVE IMEDIATAMENTE** (ela só aparece uma vez!)

### 2. Configurar no Render

1. Acesse: https://dashboard.render.com
2. Vá no projeto `feedback-backend-2jg4`
3. Clique em **"Environment"**
4. Procure por `OPENAI_API_KEY`
5. Clique em **"Edit"** ou **"Add"** se não existir
6. Cole a chave completa que você copiou
7. Clique em **"Save Changes"**

### 3. Fazer Redeploy

Após salvar a variável:

1. No Render, vá em **"Manual Deploy"**
2. Clique em **"Deploy latest commit"**
3. Aguarde o deploy completar

### 4. Verificar Logs

Após o deploy, verifique os logs:
- Não deve mais aparecer `sua_chav*********aqui`
- Deve aparecer `OPENAI_API_KEY configurada: true`

## 🔍 Sobre o Erro 404

O erro 404 nas rotas pode ser temporário ou relacionado ao CORS. Após corrigir a chave da OpenAI e fazer redeploy, teste novamente.

## ✅ Checklist

- [ ] Chave da OpenAI obtida em https://platform.openai.com/api-keys
- [ ] Chave copiada completamente
- [ ] Variável `OPENAI_API_KEY` atualizada no Render
- [ ] Valor salvo corretamente (sem espaços extras)
- [ ] Redeploy feito no Render
- [ ] Logs verificados
- [ ] Teste de geração de feedback realizado

## 💡 Dica

A chave da OpenAI deve começar com `sk-` e ter aproximadamente 51 caracteres. Se não começar com `sk-`, está incorreta.

