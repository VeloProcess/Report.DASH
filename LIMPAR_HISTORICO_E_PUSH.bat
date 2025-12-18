@echo off
echo ========================================
echo Limpar Historico e Fazer Push Limpo
echo ========================================
echo.
echo ATENCAO: Isso vai remover todo o historico do Git!
echo.

pause

echo [1/6] Removendo referencia HEAD...
git update-ref -d HEAD

echo.
echo [2/6] Removendo arquivos do stage...
git rm -r --cached .

echo.
echo [3/6] Adicionando arquivos novamente (respeitando .gitignore)...
git add .

echo.
echo [4/6] Fazendo commit limpo...
git commit -m "Sistema de Feedback de Produtividade - Versao limpa sem credenciais"

echo.
echo [5/6] Configurando remote...
git remote remove origin
git remote add origin https://github.com/VeloProcess/Relatorios.git

echo.
echo [6/6] Fazendo force push...
git push -f origin main

echo.
echo ========================================
echo Concluido!
echo ========================================
pause

