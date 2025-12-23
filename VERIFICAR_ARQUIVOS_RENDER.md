# 🔍 Verificar Arquivos no Render

## Problema
Os arquivos `operators.json` e `Metrics.json` não estão sendo encontrados no Render.

## Logs Esperados Após Deploy

Quando o backend iniciar no Render, você deve ver nos logs:

```
📂 Diretório atual (process.cwd()): /opt/render/project/src/back-end
📂 Diretório do módulo (__dirname): /opt/render/project/src/back-end/src
📂 Diretório de dados (dataDir): /opt/render/project/src/back-end/data
📂 Arquivo operators.json: /opt/render/project/src/back-end/data/operators.json
📂 Arquivo existe? true/false
✅ operators.json encontrado com X operadores
```

## Se os Arquivos Não Estiverem Lá

### Opção 1: Verificar se os Arquivos Estão no Git
```bash
git ls-files back-end/data/operators.json
git ls-files back-end/data/Metrics.json
```

Se não aparecer nada, os arquivos não estão no Git.

### Opção 2: Verificar o Caminho no Render

Com `rootDir: back-end` no `render.yaml`, o caminho deve ser:
- `back-end/data/operators.json` (relativo ao rootDir)
- Que se torna: `/opt/render/project/src/back-end/data/operators.json`

### Opção 3: Forçar Novo Deploy

1. Acesse: https://dashboard.render.com
2. Vá no serviço `feedback-backend`
3. Clique em "Manual Deploy" > "Deploy latest commit"
4. Aguarde o deploy completar
5. Verifique os logs para ver os caminhos

## Solução Alternativa: Usar Variáveis de Ambiente

Se os arquivos não funcionarem, podemos migrar para usar variáveis de ambiente ou um banco de dados externo.

