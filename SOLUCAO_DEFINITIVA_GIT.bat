@echo off
echo ========================================
echo Solucao Definitiva - Limpar Historico Git
echo ========================================
echo.
echo Este script vai:
echo 1. Remover COMPLETAMENTE o historico do Git
echo 2. Criar um novo commit limpo
echo 3. Fazer push forçado para o GitHub
echo.
echo ATENCAO: Isso vai sobrescrever o historico no GitHub!
echo.

pause

echo [1/6] Removendo todo o historico do Git...
git update-ref -d HEAD
if %errorlevel% neq 0 (
    echo Erro ao remover historico. Tentando metodo alternativo...
    git checkout --orphan new-main
    git branch -D main
    git branch -m main
)

echo.
echo [2/6] Removendo todos os arquivos do stage...
git rm -r --cached . 2>nul

echo.
echo [3/6] Adicionando todos os arquivos novamente (respeitando .gitignore)...
git add .

echo.
echo [4/6] Fazendo commit inicial completamente limpo...
git commit -m "Primeiro commit - Sistema de Feedback de Produtividade"

echo.
echo [5/6] Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/VeloProcess/Relatorios.git

echo.
echo [6/6] Fazendo force push para substituir o historico no GitHub...
git push -f origin main

echo.
echo ========================================
if %errorlevel%==0 (
    echo.
    echo SUCESSO! Push realizado com sucesso!
    echo O historico foi completamente limpo.
    echo.
) else (
    echo.
    echo ERRO ao fazer push.
    echo.
    echo Possiveis solucoes:
    echo 1. Verifique se o repositorio existe: https://github.com/VeloProcess/Relatorios
    echo 2. Se nao existir, crie um novo repositorio no GitHub
    echo 3. Verifique suas credenciais do GitHub
    echo.
)
echo ========================================
pause

