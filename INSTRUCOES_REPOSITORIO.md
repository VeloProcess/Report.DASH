# 🔧 Configurar Repositório Git

Você precisa configurar corretamente o remote do Git antes de fazer push.

## 📋 Passos

### 1. Remover o remote existente

```bash
git remote remove origin
```

### 2. Adicionar o remote correto

**Opção A - Repositório original (`Relat-rios`):**
```bash
git remote add origin https://github.com/VeloProcess/Relat-rios.git
```

**Opção B - Novo repositório (`Relatorios`):**
```bash
git remote add origin https://github.com/VeloProcess/Relatorios.git
```

⚠️ **IMPORTANTE**: Certifique-se de que o repositório existe no GitHub antes de fazer push!

### 3. Verificar o remote configurado

```bash
git remote -v
```

### 4. Fazer push

```bash
git push -u origin main
```

## 🔄 Se o repositório não existir no GitHub

1. Acesse: https://github.com/VeloProcess
2. Clique em "New repository"
3. Crie um repositório com o nome desejado (`Relatorios` ou `Relat-rios`)
4. **NÃO** inicialize com README, .gitignore ou licença
5. Depois execute os comandos acima

## 🚀 Script Automático

Execute o arquivo `CONFIGURAR_REPOSITORIO.bat` para fazer isso automaticamente.

