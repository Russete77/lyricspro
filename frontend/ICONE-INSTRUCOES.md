# 🎨 Instruções para Adicionar Ícone da Aplicação

## ⚠️ Ícone Necessário para Build do Electron

Para gerar o executável `.exe` corretamente, você precisa adicionar ícones da aplicação.

## 📁 Arquivos Necessários

Coloque os seguintes arquivos na pasta `public/`:

### Windows (.ico)
- **Nome do arquivo**: `icon.ico`
- **Caminho**: `frontend/public/icon.ico`
- **Formato**: Arquivo .ico com múltiplas resoluções
- **Resoluções recomendadas**: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256

### macOS (.icns) - Opcional
- **Nome do arquivo**: `icon.icns`
- **Caminho**: `frontend/public/icon.icns`
- **Formato**: Arquivo .icns da Apple

### Linux (.png) - Opcional
- **Nome do arquivo**: `icon.png`
- **Caminho**: `frontend/public/icon.png`
- **Resolução**: 512x512 ou 1024x1024

## 🛠️ Como Gerar os Ícones

### Opção 1: Usar um Gerador Online

1. Acesse: https://www.icoconverter.com/
2. Faça upload de uma imagem PNG de alta resolução (512x512 ou maior)
3. Selecione as opções:
   - Windows Icon (.ico)
   - Incluir múltiplas resoluções
4. Baixe o arquivo `.ico` gerado
5. Renomeie para `icon.ico` e coloque em `frontend/public/`

### Opção 2: Usar electron-icon-builder

```bash
# Instalar ferramenta
npm install -g electron-icon-builder

# Gerar ícones a partir de uma imagem
electron-icon-builder --input=./sua-imagem.png --output=./public
```

### Opção 3: Usar ImageMagick (Avançado)

```bash
# Instalar ImageMagick
# Windows: https://imagemagick.org/script/download.php

# Gerar .ico com múltiplas resoluções
magick convert sua-imagem.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

## 🎨 Recomendações de Design

- **Fundo transparente**: Use PNG com fundo transparente
- **Simplicidade**: Ícones devem ser reconhecíveis mesmo em tamanhos pequenos (16x16)
- **Contraste**: Use cores que contrastem bem com fundos claros e escuros
- **Formato quadrado**: Imagem original deve ser quadrada (1:1)
- **Resolução mínima**: 512x512 pixels para melhor qualidade

## ✅ Verificação

Após adicionar os ícones, verifique se existem:

```bash
ls -la frontend/public/icon.*
```

Deve mostrar:
- `icon.ico` (obrigatório para Windows)
- `icon.png` (opcional)
- `icon.icns` (opcional para macOS)

## 🚀 Próximos Passos

Após adicionar o ícone:

1. Certifique-se que `icon.ico` existe em `frontend/public/`
2. Execute o build: `npm run electron:build`
3. O executável será gerado com o ícone configurado

## 📝 Nota

Atualmente, o projeto está configurado para usar:
- `public/icon.ico` → Instalador Windows (Squirrel)
- `public/icon` → Ícone da janela do app (Electron usa sem extensão e detecta automaticamente)

Se você não tiver um ícone personalizado agora, pode:
1. Usar um ícone temporário/placeholder
2. Ou comentar as linhas de ícone em `forge.config.js` até ter um ícone pronto
