@echo off
echo ========================================
echo Fechando porta 3000
echo ========================================
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Encontrado processo PID %%a na porta 3000
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Processo %%a finalizado
    ) else (
        echo [ERRO] Nao foi possivel finalizar processo %%a
    )
)

echo.
echo Verificando se a porta esta livre...
netstat -ano | findstr :3000 | findstr LISTENING >nul
if !errorlevel! equ 0 (
    echo [ATENCAO] Porta 3000 ainda esta em uso!
) else (
    echo [OK] Porta 3000 esta livre!
)

echo.
timeout /t 2 >nul

