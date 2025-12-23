@echo off
echo ========================================
echo Commit - Feedback 3 Topicos
echo ========================================
echo.

echo [1/3] Adicionando arquivo modificado...
git add back-end/src/integrations/ai/aiService.js

echo.
echo [2/3] Fazendo commit...
git commit -m "Refatorar feedback para focar em 3 topicos: Chamadas, Tickets e Pausas com comparacao de medias"

echo.
echo [3/3] Fazendo push...
git push origin main

echo.
echo ========================================
echo Concluido!
echo ========================================
pause

