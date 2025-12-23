@echo off
echo ========================================
echo Clonar Repositorio Git
echo ========================================
echo.
echo ATENCAO: Este script vai clonar o repositorio
echo Se voce ja tem um repositorio local, use PULL_GIT.bat
echo.
pause

cd /d "%~dp0\.."

echo Verificando se Git esta instalado...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Git nao encontrado no PATH!
    echo.
    echo Por favor, instale o Git:
    echo https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo Git encontrado!
echo.

echo Repositorio configurado: https://github.com/VeloProcess/Relatorios.git
echo.
echo Deseja clonar o repositorio? (S/N)
set /p resposta=

if /i "%resposta%"=="S" (
    echo.
    echo Clonando repositorio...
    git clone https://github.com/VeloProcess/Relatorios.git Relatorios-clone
    echo.
    echo Repositorio clonado na pasta: Relatorios-clone
) else (
    echo Operacao cancelada.
)

echo.
pause

