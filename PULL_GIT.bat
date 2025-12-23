@echo off
echo ========================================
echo Puxar atualizacoes do repositorio Git
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando se Git esta instalado...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Git nao encontrado no PATH!
    echo.
    echo Por favor, instale o Git:
    echo https://git-scm.com/download/win
    echo.
    echo OU execute o Git Bash diretamente e rode:
    echo   git pull origin main
    echo.
    pause
    exit /b 1
)

echo Git encontrado!
echo.

echo [1/2] Fazendo pull do repositorio remoto...
git pull origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [2/2] Pull concluido com sucesso!
) else (
    echo.
    echo ERRO ao fazer pull!
    echo Tentando com branch master...
    git pull origin master
)

echo.
echo ========================================
echo Concluido!
echo ========================================
pause

