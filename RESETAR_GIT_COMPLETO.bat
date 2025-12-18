@echo off
echo ========================================
echo Resetando Git completamente
echo ========================================
echo.
echo ATENCAO: Isso vai remover TODO o historico do Git!
echo.

pause

echo 1. Removendo todo o historico do Git...
git update-ref -d HEAD

echo.
echo 2. Removendo todos os arquivos do stage...
git rm -r --cached .

echo.
echo 3. Adicionando todos os arquivos novamente (respeitando .gitignore)...
git add .

echo.
echo 4. Fazendo commit inicial limpo...
git commit -m "Primeiro commit - Sistema de Feedback de Produtividade"

echo.
echo 5. Fazendo force push para substituir o historico no GitHub...
git push -f origin main

echo.
echo ========================================
echo Processo concluido!
echo ========================================
pause

