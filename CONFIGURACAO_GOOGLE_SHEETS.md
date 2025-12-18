# 📊 Configuração da Integração com Google Sheets

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no arquivo `.env` do backend (`back-end/.env`):

```env
# Email da Service Account do Google
GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-email@seu-projeto.iam.gserviceaccount.com

# ID da Planilha do Google Sheets
# Extraído da URL da sua planilha do Google Sheets
GOOGLE_SPREADSHEET_ID=seu_spreadsheet_id_aqui

# Opção 1: Credenciais JSON como string (recomendado para produção)
# Cole o conteúdo completo do arquivo JSON de credenciais aqui
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Opção 2: Caminho para o arquivo JSON de credenciais (alternativa)
GOOGLE_CREDENTIALS_PATH=./credentials/google-service-account.json
```

## Como Obter as Credenciais

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative a API do Google Sheets
4. Crie uma Service Account:
   - Vá em "IAM & Admin" > "Service Accounts"
   - Clique em "Create Service Account"
   - Dê um nome e crie
5. Crie uma chave JSON:
   - Clique na Service Account criada
   - Vá em "Keys" > "Add Key" > "Create new key"
   - Selecione JSON e baixe o arquivo
6. Compartilhe a planilha com o email da Service Account:
   - Abra sua planilha do Google Sheets
   - Clique em "Compartilhar" (canto superior direito)
   - Adicione o email: `seu-email@seu-projeto.iam.gserviceaccount.com`
   - Dê permissão de "Editor"
   - Clique em "Enviar"

## Estrutura da Planilha

A planilha deve ter 3 abas nomeadas:
- **OUT** (Outubro)
- **NOV** (Novembro)
- **DEZ** (Dezembro)

Cada aba deve ter as seguintes colunas (na primeira linha):
- Operadores
- # Ligações
- TMA
- Pesq telefone
- Qtd pesq
- # Tickets
- TMT
- Pesquisa Ticket
- Qtd pesq
- Total escalado
- Total logado
- % logado
- ABS
- Pausa escalada
- Total de pausas
- %
- Almoço escalado
- Almoço realizado
- %
- Pausa 10 escalada
- Pausa 10 realizado
- %
- Pausa banheiro
- %
- Pausa Feedback
- %
- Treinamento
- %

## Como Usar

1. Configure as variáveis de ambiente no `.env`
2. Reinicie o backend
3. No frontend, ao inserir indicadores:
   - Selecione o mês da planilha (OUT, NOV ou DEZ)
   - Clique em "📥 Buscar da Planilha"
   - Os dados serão preenchidos automaticamente nos campos

## Mapeamento de Dados

Os dados da planilha são mapeados para os indicadores do sistema:

| Campo do Sistema | Coluna da Planilha |
|-----------------|-------------------|
| Ligações Realizadas | # Ligações |
| TMA | TMA |
| Nota de Qualidade | Pesq telefone |
| Taxa de Absenteísmo | ABS |
| Pausas | Total de pausas |

## Troubleshooting

**Erro: "GOOGLE_SERVICE_ACCOUNT_EMAIL não configurado"**
- Verifique se a variável está no `.env` do backend

**Erro: "GOOGLE_CREDENTIALS_JSON ou GOOGLE_CREDENTIALS_PATH deve estar configurado"**
- Adicione uma das duas opções de credenciais no `.env`

**Erro: "Operador não encontrado na aba"**
- Verifique se o nome do operador na planilha corresponde exatamente ao nome cadastrado
- Verifique se a aba selecionada está correta (OUT, NOV ou DEZ)

**Erro: "Permission denied"**
- Certifique-se de que a planilha foi compartilhada com o email da Service Account
- Verifique se a Service Account tem permissão de "Editor" na planilha

