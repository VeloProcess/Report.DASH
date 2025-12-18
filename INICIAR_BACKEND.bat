@echo off
echo Iniciando Backend...
echo.
echo Verificando se a porta 3000 esta em uso...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo Porta 3000 esta em uso. Tentando liberar...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        echo Encerrando processo PID: %%a
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
cd back-end
echo Verificando se o Node.js esta instalado...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado. Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)
echo Iniciando servidor na porta 3000...
call "C:\Program Files\nodejs\npm.cmd" start
pause

