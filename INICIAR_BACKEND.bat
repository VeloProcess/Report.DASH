@echo off
echo ========================================
echo Iniciando Backend na porta 3000
echo ========================================
echo.

cd back-end

echo Verificando se Node.js esta instalado...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Verificando se a porta 3000 esta livre...
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo AVISO: Porta 3000 ja esta em uso!
    echo Tentando liberar a porta...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        echo Encerrando processo PID %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo.
echo Instalando dependencias (se necessario)...
call npm install

echo.
echo ========================================
echo Iniciando servidor...
echo ========================================
echo.
echo Servidor rodando em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

npm run dev
