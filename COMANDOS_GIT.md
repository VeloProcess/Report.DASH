# Comandos Git para Primeiro Commit

Execute os seguintes comandos no terminal (PowerShell ou CMD) na raiz do projeto:

```bash
# Inicializar repositório Git
git init

# Adicionar todos os arquivos (exceto os ignorados pelo .gitignore)
git add .

# Fazer o primeiro commit
git commit -m "primeiro commit"

# Renomear branch para main
git branch -M main

# Adicionar repositório remoto
git remote add origin https://github.com/VeloProcess/Relat-rios.git

# Fazer push para o GitHub
git push -u origin main
```

**Nota:** Se o Git não estiver instalado, você pode:
1. Instalar o Git: https://git-scm.com/download/win
2. Ou usar o GitHub Desktop: https://desktop.github.com/

