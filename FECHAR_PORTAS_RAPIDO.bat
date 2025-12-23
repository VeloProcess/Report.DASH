@echo off
echo ========================================
echo Fechando portas 3001, 3002, 3003, 3004
echo ========================================
echo.

for %%p in (3001 3002 3003 3004) do (
    echo Verificando porta %%p...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
        echo   Encontrado processo PID %%a na porta %%p
        taskkill /F /PID %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo   [OK] Processo %%a finalizado
        )
    )
)

echo.
echo Concluido!
timeout /t 2 >nul

