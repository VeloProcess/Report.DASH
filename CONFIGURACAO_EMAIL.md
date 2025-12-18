# 📧 Configuração de Envio de Email

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no arquivo `.env` do backend (`back-end/.env`):

```env
# Configurações SMTP para envio de email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
```

## Configuração para Gmail

### Passo 1: Criar Senha de App

1. Acesse sua conta Google: https://myaccount.google.com/
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas** (se ainda não estiver ativada)
4. Vá em **Senhas de app** (pode estar em "Como fazer login no Google")
5. Selecione **Email** e **Outro (personalizado)** ou apenas **Email**
6. Digite um nome (ex: "Sistema de Feedback")
7. Clique em **Gerar**
8. Copie a senha gerada (16 caracteres, pode vir com espaços - remova os espaços ao colar)

**Nota:** Se não aparecer a opção "Senhas de app", você pode usar:
- **Nome:** seu email completo (ex: seu_email@gmail.com)
- **Senha:** a senha de app gerada (remova os espaços se houver)

### Passo 2: Configurar no .env

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=pcdjemlmvhcnccvw
```

**Importante:** 
- Remova os espaços da senha de app ao colar no .env
- A senha de app é diferente da senha normal da sua conta Google
- Exemplo: se a senha gerada foi "pcdj emlm vhcn ccvw", use "pcdjemlmvhcnccvw" no .env

## Configuração para Outros Provedores

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu_email@outlook.com
SMTP_PASS=sua_senha
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=seu_email@yahoo.com
SMTP_PASS=sua_senha_de_app
```

## Arquivo de Mapeamento de Emails

O arquivo `back-end/src/controllers/send_email.JSON` contém o mapeamento entre nomes de operadores e seus emails.

**Formato:**
```json
{
  "Nome do Operador": "email@exemplo.com",
  "Outro Operador": "outro@exemplo.com"
}
```

**Importante:**
- Os nomes devem corresponder EXATAMENTE aos nomes cadastrados no sistema
- O sistema faz busca case-insensitive, mas é recomendado manter consistência
- Adicione novos operadores conforme necessário

## Como Usar

1. Configure as variáveis SMTP no `.env`
2. Certifique-se de que o arquivo `send_email.JSON` está atualizado
3. Gere um feedback para um operador
4. Na página de feedback, clique no botão **"📧 Enviar Feedback por Email"**
5. O sistema irá:
   - Gerar um PDF do feedback
   - Buscar o email do operador no arquivo JSON
   - Enviar o email com o PDF anexado

## Troubleshooting

### Erro: "Email não encontrado para o operador"
- Verifique se o nome do operador está exatamente igual no arquivo `send_email.JSON`
- O sistema faz busca case-insensitive, mas verifique espaços e caracteres especiais

### Erro: "Configurações de SMTP não encontradas"
- Verifique se as variáveis `SMTP_USER` e `SMTP_PASS` estão no arquivo `.env`
- Reinicie o servidor backend após adicionar as variáveis

### Erro: "Authentication failed"
- Para Gmail: certifique-se de usar uma **Senha de App**, não a senha normal
- Verifique se a verificação em duas etapas está ativada
- Para outros provedores: verifique se permite acesso de apps menos seguros (não recomendado)

### Email não chega
- Verifique a pasta de spam
- Verifique se o email do destinatário está correto no arquivo JSON
- Verifique os logs do backend para mais detalhes

