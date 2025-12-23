# Configurar Google OAuth para Localhost

## Problema
Erro: "The given origin is not allowed for the given client ID"

## Solução

### 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Selecione seu projeto

### 2. Configure as Credenciais OAuth
- Vá em **APIs & Services** > **Credentials**
- Clique no **OAuth 2.0 Client ID** que você está usando
- Ou crie um novo clicando em **+ CREATE CREDENTIALS** > **OAuth client ID**

### 3. Adicione as Origens Autorizadas
Na seção **Authorized JavaScript origins**, adicione:
```
http://localhost:3001
http://localhost:3000
http://127.0.0.1:3001
http://127.0.0.1:3000
```

### 4. Adicione os Redirect URIs (se necessário)
Na seção **Authorized redirect URIs**, adicione:
```
http://localhost:3001
http://localhost:3000
```

### 5. Salve as alterações
- Clique em **SAVE**
- Aguarde alguns minutos para as mudanças propagarem

### 6. Verifique o Client ID
- Certifique-se de que o `VITE_GOOGLE_CLIENT_ID` no arquivo `.env` do frontend está correto
- Deve ser algo como: `871926495694-60hoakqk966h5k28l3fqpqnd1q8ece2s.apps.googleusercontent.com`

### 7. Reinicie o Frontend
Após salvar as configurações, reinicie o servidor frontend:
```bash
cd front-end
npm run dev
```

## Verificação
Após configurar, tente fazer login novamente. O erro "The given origin is not allowed" deve desaparecer.

