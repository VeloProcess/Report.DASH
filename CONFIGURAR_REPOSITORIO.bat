@echo off
echo ========================================
echo Configurando Repositorio Git
echo ========================================
echo.

echo 1. Removendo remote origin existente...
git remote remove origin

echo.
echo 2. Verificando se o repositorio existe...
echo Escolha uma opcao:
echo [1] Relat-rios (original)
echo [2] Relatorios (novo)
echo.
set /p opcao="Digite o numero da opcao (1 ou 2): "

if "%opcao%"=="1" (
    echo Adicionando remote: Relat-rios
    git remote add origin https://github.com/VeloProcess/Relat-rios.git
) else if "%opcao%"=="2" (
    echo Adicionando remote: Relatorios
    git remote add origin https://github.com/VeloProcess/Relatorios.git
) else (
    echo Opcao invalida!
    pause
    exit /b
)

echo.
echo 3. Verificando remote configurado...
git remote -v

echo.
echo 4. Fazendo push para o GitHub...
git push -u origin main

echo.
echo ========================================
echo Processo concluido!
echo ========================================
pause

