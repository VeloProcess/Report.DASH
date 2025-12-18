# 🤖 Configurar Groq e Gemini

## ✅ Mudanças Realizadas

O sistema agora usa:
- **Groq** como API principal (mais rápida)
- **Gemini** como fallback (se Groq falhar)

## 📋 Configurar no Render

### 1. Acessar Environment Variables

1. Acesse: https://dashboard.render.com
2. Vá no projeto `feedback-backend-2jg4`
3. Clique em **"Environment"**

### 2. Adicionar Variáveis

Adicione estas duas variáveis:

**Variável 1 - Groq (Principal):**
- **Key**: `GROQ_API_KEY`
- **Value**: `sua_chave_groq_aqui`

**Variável 2 - Gemini (Fallback):**
- **Key**: `GEMINI_API_KEY`
- **Value**: `sua_chave_gemini_aqui`

### 3. Remover Variável Antiga (Opcional)

Se existir `OPENAI_API_KEY`, você pode removê-la ou deixá-la (não será usada).

### 4. Salvar e Fazer Redeploy

1. Clique em **"Save Changes"**
2. Vá em **"Manual Deploy"**
3. Clique em **"Deploy latest commit"**
4. Aguarde o deploy completar

## 🔄 Como Funciona

1. **Primeira tentativa**: Usa Groq (mais rápido)
2. **Se Groq falhar**: Automaticamente tenta Gemini
3. **Se ambos falharem**: Retorna erro

## ✅ Verificação

Após o deploy, verifique os logs:
- ✅ `🔑 Chave do Groq processada. Tamanho: X caracteres`
- ✅ `🔑 Chave do Gemini processada. Tamanho: X caracteres`
- ✅ `🤖 Tentando gerar feedback com Groq...`
- ✅ `✅ Feedback gerado com sucesso usando Groq` (ou Gemini se fallback)

## 📝 Dependências Adicionadas

- `@google/generative-ai` - Para Gemini
- `groq-sdk` - Para Groq

Essas dependências serão instaladas automaticamente no próximo deploy.

## ✅ Checklist

- [ ] `GROQ_API_KEY` adicionada no Render
- [ ] `GEMINI_API_KEY` adicionada no Render
- [ ] Valores corretos (sem espaços extras)
- [ ] Commit e push feitos
- [ ] Deploy no Render concluído
- [ ] Logs verificados
- [ ] Teste realizado

