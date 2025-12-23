# 🔧 Correção Rápida - Variáveis de Ambiente

## Problema
Erro: "Google Client ID não configurado. Configure VITE_GOOGLE_CLIENT_ID no arquivo .env"

## Solução

### 1. Backend (`back-end/.env`)
Adicione estas 3 linhas ao final do arquivo:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
JWT_SECRET=sua_chave_secreta_aleatoria_aqui
```

### 2. Frontend (`front-end/.env`)
Crie ou edite o arquivo `.env` na pasta `front-end/` e adicione:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
```

### 3. Reinicie os Servidores
Após adicionar as variáveis:

**Backend:**
```bash
cd back-end
npm run dev
```

**Frontend:**
```bash
cd front-end
npm run dev
```

## Verificação
Após reiniciar, o erro deve desaparecer e você verá o botão "Sign in with Google" na tela de login.

