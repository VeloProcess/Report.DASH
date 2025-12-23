# 🎨 Como Adicionar os Logos da Velotax

## 📁 Localização dos Arquivos

Os logos devem ser adicionados na pasta:
```
back-end/assets/
```

## 📝 Arquivos Necessários

1. **`logo-basico.png`** - Logo básico da Velotax (usado no rodapé do PDF)
2. **`logo-natalino.png`** - Logo natalino da Velotax (usado no cabeçalho do PDF)

## ✅ Requisitos

- **Formato:** PNG (recomendado) ou JPG
- **Fundo:** Transparente (PNG) ou branco/preto
- **Tamanho recomendado:**
  - Logo básico: ~120x30px (ou proporção similar)
  - Logo natalino: ~150x40px (ou proporção similar)

## 📤 Como Adicionar

1. Salve as imagens dos logos na pasta `back-end/assets/`
2. Nomeie os arquivos exatamente como:
   - `logo-basico.png`
   - `logo-natalino.png`
3. Faça commit dos arquivos:
   ```bash
   git add back-end/assets/logo-basico.png back-end/assets/logo-natalino.png
   git commit -m "feat: Adicionar logos da Velotax"
   git push origin main
   ```

## 🎨 Cores do PDF

O PDF agora usa as seguintes cores da Velotax:

- **Azul Principal:** `#1694ff` - Títulos principais e destaques
- **Azul Secundário:** `#1634ff` - Subtítulos e informações secundárias
- **Azul Escuro:** `#000058` - Seção de Desenvolvimento (raramente usado)
- **Branco:** `#ffffff` - Fundo
- **Preto:** `#000000` - Texto principal

## 📄 Estrutura do PDF

- **Cabeçalho:** Logo natalino + título em azul
- **Conteúdo:** Métricas organizadas por seções com cores azuis
- **Rodapé:** Logo básico + data de geração

## ⚠️ Nota

Se os logos não forem encontrados, o PDF será gerado normalmente sem os logos, mas com as cores azuis aplicadas.

