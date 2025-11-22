# Electron Desktop App - Setup

Este guia explica como configurar e rodar o aplicativo desktop (Electron) do LyricsPro.

## Arquitetura Híbrida

O projeto foi desenvolvido para funcionar em **dois modos**:

### 1. **Modo Web** (Vercel)
- Usa PostgreSQL (Supabase)
- Usa Cloudflare R2 para storage
- Usa Trigger.dev para processamento em background
- Usa Clerk para autenticação

### 2. **Modo Desktop** (Electron)
- Usa SQLite local
- Usa sistema de arquivos local para storage
- Usa OpenAI API diretamente para transcrição
- Usa autenticação local (sem Clerk)

## Estrutura de Arquivos Electron

```
frontend/
├── electron-main.js              # Processo principal do Electron
├── electron-preload.js           # Script de preload (segurança)
├── electron-handlers.js          # Handlers IPC
├── forge.config.js               # Configuração do Electron Forge
├── prisma/
│   ├── schema.prisma            # Schema PostgreSQL (Web)
│   └── schema.electron.prisma   # Schema SQLite (Electron)
└── lib/
    ├── electron-storage.ts       # Storage local (substitui R2)
    └── electron-transcription.ts # Transcrição local (substitui Trigger.dev)
```

## Passo 1: Instalar Dependências

```bash
cd frontend
npm install
```

## Passo 2: Configurar SQLite

Gerar o cliente Prisma para SQLite:

```bash
npx prisma generate --schema=prisma/schema.electron.prisma
```

Criar o banco de dados SQLite:

```bash
npx prisma migrate dev --schema=prisma/schema.electron.prisma --name init
```

## Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
# Para modo Electron (apenas OPENAI_API_KEY é necessária)
OPENAI_API_KEY=sk-...

# Para modo Web (opcional, se quiser rodar os dois)
DATABASE_URL=postgresql://...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

## Passo 4: Rodar em Desenvolvimento

```bash
npm run electron:dev
```

Isso irá:
1. Iniciar o servidor Next.js na porta 3000
2. Abrir a janela do Electron
3. Carregar a aplicação Next.js dentro do Electron

## Passo 5: Build para Produção

### Gerar executável (.exe, .dmg, .deb, etc)

```bash
npm run electron:build
```

Isso irá:
1. Fazer build do Next.js
2. Empacotar com Electron Forge
3. Gerar instalador na pasta `out/`

## Como Funciona no Electron

### 1. Storage Local

Quando um arquivo é enviado:
- É salvo em: `~/.config/lyricspro/storage/uploads/{userId}/`
- No Windows: `C:\Users\{user}\AppData\Roaming\lyricspro\storage\uploads\`
- No macOS: `~/Library/Application Support/lyricspro/storage/uploads/`
- No Linux: `~/.config/lyricspro/storage/uploads/`

### 2. Banco de Dados SQLite

O banco é criado em:
- Windows: `C:\Users\{user}\AppData\Roaming\lyricspro\lyricspro.db`
- macOS: `~/Library/Application Support/lyricspro/lyricspro.db`
- Linux: `~/.config/lyricspro/lyricspro.db`

### 3. Transcrição com OpenAI

Quando o usuário envia um áudio:
1. Arquivo é salvo localmente
2. É criado um registro no SQLite
3. O arquivo é enviado direto para OpenAI API (Whisper)
4. Resultado é salvo no banco local
5. Segmentos são criados

**Custo:** ~$0.006 por minuto de áudio (OpenAI Whisper API)

## Diferenças entre Web e Desktop

| Recurso | Web (Vercel) | Desktop (Electron) |
|---------|-------------|-------------------|
| **Banco** | PostgreSQL (Supabase) | SQLite local |
| **Storage** | Cloudflare R2 | Sistema de arquivos |
| **Processamento** | Trigger.dev (background) | OpenAI API (direto) |
| **Auth** | Clerk | Local (sem auth) |
| **Custo** | Mensal (servidores) | Apenas API OpenAI |
| **Offline** | ❌ Não | ✅ Sim (com API key) |

## API Key da OpenAI

### Como Obter

1. Acesse: https://platform.openai.com/api-keys
2. Crie uma nova API key
3. Copie a key (começa com `sk-`)

### Como Configurar no App

1. Abra o aplicativo
2. Vá em **Configurações**
3. Cole sua API key
4. Clique em **Salvar**

A API key é armazenada localmente em:
- `~/.config/lyricspro/settings.json`

**IMPORTANTE:** A API key NUNCA é enviada para nossos servidores. Ela fica apenas no seu computador.

## Troubleshooting

### Erro: "Prisma Client not found"

```bash
npx prisma generate --schema=prisma/schema.electron.prisma
```

### Erro: "Database not found"

```bash
npx prisma migrate dev --schema=prisma/schema.electron.prisma
```

### Erro: "OpenAI API key not configured"

1. Vá em Configurações
2. Adicione sua API key da OpenAI
3. Tente novamente

### Banco de dados corrompido

Delete o arquivo `lyricspro.db` e rode novamente:

```bash
npx prisma migrate dev --schema=prisma/schema.electron.prisma --name init
```

## Próximos Passos

- [ ] Implementar auto-update
- [ ] Adicionar criptografia para API key
- [ ] Implementar diarização local (pyannote.audio)
- [ ] Adicionar suporte a GPU local (CUDA)
- [ ] Criar instaladores para Windows/Mac/Linux

## Suporte

Para problemas ou dúvidas, abra uma issue no GitHub.
