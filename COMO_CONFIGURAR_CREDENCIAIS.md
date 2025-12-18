# 🔐 Como Configurar as Credenciais do Google Sheets

## ⚠️ Problema Comum: Erro ao processar JSON

Se você está recebendo o erro "Erro ao processar credenciais JSON", significa que o JSON está mal formatado no arquivo `.env`.

## ✅ Solução Recomendada: Usar Arquivo JSON

A forma mais fácil e confiável é usar um arquivo JSON separado:

### Passo 1: Baixar o Arquivo JSON

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em "IAM & Admin" > "Service Accounts"
3. Encontre a service account: `seu-email@seu-projeto.iam.gserviceaccount.com`
4. Clique em "Keys" > "Add Key" > "Create new key"
5. Selecione **JSON** e baixe o arquivo

### Passo 2: Salvar o Arquivo

1. Crie uma pasta `credentials` dentro de `back-end`:
   ```
   back-end/
   └── credentials/
       └── google-service-account.json
   ```

2. Coloque o arquivo JSON baixado dentro dessa pasta

### Passo 3: Configurar o .env

No arquivo `back-end/.env`, adicione apenas:

```env
PORT=3000
NODE_ENV=development

GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-email@seu-projeto.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID=seu_spreadsheet_id_aqui
GOOGLE_CREDENTIALS_PATH=./credentials/google-service-account.json
```

**NÃO use `GOOGLE_CREDENTIALS_JSON`**, use apenas `GOOGLE_CREDENTIALS_PATH`!

## 🔄 Alternativa: JSON como String (Mais Complexo)

Se você realmente precisa usar JSON como string no `.env`, siga estas regras:

### ⚠️ Regras Importantes:

1. **Tudo em uma única linha** - Sem quebras de linha
2. **Sem aspas extras** - Não coloque o JSON entre aspas
3. **Escape correto** - Use `\\n` para quebras de linha dentro da chave privada
4. **Sem espaços extras** - Remova espaços no início e fim

### Exemplo CORRETO:

```env
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"seu-projeto","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"seu-email@seu-projeto.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### ❌ Exemplos INCORRETOS:

```env
# ERRADO: Com aspas extras
GOOGLE_CREDENTIALS_JSON="{"type":"service_account",...}"

# ERRADO: Com quebras de linha
GOOGLE_CREDENTIALS_JSON={
  "type": "service_account",
  ...
}

# ERRADO: Com espaços extras
GOOGLE_CREDENTIALS_JSON= {"type":"service_account",...}
```

## 📋 Checklist de Configuração

- [ ] Arquivo `.env` criado na pasta `back-end`
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` configurado
- [ ] `GOOGLE_SPREADSHEET_ID` configurado
- [ ] **OU** `GOOGLE_CREDENTIALS_PATH` apontando para arquivo JSON
- [ ] **OU** `GOOGLE_CREDENTIALS_JSON` em uma única linha sem aspas
- [ ] Planilha compartilhada com `seu-email@seu-projeto.iam.gserviceaccount.com` como Editor
- [ ] Backend reiniciado após configurar

## 🚀 Após Configurar

1. Reinicie o backend
2. Teste acessando: `http://localhost:3000/api/sheets/test`
3. Deve retornar `{"configured": true}`

## 🆘 Ainda com Problemas?

Se ainda tiver erro, verifique:
1. O arquivo JSON está no caminho correto?
2. O arquivo JSON está válido? (pode testar em https://jsonlint.com/)
3. O backend foi reiniciado após alterar o `.env`?
4. As permissões do arquivo estão corretas?

