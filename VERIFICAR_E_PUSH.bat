@echo off
echo ========================================
echo Verificando e Fazendo Push Limpo
echo ========================================
echo.

echo [1/7] Verificando se o repositorio existe no GitHub...
echo Acesse: https://github.com/VeloProcess/Relatorios
echo Se nao existir, crie um novo repositorio vazio primeiro!
echo.
pause

echo [2/7] Removendo historico do Git completamente...
git update-ref -d HEAD 2>nul
if %errorlevel% neq 0 (
    echo Tentando metodo alternativo...
    git checkout --orphan temp-branch 2>nul
    git branch -D main 2>nul
    git branch -m main 2>nul
)

echo.
echo [3/7] Removendo todos os arquivos do stage...
git rm -r --cached . 2>nul

echo.
echo [4/7] Adicionando arquivos novamente (respeitando .gitignore)...
git add .

echo.
echo [5/7] Fazendo commit limpo...
git commit -m "Primeiro commit - Sistema de Feedback de Produtividade"

echo.
echo [6/7] Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/VeloProcess/Relatorios.git

echo.
echo [7/7] Fazendo push forçado...
git push -f origin main

echo.
echo ========================================
if %errorlevel%==0 (
    echo.
    echo SUCESSO! Push realizado!
    echo.
) else (
    echo.
    echo ERRO ao fazer push.
    echo.
    echo Verifique:
    echo 1. O repositorio existe em: https://github.com/VeloProcess/Relatorios
    echo 2. Voce tem permissao para fazer push
    echo 3. Suas credenciais do GitHub estao configuradas
    echo.
    echo Se o repositorio nao existir, crie um novo em:
    echo https://github.com/VeloProcess
    echo.
)
echo ========================================
pause

