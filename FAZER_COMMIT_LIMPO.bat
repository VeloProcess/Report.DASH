@echo off
echo ========================================
echo Fazer Commit Limpo Sem Credenciais
echo ========================================
echo.

echo [1/4] Adicionando arquivos corrigidos...
git add CONFIGURAR_GROQ_GEMINI.md DIAGNOSTICO_CHAVE_OPENAI.md

echo.
echo [2/4] Fazendo commit...
git commit -m "Remover todas as chaves de API expostas da documentacao"

echo.
echo [3/4] Fazendo push...
git push origin main

echo.
echo ========================================
echo Concluido!
echo ========================================
echo.
echo Se ainda der erro, execute LIMPAR_HISTORICO_COMPLETO.bat
echo para remover completamente o historico do Git.
echo.
pause

