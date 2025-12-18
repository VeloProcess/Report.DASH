@echo off
echo ========================================
echo LIMPAR HISTORICO COMPLETO DO GIT
echo ========================================
echo.
echo ATENCAO: Isso vai remover TODO o historico do Git!
echo Voce vai fazer um commit completamente novo.
echo.
pause

echo [1/7] Removendo referencia HEAD...
git update-ref -d HEAD

echo.
echo [2/7] Removendo todos os arquivos do stage...
git rm -r --cached .

echo.
echo [3/7] Adicionando arquivos novamente (respeitando .gitignore)...
git add .

echo.
echo [4/7] Fazendo commit completamente limpo...
git commit -m "Sistema de Feedback de Produtividade - Versao limpa sem credenciais expostas"

echo.
echo [5/7] Removendo remote antigo...
git remote remove origin

echo.
echo [6/7] Adicionando remote novamente...
git remote add origin https://github.com/VeloProcess/Relatorios.git

echo.
echo [7/7] Fazendo force push (substituindo historico remoto)...
git push -f origin main

echo.
echo ========================================
echo CONCLUIDO!
echo ========================================
echo.
echo O historico foi completamente limpo e o push foi feito.
echo Todas as chaves foram removidas dos arquivos de documentacao.
echo.
pause
