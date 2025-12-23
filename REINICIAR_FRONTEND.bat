@echo off
echo ========================================
echo Reiniciando Frontend
echo ========================================
echo.
echo Parando processos na porta 3001...
netstat -ano | findstr :3001
echo.
echo Acesse: http://localhost:3001
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
cd front-end
npm run dev

