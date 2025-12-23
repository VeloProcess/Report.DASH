@echo off
echo ========================================
echo Commit - Sistema de Metricas Mensais
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Verificando status do Git...
git status --short
echo.

echo [2/5] Adicionando arquivos modificados...
git add back-end/src/services/metricsService.js
git add back-end/src/routes/dashboardRoutes.js
git add back-end/scripts/preencher_outubro.js
git add back-end/scripts/preencher_novembro.js
git add back-end/scripts/preencher_dezembro.js
git add back-end/scripts/gerar_metrics_final.js
git add back-end/scripts/gerar_metrics_com_meses.js
git add GUIA_COMMIT_METRICS.md
git add EXPLICACAO_CAMPO_DADOS.md
echo.

echo [3/5] Verificando arquivos adicionados...
git status --short
echo.

echo [4/5] Fazendo commit...
git commit -m "Implementar sistema de metricas mensais (Outubro, Novembro, Dezembro)

- Adicionar estrutura de meses no Metrics.json
- Criar scripts para preencher dados mensais (Outubro, Novembro, Dezembro)
- Atualizar metricsService para suportar busca por mes especifico
- Adicionar campo 'atrasos' em Dezembro
- Suportar TMT e nota_ticket nos meses
- Criar scripts de geracao automatica de Metrics.json
- Adicionar documentacao sobre estrutura mensal"
echo.

echo [5/5] Fazendo push para origin main...
git push origin main
echo.

echo ========================================
echo Concluido!
echo ========================================
echo.
echo Se o push falhar, verifique:
echo 1. Se voce tem permissao no repositorio
echo 2. Se a branch esta correta (pode ser 'master' ao inves de 'main')
echo 3. Execute: git push origin master (se necessario)
echo.
pause

