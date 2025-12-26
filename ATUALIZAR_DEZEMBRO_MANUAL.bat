@echo off
echo ========================================
echo   Atualizar Dados de Dezembro (Manual)
echo ========================================
echo.
echo Este script atualiza os dados de Dezembro
echo usando o arquivo preencher_dezembro.js
echo.
echo Certifique-se de ter editado o arquivo
echo back-end/scripts/preencher_dezembro.js
echo com os novos dados antes de executar!
echo.
pause
echo.
echo Executando atualizacao...
cd back-end
node scripts/preencher_dezembro.js
echo.
pause

