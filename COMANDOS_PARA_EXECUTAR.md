# 📋 Comandos para Executar

## ⚠️ IMPORTANTE
O Git não está no PATH do PowerShell. Você precisa executar estes comandos manualmente usando:
- **Git Bash** (recomendado)
- **CMD** (se Git estiver no PATH do CMD)
- Ou adicionar Git ao PATH do PowerShell

## 🔧 Opção 1: Commit Simples (Tente Primeiro)

Execute estes comandos no Git Bash ou CMD:

```bash
git add CONFIGURAR_GROQ_GEMINI.md DIAGNOSTICO_CHAVE_OPENAI.md VERIFICAR_CHAVE_OPENAI.md CORRIGIR_CHAVE_OPENAI_FORMATO.md

git commit -m "Remover todas as chaves de API expostas da documentacao"

git push origin main
```

## 🔧 Opção 2: Limpar Histórico Completo (Se Opção 1 Falhar)

Se ainda der erro de credenciais, execute estes comandos para limpar completamente o histórico:

```bash
# 1. Remover referência HEAD
git update-ref -d HEAD

# 2. Remover arquivos do stage
git rm -r --cached .

# 3. Adicionar arquivos novamente
git add .

# 4. Fazer commit limpo
git commit -m "Sistema de Feedback de Produtividade - Versao limpa sem credenciais expostas"

# 5. Remover remote antigo
git remote remove origin

# 6. Adicionar remote novamente
git remote add origin https://github.com/VeloProcess/Relatorios.git

# 7. Fazer force push (substituir histórico remoto)
git push -f origin main
```

## ✅ Arquivos Corrigidos

Todos estes arquivos foram corrigidos e não contêm mais chaves reais:
- ✅ `CONFIGURAR_GROQ_GEMINI.md`
- ✅ `DIAGNOSTICO_CHAVE_OPENAI.md`
- ✅ `VERIFICAR_CHAVE_OPENAI.md`
- ✅ `CORRIGIR_CHAVE_OPENAI_FORMATO.md`

## 📝 Nota

Os scripts `.bat` criados (`FAZER_COMMIT_LIMPO.bat` e `LIMPAR_HISTORICO_COMPLETO.bat`) podem ser executados diretamente clicando duas vezes neles, mas só funcionarão se o Git estiver no PATH do sistema.

