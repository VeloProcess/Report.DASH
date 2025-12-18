@echo off
echo ========================================
echo Corrigindo histórico do Git
echo ========================================
echo.

echo 1. Removendo o commit com credenciais do histórico...
git reset --soft HEAD~2

echo.
echo 2. Removendo FORMATO_CORRETO_ENV.txt do stage...
git reset HEAD FORMATO_CORRETO_ENV.txt

echo.
echo 3. Adicionando todos os arquivos (exceto FORMATO_CORRETO_ENV.txt)...
git add .

echo.
echo 4. Fazendo novo commit limpo...
git commit -m "Primeiro commit - Sistema de Feedback de Produtividade"

echo.
echo 5. Fazendo force push para substituir o histórico...
echo ATENCAO: Isso vai sobrescrever o histórico no GitHub!
git push -f origin main

echo.
echo ========================================
echo Processo concluido!
echo ========================================
pause

