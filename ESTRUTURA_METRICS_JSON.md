# 📋 Estrutura do Arquivo Metrics.json

## 🎯 Formato Recomendado (Múltiplos Operadores)

Para ter múltiplos operadores no mesmo arquivo, use o **email como chave**:

```json
{
  "gabriel.araujo@velotax.com.br": {
    "login": {
      "email": "gabriel.araujo@velotax.com.br",
      "nome": "Gabriel Araujo",
      "metricas_atualizadas_em": "20/12/2025 14:30",
      "dados": {
        "chamadas": {
          "ligacoes": 208,
          "tma": "00:05:01",
          "nota_telefone": 4.96,
          "quantidade_notas": 85
        },
        "tickets": {
          "quantidade": 70,
          "tmt": "00:03:45",
          "nota_ticket": 2.83,
          "quantidade_notas": 12
        },
        "qualidade": {
          "nota": 4.5,
          "quantidade": 50
        },
        "pausas_tempo_logado": {
          "total_escalado": "108:00:00",
          "total_cumprido": "121:53:37",
          "abs": 0,
          "atrasos": 2,
          "pausa_escalada": "17:50:00",
          "pausa_realizada": "18:20:00",
          "pausa_almoco_escalada": "11:40:00",
          "pausa_almoco_realizada": "11:27:21",
          "pausa_10_escalada": "06:10:00",
          "pausa_10_realizada": "03:52:38",
          "pausa_banheiro": "01:15:11",
          "pausa_feedback": "01:43:35",
          "pausa_treinamento": "00:05:12"
        }
      }
    }
  },
  "marcelo.silva@velotax.com.br": {
    "login": {
      "email": "marcelo.silva@velotax.com.br",
      "nome": "Marcelo Rodrigo Izael da Silva",
      "metricas_atualizadas_em": "20/12/2025 15:00",
      "dados": {
        "chamadas": {
          "ligacoes": 235,
          "tma": "00:05:00",
          "nota_telefone": 4.0,
          "quantidade_notas": 60
        },
        ...
      }
    }
  }
}
```

## 📝 Como Adicionar um Novo Operador

1. Abra `back-end/data/Metrics.json`
2. Adicione uma nova chave com o email do operador
3. Copie a estrutura do template abaixo
4. Preencha os dados

```json
{
  "email.do.operador@velotax.com.br": {
    "login": {
      "email": "email.do.operador@velotax.com.br",
      "nome": "Nome Completo do Operador",
      "metricas_atualizadas_em": "20/12/2025 14:30",
      "dados": {
        "chamadas": {
          "ligacoes": 0,
          "tma": "00:00:00",
          "nota_telefone": 0,
          "quantidade_notas": 0
        },
        "tickets": {
          "quantidade": 0,
          "tmt": "00:00:00",
          "nota_ticket": 0,
          "quantidade_notas": 0
        },
        "qualidade": {
          "nota": 0,
          "quantidade": 0
        },
        "pausas_tempo_logado": {
          "total_escalado": "00:00:00",
          "total_cumprido": "00:00:00",
          "abs": 0,
          "atrasos": 0,
          "pausa_escalada": "00:00:00",
          "pausa_realizada": "00:00:00",
          "pausa_almoco_escalada": "00:00:00",
          "pausa_almoco_realizada": "00:00:00",
          "pausa_10_escalada": "00:00:00",
          "pausa_10_realizada": "00:00:00",
          "pausa_banheiro": "00:00:00",
          "pausa_feedback": "00:00:00",
          "pausa_treinamento": "00:00:00"
        }
      }
    }
  }
}
```

## ⚠️ Importante

- **Email como chave**: Use o email exato do operador (mesmo do `send_email.JSON`)
- **Estrutura "login"**: Mantenha a estrutura `login` dentro de cada operador
- **Data de atualização**: Sempre atualize `metricas_atualizadas_em` quando editar
- **JSON válido**: Verifique vírgulas e chaves antes de salvar

## 🔄 Fluxo do Sistema

1. Usuário faz login → Email capturado
2. Sistema busca em `Metrics.json` usando o email
3. Se encontrar → Converte para formato do dashboard
4. Se não encontrar → Tenta buscar no sistema antigo (`indicators.json`)
5. Dashboard exibe as métricas encontradas

## ✅ Vantagens

- ✅ Atualização manual simples
- ✅ Um arquivo para todos os operadores
- ✅ Fácil de editar e manter
- ✅ Histórico pode ser mantido no mesmo arquivo (se necessário)

