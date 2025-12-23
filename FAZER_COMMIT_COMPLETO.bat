@echo off
echo ========================================
echo Commit Completo - Todas as Correcoes
echo ========================================
echo.

echo [1/4] Adicionando arquivo principal modificado...
git add back-end/src/integrations/ai/aiService.js

echo.
echo [2/4] Adicionando arquivos de documentacao...
git add COMANDOS_GIT.md COMANDOS_GIT_FEEDBACK.md

echo.
echo [3/4] Fazendo commit...
git commit -m "Corrigir formatacao do feedback, processamento JSON e caminho do import database.js"

echo.
echo [4/4] Fazendo push...
git push origin main

echo.
echo ========================================
echo Concluido!
echo ========================================
pause

