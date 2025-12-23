# 📋 Comandos Git - Feedback 3 Tópicos

## ⚠️ IMPORTANTE
Execute estes comandos no **Git Bash** ou **CMD** (se Git estiver no PATH):

## 🔧 Comandos para Executar

```bash
git add back-end/src/integrations/ai/aiService.js

git commit -m "Refatorar feedback para focar em 3 topicos: Chamadas, Tickets e Pausas com comparacao de medias"

git push origin main
```

## ✅ Ou Execute o Script

Clique duas vezes em: `COMMIT_FEEDBACK_3_TOPICOS.bat`

## 📝 O que foi alterado

- ✅ Feedback agora foca em apenas **3 tópicos**: Chamadas, Tickets e Pausas
- ✅ Calcula **médias da equipe** para comparação
- ✅ Aplica regras específicas:
  - TMA/TMT: abaixo da média = MANTER, acima = MELHORAR
  - % Logado: 100% = MANTER, < 100% = MELHORAR, > 100% = MANTER
  - Pausas: realizado > escalado = MELHORAR, realizado < escalado = MANTER

