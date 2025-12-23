@echo off
echo ========================================
echo Commit - Correcoes Feedback
echo ========================================
echo.

echo [1/3] Adicionando arquivos modificados...
git add back-end/src/integrations/ai/aiService.js

echo.
echo [2/3] Fazendo commit...
git commit -m "Corrigir formatacao do feedback e processamento de JSON em metricsAnalysis"

echo.
echo [3/3] Fazendo push...
git push origin main

echo.
echo ========================================
echo Concluido!
echo ========================================
pause

