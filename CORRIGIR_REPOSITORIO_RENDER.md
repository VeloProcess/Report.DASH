# 🔧 Corrigir Repositório no Render

## Problema
O Render está clonando do repositório errado:
- ❌ **Errado:** `https://github.com/VeloProcess/DASH.report`
- ✅ **Correto:** `https://github.com/VeloProcess/Report.DASH.git`

## Solução

### 1. Acesse o Dashboard do Render
https://dashboard.render.com

### 2. Vá no Serviço Backend
- Clique no serviço `feedback-backend`

### 3. Vá em Settings
- Role até a seção **"Repository"**

### 4. Atualize o Repositório
- Clique em **"Change Repository"** ou **"Edit"**
- Altere para: `https://github.com/VeloProcess/Report.DASH.git`
- OU selecione o repositório correto da lista

### 5. Verifique o Branch
- Certifique-se de que está usando o branch: `main`

### 6. Salve e Faça Deploy
- Clique em **"Save Changes"**
- O Render fará um novo deploy automaticamente

### 7. Verifique os Logs
Após o deploy, os logs devem mostrar:
- `🔍 Verificando authRoutes:`
- `✅ Rotas /api/auth registradas`
- `📋 Rotas registradas:`

## Verificação

Após corrigir o repositório e fazer o deploy:
1. Teste: `https://feedback-backend-2jg4.onrender.com/api/health`
2. Deve retornar: `{"status":"ok",...}`
3. Teste o login novamente no frontend

## Se Não Conseguir Alterar

Se não conseguir alterar o repositório no Render:
1. Crie um novo serviço no Render
2. Conecte ao repositório correto: `https://github.com/VeloProcess/Report.DASH.git`
3. Configure as mesmas variáveis de ambiente
4. Use o novo URL do backend

