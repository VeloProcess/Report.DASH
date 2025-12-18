@echo off
echo ========================================
echo Remover Chaves Expostas da Documentacao
echo ========================================
echo.

echo [1/3] Adicionando arquivos corrigidos...
git add CORRIGIR_CHAVE_OPENAI_FORMATO.md DIAGNOSTICO_CHAVE_OPENAI.md VERIFICAR_CHAVE_OPENAI.md

echo.
echo [2/3] Fazendo commit...
git commit -m "Remover chaves de API expostas da documentacao"

echo.
echo [3/3] Fazendo push...
git push origin main

echo.
echo ========================================
echo Concluido!
echo ========================================
pause

