# 🚀 Guia de Build do Electron - LyricsPro

## ✅ Configuração Completa

O projeto foi **totalmente configurado** seguindo as práticas oficiais do Electron. Todas as correções foram aplicadas:

### ✅ Correções Aplicadas

1. ✅ **package.json** - Adicionado author, description, license
2. ✅ **forge.config.js** - Corrigido `extraResources` e includes
3. ✅ **next.config.ts** - Adicionado `output: 'standalone'` para Electron
4. ✅ **electron-main.js** - Corrigido para servir build estático em produção
5. ✅ **build-electron.js** - Script automatizado de build criado
6. ✅ **Dependências** - Instaladas cross-env e fs-extra

---

## 📋 Pré-requisitos

Antes de gerar o `.exe`, você precisa:

### 1. Ícone da Aplicação (OBRIGATÓRIO)

Leia o arquivo **ICONE-INSTRUCOES.md** para instruções completas.

**Resumo rápido:**
- Adicione `icon.ico` em `frontend/public/`
- Use um gerador online: https://www.icoconverter.com/
- Ou temporariamente comente as linhas de ícone em `forge.config.js`

### 2. Variáveis de Ambiente (IMPORTANTE)

Para a versão Electron, você pode:

**Opção A**: Usar SQLite local (mais simples)
- Configure no código para detectar modo Electron
- Use Prisma com SQLite ao invés de PostgreSQL

**Opção B**: Usar serviços externos (mesmas credenciais)
- Copie as variáveis do `.env.local` para produção
- Funcionará, mas depende de internet

---

## 🛠️ Como Gerar o Executável

### Passo 1: Preparar Ambiente

```bash
cd frontend

# Instalar dependências (se ainda não fez)
npm install
```

### Passo 2: Adicionar Ícone

Coloque `icon.ico` em `public/` ou temporariamente comente em `forge.config.js`:

```javascript
// Comentar estas linhas se não tiver ícone ainda:
// icon: path.join(__dirname, 'public', 'icon'),
// setupIcon: path.join(__dirname, 'public', 'icon.ico'),
```

### Passo 3: Executar Build

```bash
npm run electron:build
```

Este comando irá:
1. 🔨 Buildar Next.js em modo standalone
2. 📁 Copiar arquivos estáticos necessários
3. ⚡ Empacotar com Electron Forge
4. 📦 Gerar o instalador `.exe`

### Passo 4: Encontrar o Executável

O executável será gerado em:

```
frontend/out/make/squirrel.windows/x64/
```

Arquivos gerados:
- `LyricsPro-1.0.0 Setup.exe` - Instalador
- `RELEASES` - Arquivo de metadados
- `.nupkg` - Pacote de atualização

---

## 🎯 Comandos Disponíveis

```bash
# Desenvolvimento (sem build)
npm run electron:dev

# Build completo (Next.js + Electron)
npm run electron:build

# Apenas empacotar (sem build do Next.js)
npm run package

# Apenas gerar instalador
npm run make
```

---

## ⚠️ Problemas Comuns e Soluções

### Erro: "Cannot find module 'icon'"

**Causa**: Ícone não foi adicionado
**Solução**: Adicione `icon.ico` em `public/` ou comente as linhas de ícone em `forge.config.js`

### Erro: "Standalone server not found"

**Causa**: Build do Next.js não gerou pasta standalone
**Solução**:
1. Verifique se `ELECTRON=true` está setado
2. Confirme que `next.config.ts` tem `output: 'standalone'`
3. Delete `.next` e rode novamente

### Erro: "npm not found" ao rodar .exe

**Causa**: Código tentando executar `npm` em produção
**Solução**: ✅ JÁ CORRIGIDO! O `electron-main.js` foi atualizado para servir standalone

### Build demora muito

**Normal**: Build do Next.js + empacotamento pode levar 5-10 minutos
**Dica**: Monitore o console para ver o progresso

### Executável muito grande (>200MB)

**Normal**: Electron inclui Chromium + Node.js + sua aplicação
**Dica**: Use compressão ZIP se for distribuir

---

## 📊 Estrutura do Build

```
frontend/
├── .next/
│   └── standalone/           # Next.js em modo standalone
│       ├── server.js         # Servidor Next.js standalone
│       ├── .next/           # Build compilado
│       └── public/          # Arquivos estáticos
├── out/                     # Saída do Electron Forge
│   ├── make/               # Instaladores gerados
│   └── LyricsPro-win32-x64/ # Aplicação empacotada
├── build-electron.js        # Script de build automatizado
├── electron-main.js         # Processo principal Electron
├── electron-preload.js      # Preload script
├── electron-handlers.js     # IPC handlers
└── forge.config.js          # Configuração Electron Forge
```

---

## 🎉 Distribuição

### Windows

O instalador gerado (`LyricsPro-1.0.0 Setup.exe`) pode ser:
- Distribuído diretamente aos usuários
- Publicado em site/GitHub releases
- Assinado digitalmente (recomendado para evitar SmartScreen)

### Assinatura de Código (Opcional)

Para evitar avisos do Windows SmartScreen:

1. Obtenha certificado de code signing
2. Configure em `forge.config.js`:

```javascript
certificateFile: './cert.pfx',
certificatePassword: process.env.CERT_PASSWORD
```

---

## 🔄 Próximas Melhorias

- [ ] Auto-update (Electron Updater)
- [ ] Notificações nativas
- [ ] Assinatura de código
- [ ] Build para macOS (.dmg)
- [ ] Build para Linux (.deb, .AppImage)
- [ ] CI/CD automatizado

---

## 📝 Notas Técnicas

### Modo Standalone do Next.js

O Next.js é buildado em modo standalone, que:
- Inclui apenas dependências necessárias
- Gera um servidor Node.js otimizado
- Reduz tamanho do bundle
- Funciona sem `node_modules` completo

### Electron Forge

Usando Electron Forge com:
- **Maker Squirrel**: Instalador Windows (.exe)
- **Maker ZIP**: Arquivo ZIP portável
- **ASAR**: Arquivos empacotados (proteção básica)

### Segurança

O projeto usa:
- `contextIsolation: true` - Isola contextos
- `nodeIntegration: false` - Não expõe Node.js ao renderer
- `webSecurity: true` - Ativa segurança web
- Preload script para APIs controladas

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique este documento
2. Leia **ICONE-INSTRUCOES.md** se for problema de ícone
3. Verifique console durante o build
4. Delete `.next`, `node_modules`, `out` e tente novamente

---

## ✅ Checklist Antes do Build

- [ ] Node.js instalado (v18+)
- [ ] Dependências instaladas (`npm install`)
- [ ] Ícone adicionado em `public/icon.ico` (ou comentado em config)
- [ ] Variáveis de ambiente configuradas (se necessário)
- [ ] Espaço em disco (>2GB livre)
- [ ] Prisma gerado (`npm run postinstall`)

**Pronto para buildar?** Execute: `npm run electron:build`

---

Desenvolvido por **Erick Russo**
LyricsPro v1.0.0
