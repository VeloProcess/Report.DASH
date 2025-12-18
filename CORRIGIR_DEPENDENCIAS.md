# 🔧 Corrigir Dependências Faltantes

## ✅ Problema Resolvido

O erro acontecia porque faltavam dependências no `package.json`:
- `nodemailer` - para envio de emails
- `pdfkit` - para geração de PDFs
- `googleapis` - para integração com Google Sheets

## 📝 O que foi feito

Atualizei o arquivo `back-end/package.json` com todas as dependências necessárias.

## 🚀 Próximos Passos

### Opção 1: Render vai instalar automaticamente

Se você já fez o deploy no Render, ele vai detectar as mudanças e fazer um novo build automaticamente quando você fizer push para o GitHub.

### Opção 2: Fazer commit e push

```bash
git add back-end/package.json
git commit -m "Adicionar dependências faltantes (nodemailer, pdfkit, googleapis)"
git push origin main
```

### Opção 3: Rebuild manual no Render

1. Acesse seu projeto no Render
2. Vá em "Manual Deploy" → "Deploy latest commit"
3. Aguarde o build completar

## ✅ Verificação

Após o deploy, verifique se está funcionando:
- Acesse: `https://seu-backend.onrender.com/api/health`
- Deve retornar: `{"status":"ok","message":"Sistema de Feedback funcionando"}`

## 📦 Dependências Adicionadas

- ✅ `nodemailer@^6.9.7` - Envio de emails
- ✅ `pdfkit@^0.14.0` - Geração de PDFs
- ✅ `googleapis@^128.0.0` - Integração com Google Sheets

Todas as dependências agora estão no `package.json` e serão instaladas automaticamente no Render.

