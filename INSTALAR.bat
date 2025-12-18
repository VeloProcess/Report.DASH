@echo off
echo ========================================
echo   Instalacao do Sistema de Feedback
echo ========================================
echo.

echo [1/4] Instalando dependencias do Backend...
cd back-end
call "C:\Program Files\nodejs\npm.cmd" install
if errorlevel 1 (
    echo ERRO ao instalar dependencias do backend!
    pause
    exit /b 1
)
echo Backend instalado com sucesso!
echo.

echo [2/4] Criando arquivo .env...
if not exist .env (
    echo PORT=3001 > .env
    echo OPENAI_API_KEY=sua_chave_aqui >> .env
    echo NODE_ENV=development >> .env
    echo Arquivo .env criado! IMPORTANTE: Edite e adicione sua chave OpenAI!
) else (
    echo Arquivo .env ja existe.
)
echo.

cd ..

echo [3/4] Instalando dependencias do Frontend...
cd front-end
call "C:\Program Files\nodejs\npm.cmd" install
if errorlevel 1 (
    echo ERRO ao instalar dependencias do frontend!
    pause
    exit /b 1
)
echo Frontend instalado com sucesso!
echo.

cd ..

echo ========================================
echo   Instalacao Concluida!
echo ========================================
echo.
echo PROXIMOS PASSOS:
echo 1. Edite o arquivo back-end\.env e adicione sua chave OpenAI
echo 2. Execute o backend: cd back-end && npm start
echo 3. Execute o frontend (em outro terminal): cd front-end && npm run dev
echo.
pause

