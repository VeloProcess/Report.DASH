# 📊 Como Atualizar Dados de Dezembro Manualmente

## 📁 Arquivo: `back-end/scripts/preencher_dezembro.js`

Este script permite atualizar os dados de dezembro editando diretamente o código.

## 🔄 Passo a Passo

### 1. Abrir o arquivo
Abra `back-end/scripts/preencher_dezembro.js` no seu editor.

### 2. Localizar o array `dadosDezembro`
O array começa na linha 16 e contém os dados de todos os operadores.

### 3. Atualizar os dados
Encontre o operador que deseja atualizar e modifique os valores:

```javascript
{
  nome: "Nome do Operador",
  ligacoes: 254,                    // ← Atualizar número de ligações
  tma: "00:04:54",                  // ← Atualizar tempo médio de atendimento
  nota_telefone: 4.96,              // ← Atualizar nota
  quantidade_notas_telefone: 103,    // ← Atualizar quantidade
  tickets: 90,                      // ← Atualizar número de tickets
  tmt: "02:29:48",                  // ← Atualizar tempo médio de ticket
  nota_ticket: 2.83,                 // ← Atualizar nota
  quantidade_notas_ticket: 12,       // ← Atualizar quantidade
  nota_qualidade: 0.88,              // ← Atualizar nota de qualidade
  quantidade_avaliacoes: 3,          // ← Atualizar quantidade
  total_escalado: "143:00:00",       // ← Atualizar tempo escalado
  total_cumprido: "158:16:48",       // ← Atualizar tempo cumprido
  abs: 0,                            // ← Atualizar ausências
  atrasos: 2,                        // ← Atualizar atrasos
  pausa_escalada: "24:30:00",        // ← Atualizar pausa escalada
  pausa_realizada: "23:42:48",      // ← Atualizar pausa realizada
  pausa_almoco_escalada: "16:00:00", // ← Atualizar almoço escalado
  pausa_almoco_realizada: "14:47:36", // ← Atualizar almoço realizado
  pausa_10_escalada: "8:30:00",      // ← Atualizar pausa 10 escalada
  pausa_10_realizada: "5:00:23",     // ← Atualizar pausa 10 realizada
  pausa_banheiro: "2:06:02",         // ← Atualizar pausa banheiro
  pausa_feedback: "1:43:35",         // ← Atualizar pausa feedback
  pausa_treinamento: "0:05:12"       // ← Atualizar treinamento (ou null)
}
```

### 4. Salvar o arquivo
Salve as alterações no arquivo.

### 5. Executar o script
Execute o script para aplicar as mudanças:

```bash
cd back-end
node scripts/preencher_dezembro.js
```

Ou use o arquivo batch:
```bash
ATUALIZAR_DEZEMBRO_MANUAL.bat
```

## 📝 Formato dos Tempos

- Use formato `"HH:MM:SS"` (ex: `"00:04:54"`)
- Para horas maiores que 24, use formato `"HHH:MM:SS"` (ex: `"143:00:00"`)
- Use `null` para valores vazios (ex: `pausa_treinamento: null`)

## ✅ Exemplo de Atualização

**Antes:**
```javascript
{
  nome: "Dimas Henrique Gonçalves do Nascimento",
  ligacoes: 254,
  tma: "00:04:54",
  ...
}
```

**Depois:**
```javascript
{
  nome: "Dimas Henrique Gonçalves do Nascimento",
  ligacoes: 260,        // ← Atualizado de 254 para 260
  tma: "00:05:10",      // ← Atualizado
  ...
}
```

## ⚠️ Importante

- **Mantenha o JSON válido**: Verifique vírgulas e chaves
- **Nome exato**: Use o nome exato do operador (como está no `send_email.JSON`)
- **Execute o script**: As mudanças só são aplicadas após executar o script

## 🔍 Verificar se Funcionou

Após executar o script:
1. Verifique a mensagem de sucesso no terminal
2. Acesse o dashboard do operador
3. Selecione o mês "Dezembro"
4. As métricas devem aparecer atualizadas

