@echo off
echo ========================================
echo Verificando Configuracao das APIs
echo ========================================
echo.

cd back-end

if not exist .env (
    echo [ERRO] Arquivo .env nao encontrado!
    echo.
    echo Crie o arquivo .env na pasta back-end com:
    echo GROQ_API_KEY=sua_chave_aqui
    echo GEMINI_API_KEY=sua_chave_aqui
    echo.
    pause
    exit /b 1
)

echo [OK] Arquivo .env encontrado
echo.

findstr /C:"GROQ_API_KEY" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] GROQ_API_KEY encontrada
) else (
    echo [AVISO] GROQ_API_KEY nao encontrada
)

findstr /C:"GEMINI_API_KEY" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] GEMINI_API_KEY encontrada
) else (
    echo [AVISO] GEMINI_API_KEY nao encontrada
)

echo.
echo ========================================
echo Instrucoes:
echo ========================================
echo.
echo 1. Abra o arquivo back-end\.env
echo 2. Adicione as seguintes linhas:
echo.
echo    GROQ_API_KEY=sua_chave_groq_aqui
echo    GEMINI_API_KEY=sua_chave_gemini_aqui
echo.
echo 3. Obtenha as chaves em:
echo    - Groq: https://console.groq.com/
echo    - Gemini: https://makersuite.google.com/app/apikey
echo.
echo 4. Reinicie o backend apos configurar
echo.
pause

