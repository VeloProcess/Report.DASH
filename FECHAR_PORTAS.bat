@echo off
echo ========================================
echo Fechando todas as portas de servidores
echo ========================================
echo.

REM Portas específicas para fechar
set PORTAS=3001 3002 3003 3004

for %%p in (%PORTAS%) do (
    echo Verificando porta %%p...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
        echo Encontrado processo na porta %%p: PID %%a
        taskkill /F /PID %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] Processo %%a finalizado na porta %%p
        ) else (
            echo [ERRO] Nao foi possivel finalizar processo %%a na porta %%p
        )
    )
)

echo.
echo ========================================
echo Finalizando processos Node.js
echo ========================================
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Processos Node.js finalizados
) else (
    echo [INFO] Nenhum processo Node.js encontrado
)

echo.
echo ========================================
echo Verificando portas ainda em uso...
echo ========================================
for %%p in (%PORTAS%) do (
    netstat -ano | findstr :%%p | findstr LISTENING >nul
    if !errorlevel! equ 0 (
        echo [ATENCAO] Porta %%p ainda esta em uso!
    ) else (
        echo [OK] Porta %%p esta livre
    )
)

echo.
echo Concluido!
pause

