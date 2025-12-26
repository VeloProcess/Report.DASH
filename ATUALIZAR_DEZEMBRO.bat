@echo off
echo ========================================
echo   Atualizar Dados de Dezembro
echo ========================================
echo.
echo Certifique-se de que o arquivo "Feedback operadores.xlsx"
echo esta atualizado na pasta db.dados com os novos dados!
echo.
pause
echo.
echo Executando atualizacao...
cd back-end
node scripts/atualizar_dezembro_xlsx.js
echo.
pause

