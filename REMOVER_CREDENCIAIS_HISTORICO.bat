@echo off
echo ========================================
echo Removendo Credenciais do Historico do Git
echo ========================================
echo.
echo ATENCAO: Isso vai remover TODO o historico do Git!
echo.

pause

echo 1. Removendo todo o historico do Git...
git update-ref -d HEAD

echo.
echo 2. Removendo todos os arquivos do stage...
git rm -r --cached . 2>nul

echo.
echo 3. Adicionando todos os arquivos novamente (respeitando .gitignore)...
git add .

echo.
echo 4. Fazendo commit inicial completamente limpo...
git commit -m "Primeiro commit - Sistema de Feedback de Produtividade"

echo.
echo 5. Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/VeloProcess/Relatorios.git

echo.
echo 6. Fazendo force push para substituir o historico no GitHub...
git push -f origin main

echo.
echo ========================================
if %errorlevel%==0 (
    echo Push realizado com sucesso!
) else (
    echo.
    echo Se ainda der erro, use o link do GitHub para permitir temporariamente:
    echo https://github.com/VeloProcess/Relatorios/security/secret-scanning/unblock-secret/371yPLPghm5FMxfTlL6fTHH3bfy
    echo.
    echo Depois execute novamente este script.
)
echo ========================================
pause

