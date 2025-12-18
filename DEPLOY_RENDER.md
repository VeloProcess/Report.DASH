# 🚀 Deploy do Backend no Render

## 📋 Passo a Passo Completo

### Passo 1: Preparar o Repositório

Certifique-se de que seu código está no GitHub:
1. Faça commit de todas as mudanças
2. Faça push para o GitHub

### Passo 2: Criar Conta no Render

1. Acesse: https://render.com
2. Clique em **"Get Started for Free"**
3. Faça login com GitHub (recomendado)

### Passo 3: Criar Novo Web Service

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório GitHub:
   - Se for a primeira vez, autorize o Render a acessar seus repositórios
   - Selecione o repositório: `VeloProcess/Relatorios` (ou o nome do seu repositório)

### Passo 4: Configurar o Web Service

Preencha os seguintes campos:

**Nome:**
```
feedback-backend
```

**Região:**
```
Oregon (US West) - ou a mais próxima de você
```

**Branch:**
```
main
```

**Root Directory:**
```
back-end
```

**Runtime:**
```
Node
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Plan:**
```
Free (ou escolha um plano pago se preferir)
```

### Passo 5: Configurar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione todas as variáveis:

```
PORT=3000
NODE_ENV=production

GOOGLE_SERVICE_ACCOUNT_EMAIL=reports@reports-480617.iam.gserviceaccount.com
GOOGLE_SPREADSHEET_ID=1bgVkcQfZApa56woA1ZrmmqISt6XEuNknMhCapHXK4qI
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"reports-480617","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"reports@reports-480617.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

OPENAI_API_KEY=sua_chave_openai_aqui

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app_aqui
```

⚠️ **IMPORTANTE**: Cole o JSON completo das credenciais do Google em uma única linha!

### Passo 6: Criar o Web Service

1. Clique em **"Create Web Service"**
2. O Render vai começar a fazer o build automaticamente
3. Aguarde alguns minutos enquanto o build é feito

### Passo 7: Verificar o Deploy

1. Após o build, você verá uma URL como: `https://feedback-backend.onrender.com`
2. Teste acessando: `https://seu-backend.onrender.com/api/operators`
3. Deve retornar uma lista vazia `[]` ou os operadores cadastrados

### Passo 8: Configurar CORS (Se Necessário)

Se o frontend der erro de CORS, adicione no arquivo `back-end/src/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://relatoriosvelotax.vercel.app',
    'https://seu-frontend.vercel.app'
  ],
  credentials: true
}));
```

### Passo 9: Atualizar Frontend no Vercel

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione/Atualize:
   - **Nome**: `VITE_API_URL`
   - **Valor**: `https://seu-backend.onrender.com/api`
3. Faça um novo deploy do frontend

## 🔍 Troubleshooting

### Erro: "Build failed"

- Verifique se o `package.json` está correto
- Verifique se todas as dependências estão listadas
- Veja os logs do build no Render

### Erro: "Application failed to start"

- Verifique se o `PORT` está configurado corretamente
- Verifique se o `Start Command` está correto
- Veja os logs de runtime no Render

### Erro: "CORS"

- Adicione a URL do frontend no CORS do backend
- Verifique se o `cors` está instalado: `npm install cors`

### Erro: "Environment variable not found"

- Verifique se todas as variáveis de ambiente foram adicionadas no Render
- Certifique-se de que os nomes estão corretos (case-sensitive)

## 📝 Checklist

- [ ] Repositório no GitHub atualizado
- [ ] Conta no Render criada
- [ ] Web Service criado no Render
- [ ] Root Directory configurado como `back-end`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] URL do backend funcionando
- [ ] Frontend atualizado com `VITE_API_URL`

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Teste a API: `https://seu-backend.onrender.com/api/operators`
2. ✅ Configure `VITE_API_URL` no Vercel
3. ✅ Faça novo deploy do frontend
4. ✅ Teste a aplicação completa

