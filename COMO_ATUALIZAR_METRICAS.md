# 📊 Como Atualizar Métricas Manualmente

## 📁 Arquivo: `back-end/data/Metrics.json`

Este arquivo contém todas as métricas dos operadores. Cada operador é identificado pelo seu **email**.

## 📋 Estrutura do Arquivo

```json
{
  "email.do.operador@velotax.com.br": {
    "login": {
      "email": "email.do.operador@velotax.com.br",
      "nome": "Nome Completo do Operador",
      "metricas_atualizadas_em": "20/12/2025 14:30",
      "dados": {
        "chamadas": { ... },
        "tickets": { ... },
        "qualidade": { ... },
        "pausas_tempo_logado": { ... }
      }
    }
  }
}
```

## 🔄 Como Atualizar

### Passo 1: Abrir o arquivo
Abra `back-end/data/Metrics.json` no seu editor de texto.

### Passo 2: Localizar o operador
Procure pela chave com o email do operador (ex: `"gabriel.araujo@velotax.com.br"`).

### Passo 3: Atualizar os valores
Edite os valores dentro de `dados`:

```json
{
  "gabriel.araujo@velotax.com.br": {
    "login": {
      "email": "gabriel.araujo@velotax.com.br",
      "nome": "Gabriel Araujo",
      "metricas_atualizadas_em": "20/12/2025 15:30",  // ← Atualizar data/hora
      "dados": {
        "chamadas": {
          "ligacoes": 215,  // ← Atualizar de 208 para 215
          "tma": "00:04:55",  // ← Atualizar tempo
          "nota_telefone": 4.98,  // ← Atualizar nota
          "quantidade_notas": 90  // ← Atualizar quantidade
        },
        ...
      }
    }
  }
}
```

### Passo 4: Salvar
Salve o arquivo. O sistema detectará automaticamente as mudanças.

## 📝 Campos Disponíveis

### Chamadas
- `ligacoes`: Número inteiro (ex: 208)
- `tma`: Tempo no formato "hh:mm:ss" (ex: "00:05:01")
- `nota_telefone`: Decimal (ex: 4.96)
- `quantidade_notas`: Número inteiro (ex: 85)

### Tickets
- `quantidade`: Número inteiro (ex: 70)
- `tmt`: Tempo no formato "hh:mm:ss" (ex: "00:03:45")
- `nota_ticket`: Decimal (ex: 2.83)
- `quantidade_notas`: Número inteiro (ex: 12)

### Qualidade
- `nota`: Decimal (ex: 4.5)
- `quantidade`: Número inteiro (ex: 50)

### Pausas e Tempo Logado
- `total_escalado`: Tempo "hh:mm:ss" (ex: "108:00:00")
- `total_cumprido`: Tempo "hh:mm:ss" (ex: "121:53:37")
- `abs`: Número inteiro (ex: 0)
- `atrasos`: Número inteiro (ex: 2)
- `pausa_escalada`: Tempo "hh:mm:ss"
- `pausa_realizada`: Tempo "hh:mm:ss"
- `pausa_almoco_escalada`: Tempo "hh:mm:ss"
- `pausa_almoco_realizada`: Tempo "hh:mm:ss"
- `pausa_10_escalada`: Tempo "hh:mm:ss"
- `pausa_10_realizada`: Tempo "hh:mm:ss"
- `pausa_banheiro`: Tempo "hh:mm:ss"
- `pausa_feedback`: Tempo "hh:mm:ss"
- `pausa_treinamento`: Tempo "hh:mm:ss"

## ✅ Dicas

1. **Sempre atualize** o campo `metricas_atualizadas_em` quando fizer alterações
2. **Use o formato de data brasileiro**: "dd/mm/aaaa hh:mm"
3. **Mantenha o JSON válido**: Verifique vírgulas e chaves
4. **Email como chave**: Use o email exato do operador (mesmo do `send_email.JSON`)

## 🔍 Verificar se Funcionou

Após salvar:
1. Acesse o dashboard do operador
2. As métricas devem aparecer atualizadas
3. Verifique os logs do backend para confirmar que encontrou o arquivo

## 📋 Exemplo Completo

Veja `back-end/data/Metrics.json.example` para um exemplo completo com múltiplos operadores.

