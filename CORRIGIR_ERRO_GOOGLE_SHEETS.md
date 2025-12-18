# 🔧 Corrigir Erro ao Acessar Google Sheets

## ⚠️ Erro

```
error:1E08010C:DECODER routines::unsupported
```

Este erro geralmente acontece quando a chave privada do Google não está sendo decodificada corretamente.

## ✅ Solução Aplicada

Melhorei o código para:
1. Processar corretamente a chave privada
2. Converter `\\n` para quebras de linha reais
3. Adicionar logs para debug
4. Incluir todos os campos necessários nas credenciais

## 📋 Verificar no Render

### 1. Verificar Variável de Ambiente

No Render, verifique se `GOOGLE_CREDENTIALS_JSON` está configurada corretamente:

1. Acesse: https://dashboard.render.com
2. Vá no projeto `feedback-backend-2jg4`
3. Clique em "Environment"
4. Verifique `GOOGLE_CREDENTIALS_JSON`

### 2. Formato Correto da Variável

A variável `GOOGLE_CREDENTIALS_JSON` deve conter o JSON completo em **uma única linha**, sem aspas extras:

```
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"reports-480617","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"reports@reports-480617.iam.gserviceaccount.com",...}
```

⚠️ **IMPORTANTE**: 
- Deve estar em **uma única linha**
- **Sem aspas** ao redor do JSON
- Use `\\n` para quebras de linha dentro da chave privada

### 3. Verificar Logs

Após fazer commit e deploy, verifique os logs:
- `🔑 Chave privada processada. Tamanho: X caracteres`
- `📧 Usando email: reports@reports-480617.iam.gserviceaccount.com`

### 4. Testar Novamente

Após o deploy, teste buscar dados da planilha novamente.

## 🔄 Se Ainda Não Funcionar

### Opção 1: Usar Arquivo JSON (Recomendado)

1. Baixe o arquivo JSON de credenciais do Google Cloud Console
2. Faça upload do arquivo para o Render:
   - Vá em "Settings" → "Environment"
   - Use "Secret Files" para fazer upload
3. Configure `GOOGLE_CREDENTIALS_PATH` apontando para o arquivo

### Opção 2: Recriar as Credenciais

1. Acesse: https://console.cloud.google.com
2. Vá em "IAM & Admin" → "Service Accounts"
3. Selecione a service account
4. Vá em "Keys" → "Add Key" → "Create new key"
5. Baixe o JSON novamente
6. Cole o conteúdo completo no Render

## ✅ Checklist

- [ ] Variável `GOOGLE_CREDENTIALS_JSON` configurada no Render
- [ ] JSON está em uma única linha
- [ ] Sem aspas extras ao redor do JSON
- [ ] Chave privada contém `\\n` para quebras de linha
- [ ] Commit e push feitos
- [ ] Deploy no Render concluído
- [ ] Logs verificados
- [ ] Teste realizado

