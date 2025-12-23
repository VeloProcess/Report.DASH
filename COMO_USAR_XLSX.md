# 📊 Como Usar Arquivo XLSX Local

## ✅ Mudança Realizada

O sistema agora usa arquivos **XLSX locais** em vez de Google Sheets!

## 📁 Estrutura

1. Crie uma pasta chamada `db.dados` na **raiz do projeto**
2. Coloque seu arquivo `.xlsx` dentro dessa pasta

```
RP( Resultado de Produtividade)/
  ├── back-end/
  ├── front-end/
  ├── db.dados/          ← CRIE ESTA PASTA
  │   └── dados.xlsx    ← COLOQUE SEU ARQUIVO AQUI
  └── ...
```

## 📋 Formato do Arquivo

O arquivo `.xlsx` deve ter:

### Abas Necessárias:
- **OUT** (Outubro)
- **NOV** (Novembro)
- **DEZ** (Dezembro)

### Estrutura das Colunas (mesma ordem):

| Coluna | Nome | Tipo |
|--------|------|------|
| 0 | Operadores | Texto |
| 1 | # Ligações | Número |
| 2 | TMA | hh:mm:ss |
| 3 | Pesq telefone | Decimal |
| 4 | Qtd pesq | Número |
| 5 | # Tickets | Número |
| 6 | TMT | hh:mm:ss |
| 7 | Pesquisa Ticket | Decimal |
| 8 | Qtd pesq | Número |
| 9 | Nota qualidade | % |
| 10 | Qtd Avaliações | Número |
| 11 | Total escalado | hh:mm:ss |
| 12 | Total logado | hh:mm:ss |
| 13 | % logado | % |
| 14 | ABS | Número |
| 15 | Atrasos | Número |
| 16 | Pausa escalada | hh:mm:ss |
| 17 | Total de pausas | hh:mm:ss |
| 18 | % | % |
| 19 | Almoço escalado | hh:mm:ss |
| 20 | Almoço realizado | hh:mm:ss |
| 21 | % | % |
| 22 | Pausa 10 escalada | hh:mm:ss |
| 23 | Pausa 10 realizado | hh:mm:ss |
| 24 | % | % |
| 25 | Pausa banheiro | hh:mm:ss |
| 26 | % | % |
| 27 | Pausa Feedback | hh:mm:ss |
| 28 | % | % |
| 29 | Treinamento | hh:mm:ss |
| 30 | % | % |

## 🚀 Como Funciona

1. **Coloque o arquivo** na pasta `db.dados/`
2. **O sistema detecta automaticamente** o arquivo mais recente
3. **Use normalmente** - todas as funcionalidades continuam funcionando!

## 📝 Instalar Dependência

Execute no terminal:

```bash
cd back-end
npm install
```

Isso instalará a biblioteca `xlsx` necessária para ler arquivos Excel.

## ✅ Vantagens

- ✅ Não precisa de Google Sheets API
- ✅ Não precisa de credenciais do Google
- ✅ Funciona offline
- ✅ Mais rápido (sem chamadas de API)
- ✅ Mais simples de configurar

## 🔄 Migração do Google Sheets

Se você estava usando Google Sheets antes:

1. **Exporte sua planilha** do Google Sheets como `.xlsx`
2. **Coloque na pasta** `db.dados/`
3. **Pronto!** O sistema funciona igual

## ⚠️ Importante

- A primeira linha deve conter os **cabeçalhos**
- Os nomes das abas devem ser exatamente: **OUT**, **NOV**, **DEZ** (maiúsculas)
- O arquivo deve estar em formato `.xlsx` (Excel 2007+)

## 🆘 Problemas Comuns

### "Pasta db.dados não encontrada"
- Certifique-se de criar a pasta `db.dados` na **raiz do projeto** (mesmo nível de `back-end` e `front-end`)

### "Nenhum arquivo XLSX encontrado"
- Verifique se o arquivo tem extensão `.xlsx` ou `.xls`
- Verifique se o arquivo está dentro da pasta `db.dados`

### "Aba não encontrada"
- Verifique se os nomes das abas são exatamente: **OUT**, **NOV**, **DEZ** (maiúsculas)
- Verifique se não há espaços extras nos nomes das abas

