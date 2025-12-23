# 🔐 Configuração de Autenticação Google SSO

## Variáveis de Ambiente Necessárias

### Backend (`back-end/.env`)

Adicione as seguintes variáveis ao arquivo `.env` na pasta `back-end/`:

```env
# Google OAuth (para autenticação de usuários)
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui

# JWT Secret (gere uma chave aleatória segura)
JWT_SECRET=sua_chave_secreta_aleatoria_aqui_mude_em_producao
```

**Importante**: Gere uma chave JWT_SECRET segura para produção. Você pode usar:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (`front-end/.env`)

Adicione as seguintes variáveis ao arquivo `.env` na pasta `front-end/`:

```env
# URL da API do backend
VITE_API_URL=http://localhost:3000/api

# Google OAuth Client ID (mesmo do backend)
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
```

## Instalação de Dependências

### Backend

```bash
cd back-end
npm install
```

Isso instalará as novas dependências:
- `google-auth-library` - Para validar tokens Google OAuth
- `jsonwebtoken` - Para criar e validar tokens JWT
- `express-session` - Para gerenciar sessões (opcional)

### Frontend

```bash
cd front-end
npm install
```

Isso instalará:
- `@react-oauth/google` - Para integração Google OAuth no React

## Como Funciona

1. **Login**: Usuário faz login com Google SSO no frontend
2. **Validação**: Backend valida o token Google e busca o operador pelo email
3. **Autorização**: Se o email existe em `send_email.JSON`, cria sessão JWT
4. **Acesso**: Todas as requisições subsequentes incluem o token JWT
5. **Isolamento**: Backend filtra todos os dados pelo email autenticado

## Segurança

- ✅ Todas as rotas de dados requerem autenticação
- ✅ Validação sempre no backend (nunca confiar no frontend)
- ✅ Filtragem automática por email autenticado
- ✅ Bloqueio de acesso a dados de outros operadores
- ✅ Logs de tentativas de acesso não autorizado

## Rotas Públicas

Apenas estas rotas são públicas:
- `POST /api/auth/login` - Login com Google
- `GET /api/health` - Health check

Todas as outras rotas requerem autenticação via token JWT no header:
```
Authorization: Bearer <token>
```

## Estrutura de Dados

O sistema usa `send_email.JSON` como mapeamento de emails para nomes de operadores. Certifique-se de que todos os operadores que precisam acessar o sistema tenham seu email cadastrado neste arquivo.

## Testando

1. Inicie o backend: `cd back-end && npm start`
2. Inicie o frontend: `cd front-end && npm run dev`
3. Acesse `http://localhost:3001`
4. Faça login com uma conta Google que tenha email cadastrado em `send_email.JSON`
5. Você será redirecionado para o dashboard com suas métricas

## Troubleshooting

### Erro: "Acesso negado: Email não cadastrado no sistema"
- Verifique se o email está em `back-end/src/controllers/send_email.JSON`
- O email deve corresponder exatamente ao email da conta Google

### Erro: "Token inválido ou expirado"
- Faça logout e login novamente
- Verifique se `JWT_SECRET` está configurado no backend

### Erro: "Google Client ID não configurado"
- Verifique se `VITE_GOOGLE_CLIENT_ID` está no `.env` do frontend
- Reinicie o servidor de desenvolvimento do frontend após adicionar variáveis

