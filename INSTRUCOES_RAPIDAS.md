# 🚀 Instruções Rápidas de Inicialização

## Passo a Passo para Começar

### 1. Backend (Terminal 1)

```bash
cd back-end
npm install
```

Crie um arquivo `.env` na pasta `back-end/` com o seguinte conteúdo:

```
PORT=3000
OPENAI_API_KEY=sua_chave_openai_aqui
NODE_ENV=development
```

Depois inicie o servidor:

```bash
npm start
```

✅ Backend rodando em: http://localhost:3000

### 2. Frontend (Terminal 2)

```bash
cd front-end
npm install
npm run dev
```

✅ Frontend rodando em: http://localhost:3001

## ⚠️ Importante

- Certifique-se de ter a chave da API OpenAI válida
- O backend deve estar rodando antes de usar o frontend
- Os arquivos JSON do banco de dados serão criados automaticamente na primeira execução na pasta `back-end/data/`

## 📝 Fluxo de Uso

1. **Cadastrar Operador** → Home → Novo Operador
2. **Inserir Indicadores** → Home → Inserir Indicadores (no card do operador)
3. **Gerar Feedback** → Clique em "🤖 Gerar Feedback com IA"
4. **Visualizar Feedback** → Home → Ver Feedback (no card do operador)
5. **Ver Logs** → Menu Logs

## 🐛 Problemas Comuns

**Erro: Cannot find module**
- Execute `npm install` novamente na pasta do projeto

**Erro: Port already in use**
- Altere a porta no arquivo `.env` (backend) ou `vite.config.js` (frontend)

**Erro: OpenAI API**
- Verifique se a chave está correta no arquivo `.env`
- Certifique-se de que a chave tem créditos disponíveis

