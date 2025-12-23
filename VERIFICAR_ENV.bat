@echo off
echo ========================================
echo Verificando Arquivo .env
echo ========================================
echo.

cd back-end

if not exist .env (
    echo [ERRO] Arquivo .env NAO ENCONTRADO!
    echo.
    echo ========================================
    echo SOLUCAO:
    echo ========================================
    echo.
    echo 1. Crie um arquivo chamado .env na pasta back-end\
    echo 2. Adicione as seguintes linhas:
    echo.
    echo    GROQ_API_KEY=sua_chave_groq_aqui
    echo    GEMINI_API_KEY=sua_chave_gemini_aqui
    echo.
    echo 3. Obtenha as chaves em:
    echo    - Groq: https://console.groq.com/
    echo    - Gemini: https://makersuite.google.com/app/apikey
    echo.
    pause
    exit /b 1
)

echo [OK] Arquivo .env encontrado!
echo.

echo ========================================
echo Verificando Conteudo...
echo ========================================
echo.

findstr /C:"GROQ_API_KEY" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Linha GROQ_API_KEY encontrada
    for /f "tokens=2 delims==" %%a in ('findstr /C:"GROQ_API_KEY" .env') do (
        set GROQ_VALUE=%%a
        if "!GROQ_VALUE!"=="" (
            echo [ERRO] GROQ_API_KEY esta vazia!
        ) else (
            echo [OK] GROQ_API_KEY tem valor configurado
        )
    )
) else (
    echo [ERRO] Linha GROQ_API_KEY NAO encontrada!
    echo.
    echo Adicione esta linha no arquivo .env:
    echo GROQ_API_KEY=sua_chave_groq_aqui
)

echo.

findstr /C:"GEMINI_API_KEY" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Linha GEMINI_API_KEY encontrada
    for /f "tokens=2 delims==" %%a in ('findstr /C:"GEMINI_API_KEY" .env') do (
        set GEMINI_VALUE=%%a
        if "!GEMINI_VALUE!"=="" (
            echo [ERRO] GEMINI_API_KEY esta vazia!
        ) else (
            echo [OK] GEMINI_API_KEY tem valor configurado
        )
    )
) else (
    echo [ERRO] Linha GEMINI_API_KEY NAO encontrada!
    echo.
    echo Adicione esta linha no arquivo .env:
    echo GEMINI_API_KEY=sua_chave_gemini_aqui
)

echo.
echo ========================================
echo IMPORTANTE:
echo ========================================
echo.
echo 1. Nao adicione espacos antes ou depois do =
echo 2. Nao coloque aspas ao redor das chaves
echo 3. Formato correto: GROQ_API_KEY=gsk_xxxxx
echo 4. Formato ERRADO: GROQ_API_KEY = "gsk_xxxxx"
echo.
echo 5. Apos configurar, REINICIE o backend!
echo.
pause

