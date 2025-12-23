@echo off
echo ========================================
echo Verificando se o backend esta respondendo
echo ========================================
echo.

echo Testando conexao com http://localhost:3000/api/health...
curl http://localhost:3000/api/health

echo.
echo.
echo Se aparecer {"status":"ok",...} o backend esta funcionando!
echo Se aparecer erro de conexao, o backend nao esta rodando.
echo.
pause

