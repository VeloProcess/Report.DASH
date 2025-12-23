@echo off
echo ========================================
echo Limpando cache e reiniciando frontend
echo ========================================
echo.

echo 1. Parando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo 2. Limpando cache do Vite...
cd front-end
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo    Cache do Vite removido
)

echo.
echo 3. Reiniciando frontend...
echo    Acesse: http://localhost:3001
echo    Pressione Ctrl+C para parar
echo.
npm run dev
