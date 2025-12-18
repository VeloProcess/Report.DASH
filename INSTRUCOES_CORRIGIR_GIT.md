# 🔧 Como Corrigir o Problema das Credenciais no Git

O GitHub está bloqueando o push porque detectou credenciais sensíveis no **histórico do Git** (commit `2740e9238860200c12ff39ac56b88d077939eec2`).

## ⚠️ Problema

Mesmo que você tenha removido o arquivo `FORMATO_CORRETO_ENV.txt` do commit atual, o GitHub ainda detecta as credenciais no **histórico anterior**.

## ✅ Solução

Precisamos remover o commit com credenciais do histórico e fazer um novo commit limpo.

### Opção 1: Usar o Script Automático (Recomendado)

Execute o arquivo `CORRIGIR_GIT.bat` que foi criado:

```bash
CORRIGIR_GIT.bat
```

### Opção 2: Comandos Manuais

Execute estes comandos **na ordem**:

```bash
# 1. Voltar 2 commits (remover os commits com credenciais)
git reset --soft HEAD~2

# 2. Remover FORMATO_CORRETO_ENV.txt do stage
git reset HEAD FORMATO_CORRETO_ENV.txt

# 3. Adicionar todos os arquivos (exceto FORMATO_CORRETO_ENV.txt que está no .gitignore)
git add .

# 4. Fazer um novo commit limpo
git commit -m "Primeiro commit - Sistema de Feedback de Produtividade"

# 5. Fazer force push para substituir o histórico no GitHub
git push -f origin main
```

## 📝 Notas Importantes

- ⚠️ O `git push -f` vai **sobrescrever** o histórico no GitHub. Como é o primeiro commit, isso é seguro.
- ✅ O arquivo `FORMATO_CORRETO_ENV.txt` agora contém apenas placeholders (valores de exemplo).
- ✅ O arquivo está no `.gitignore`, então não será commitado novamente.
- ✅ Suas credenciais reais devem estar apenas no arquivo `.env` local (que também está no `.gitignore`).

## 🔐 Segurança

**NUNCA** faça commit de:
- Credenciais reais
- Chaves de API
- Senhas
- Tokens de acesso

Sempre use arquivos `.env` (que estão no `.gitignore`) ou variáveis de ambiente.

