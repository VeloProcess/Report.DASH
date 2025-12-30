@echo off
echo ========================================
echo Iniciando servidor backend na porta 3001...
echo ========================================
cd back-end
echo.
echo Verificando se node_modules existe...
if not exist "node_modules" (
    echo node_modules nao encontrado. Instalando dependencias...
    call npm install
    echo.
)
echo.
echo Iniciando servidor na porta 3001...
echo Pressione Ctrl+C para parar o servidor
echo.
call npm start
pause

