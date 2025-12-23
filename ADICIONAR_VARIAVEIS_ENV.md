# ⚠️ Variáveis de Ambiente Faltando

## Backend (`back-end/.env`)

Adicione estas variáveis ao seu arquivo `.env` do backend:

```env
# Google OAuth (para autenticação de usuários)
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui

# JWT Secret (para tokens de sessão)
JWT_SECRET=sua_chave_secreta_aleatoria_aqui_mude_em_producao
```

**Para gerar um JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Frontend (`front-end/.env`)

Crie ou edite o arquivo `.env` na pasta `front-end/` e adicione:

```env
# URL da API do backend
VITE_API_URL=http://localhost:3000/api

# Google OAuth Client ID (mesmo do backend)
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
```

## Após Adicionar

1. **Backend**: Reinicie o servidor (`npm run dev`)
2. **Frontend**: Reinicie o servidor (`npm run dev`)

## Importante

- O `GOOGLE_CLIENT_ID` e `VITE_GOOGLE_CLIENT_ID` devem ser **iguais**
- O `GOOGLE_CLIENT_SECRET` é usado apenas no backend
- Não commite o arquivo `.env` no Git (ele já está no `.gitignore`)

