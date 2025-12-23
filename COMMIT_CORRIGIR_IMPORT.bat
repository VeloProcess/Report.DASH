@echo off
echo ========================================
echo Corrigir Import Database
echo ========================================
echo.

echo [1/3] Adicionando arquivo corrigido...
git add back-end/src/integrations/ai/aiService.js

echo.
echo [2/3] Fazendo commit...
git commit -m "Corrigir caminho do import database.js no aiService"

echo.
echo [3/3] Fazendo push...
git push origin main

echo.
echo ========================================
echo Concluido!
echo ========================================
pause

