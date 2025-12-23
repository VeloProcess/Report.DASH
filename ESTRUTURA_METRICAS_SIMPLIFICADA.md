# 📊 Estrutura Simplificada de Métricas

## 🎯 Proposta: Um JSON por Operador

Em vez de ter um único `indicators.json` com histórico, teremos:

```
back-end/data/metrics/
  ├── gabriel.araujo@velotax.com.br.json
  ├── marcelo.silva@velotax.com.br.json
  ├── rodrigo.reis@velotax.com.br.json
  └── ...
```

## 📋 Estrutura do Arquivo de Métricas

Cada arquivo teria esta estrutura:

```json
{
  "email": "gabriel.araujo@velotax.com.br",
  "name": "Gabriel Araujo",
  "last_updated": "2025-12-20T10:30:00.000Z",
  "reference_month": "dezembro/2025",
  "metrics": {
    "calls": 208,
    "tma": "00:05:01",
    "quality_score": 4.96,
    "qtd_pesq_telefone": 85,
    "tickets": 70,
    "tmt": "00:03:45",
    "pesquisa_ticket": 2.83,
    "qtd_pesq_ticket": 12,
    "total_escalado": "108:00:00",
    "total_logado": "121:53:37",
    "percent_logado": "112,86%",
    "pausa_escalada": "17:50:00",
    "total_pausas": "18:20:00",
    "percent_pausas": "103%",
    "almoco_escalado": "11:40:00",
    "almoco_realizado": "11:27:21",
    "percent_almoco": "98,20%",
    "pausa_10_escalada": "06:10:00",
    "pausa_10_realizado": "03:52:38",
    "percent_pausa_10": "62,90%",
    "pausa_banheiro": "01:15:11",
    "percent_pausa_banheiro": "6,80%",
    "pausa_feedback": "01:43:35",
    "percent_pausa_feedback": "9,40%",
    "treinamento": "00:05:12",
    "percent_treinamento": null
  },
  "history": [
    {
      "date": "2025-12-19",
      "metrics": { ... }
    },
    {
      "date": "2025-12-18",
      "metrics": { ... }
    }
  ]
}
```

## ✅ Vantagens

1. **Simplicidade**: Um arquivo por operador = fácil de encontrar e editar
2. **Atualização diária**: Basta editar o JSON do operador
3. **Histórico opcional**: Pode manter histórico no mesmo arquivo
4. **Sem IDs**: Usa email como chave (já temos isso)
5. **Fácil backup**: Cada arquivo é independente

## 🔄 Como Funcionaria

### Atualização Diária (Manual)
1. Abrir `back-end/data/metrics/gabriel.araujo@velotax.com.br.json`
2. Atualizar os valores em `metrics`
3. Atualizar `last_updated`
4. Salvar

### Atualização via API (Automática)
- Endpoint para atualizar métricas de um operador
- Validação de autenticação (só o próprio operador ou admin)
- Atualiza o arquivo JSON diretamente

### Leitura
- Dashboard busca o arquivo do operador pelo email
- Carrega instantaneamente (sem queries complexas)

## 📝 Exemplo de Atualização

```json
{
  "email": "gabriel.araujo@velotax.com.br",
  "name": "Gabriel Araujo",
  "last_updated": "2025-12-20T14:30:00.000Z",
  "reference_month": "dezembro/2025",
  "metrics": {
    "calls": 215,  // ← Atualizado de 208 para 215
    "tma": "00:04:55",  // ← Atualizado
    ...
  }
}
```

## 🚀 Implementação

Posso criar:
1. Nova estrutura de pastas `back-end/data/metrics/`
2. Funções para ler/escrever métricas por email
3. Endpoint para atualizar métricas
4. Migração dos dados existentes
5. Script para facilitar atualização diária

## ❓ Perguntas

1. **Histórico**: Quer manter histórico diário ou só os valores atuais?
2. **Atualização**: Prefere manual (editar JSON) ou via interface web?
3. **Validação**: Precisa validar os valores antes de salvar?
4. **Backup**: Quer backup automático antes de atualizar?

