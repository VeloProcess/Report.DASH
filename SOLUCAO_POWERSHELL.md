# 🔧 Solução para Erro de Execução no PowerShell

## Problema
O PowerShell está bloqueando a execução de scripts do npm devido à política de execução.

## ✅ Soluções

### Opção 1: Alterar Política de Execução (Recomendado)

Execute no PowerShell como **Administrador**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois confirme com `Y` quando solicitado.

**Explicação:**
- `RemoteSigned`: Permite scripts locais e scripts baixados assinados
- `Scope CurrentUser`: Aplica apenas ao seu usuário (mais seguro)

### Opção 2: Usar CMD (Alternativa Rápida)

Abra o **Prompt de Comando (CMD)** ao invés do PowerShell:

1. Pressione `Win + R`
2. Digite `cmd` e pressione Enter
3. Navegue até a pasta do projeto:
   ```cmd
   cd "C:\Users\gabri\Desktop\RP( Resultado de Produtividade)\back-end"
   ```
4. Execute os comandos normalmente:
   ```cmd
   npm install
   npm start
   ```

### Opção 3: Bypass Temporário (Apenas para esta sessão)

Execute no PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

**Nota:** Esta alteração só vale para a sessão atual do PowerShell.

### Opção 4: Usar npx diretamente

Tente usar o caminho completo do npm:

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" start
```

## 🚀 Após Resolver

Depois de resolver o problema, continue com:

**Backend:**
```bash
cd back-end
npm install
# Crie o arquivo .env com sua chave OpenAI
npm start
```

**Frontend (em outro terminal):**
```bash
cd front-end
npm install
npm run dev
```

## 📝 Verificar Política Atual

Para ver qual política está ativa:

```powershell
Get-ExecutionPolicy -List
```

