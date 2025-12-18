@echo off
echo ========================================
echo Configurando para Repositorio: Relatorios
echo ========================================
echo.

echo 1. Removendo remote origin existente...
git remote remove origin 2>nul

echo.
echo 2. Adicionando remote: Relatorios
git remote add origin https://github.com/VeloProcess/Relatorios.git

echo.
echo 3. Verificando remote configurado...
git remote -v

echo.
echo 4. Adicionando todos os arquivos...
git add .

echo.
echo 5. Fazendo commit...
git commit -m "Primeiro commit - Sistema de Feedback de Produtividade"

echo.
echo 6. Fazendo push para o GitHub...
git push -u origin main

echo.
echo ========================================
if %errorlevel%==0 (
    echo Push realizado com sucesso!
) else (
    echo Erro ao fazer push. Verifique se o repositorio existe no GitHub.
    echo Se nao existir, crie em: https://github.com/VeloProcess
)
echo ========================================
pause

