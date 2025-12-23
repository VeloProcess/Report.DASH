# 📁 Pasta db.dados

Esta pasta contém os arquivos XLSX com os dados dos operadores.

## 📋 Como Usar

1. Coloque seu arquivo `.xlsx` nesta pasta
2. O arquivo deve ter abas nomeadas: **OUT**, **NOV**, **DEZ**
3. Cada aba deve ter a mesma estrutura de colunas:
   - Coluna 0: Operadores (nome do operador)
   - Coluna 1: # Ligações
   - Coluna 2: TMA
   - Coluna 3: Pesq telefone
   - Coluna 4: Qtd pesq
   - Coluna 5: # Tickets
   - Coluna 6: TMT
   - Coluna 7: Pesquisa Ticket
   - Coluna 8: Qtd pesq
   - Coluna 9: Nota qualidade
   - Coluna 10: Qtd Avaliações
   - Coluna 11: Total escalado
   - Coluna 12: Total logado
   - Coluna 13: % logado
   - Coluna 14: ABS
   - Coluna 15: Atrasos
   - Coluna 16: Pausa escalada
   - Coluna 17: Total de pausas
   - Coluna 18: %
   - Coluna 19: Almoço escalado
   - Coluna 20: Almoço realizado
   - Coluna 21: %
   - Coluna 22: Pausa 10 escalada
   - Coluna 23: Pausa 10 realizado
   - Coluna 24: %
   - Coluna 25: Pausa banheiro
   - Coluna 26: %
   - Coluna 27: Pausa Feedback
   - Coluna 28: %
   - Coluna 29: Treinamento
   - Coluna 30: %

## 🔄 Como Funciona

- O sistema procura automaticamente o arquivo `.xlsx` mais recente nesta pasta
- Você pode especificar um arquivo específico usando o parâmetro `fileName` na API
- Se houver múltiplos arquivos, o mais recente será usado por padrão

## 📝 Exemplo de Estrutura

```
db.dados/
  └── dados_operadores.xlsx
      ├── Aba OUT
      ├── Aba NOV
      └── Aba DEZ
```

## ⚠️ Importante

- O arquivo deve estar em formato `.xlsx` (Excel 2007+)
- A primeira linha deve conter os cabeçalhos
- Os nomes das abas devem ser exatamente: **OUT**, **NOV**, **DEZ** (maiúsculas)

