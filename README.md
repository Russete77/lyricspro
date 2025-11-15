# 🎵 LyricsPro - Transcrição Inteligente de Áudio

Plataforma profissional de transcrição de áudio/vídeo usando OpenAI Whisper API com suporte a áudios longos, diarização de falantes e pós-processamento inteligente.

---

## 🚀 Stack Tecnológica

- **Framework**: Next.js 16 (App Router)
- **Autenticação**: Clerk
- **Database**: PostgreSQL (Supabase)
- **Storage**: Cloudflare R2
- **AI**: OpenAI API (gpt-4o-transcribe)
- **Estilo**: Tailwind CSS
- **Deploy**: Vercel
- **Analytics**: Vercel Analytics

---

## ✨ Funcionalidades

- ✅ Upload de áudio/vídeo até 100MB
- ✅ Transcrição via OpenAI Whisper API
- ✅ Suporte a áudios longos (chunking automático a cada 20min)
- ✅ Diarização de falantes (quem falou o quê)
- ✅ Pós-processamento inteligente com GPT-4o
- ✅ Múltiplos formatos de export (TXT, SRT, VTT, JSON)
- ✅ Autenticação segura (Clerk)
- ✅ Interface moderna e responsiva
- ✅ Rate limiting (10 uploads/min por usuário)
- ✅ Analytics integrado

---

## 📁 Estrutura do Projeto

```
transcriptioon-pro/
├── frontend/                    # Aplicação Next.js completa
│   ├── app/                    # App Router (Pages + API Routes)
│   │   ├── (app)/             # Rotas protegidas por autenticação
│   │   │   ├── upload/        # Página de upload
│   │   │   ├── library/       # Biblioteca de transcrições
│   │   │   ├── processing/    # Status de processamento
│   │   │   ├── profile/       # Perfil do usuário
│   │   │   └── song/[id]/     # Detalhes da transcrição
│   │   ├── api/               # Backend (API Routes)
│   │   │   └── transcriptions/
│   │   │       ├── upload/    # Upload e processamento
│   │   │       ├── [id]/      # Status e detalhes
│   │   │       └── route.ts   # Listagem
│   │   └── layout.tsx         # Layout raiz
│   ├── components/ui/         # Componentes reutilizáveis
│   ├── lib/                   # Utilitários e clients
│   │   ├── openai-server.ts  # Cliente OpenAI + Chunking
│   │   ├── r2-storage.ts     # Storage Cloudflare R2
│   │   ├── rate-limit.ts     # Rate limiting
│   │   └── prisma.ts         # Cliente Prisma (DB)
│   ├── prisma/
│   │   └── schema.prisma     # Schema do banco de dados
│   ├── middleware.ts         # Clerk authentication
│   ├── .env.example          # Template de variáveis
│   └── package.json
├── .gitignore
├── README.md                  # Este arquivo
├── DEPLOY_GUIDE.md           # Guia completo de deploy
└── PRODUCTION_READY.md       # Checklist de produção
```

---

## 🔧 Setup Local

### Pré-requisitos

- Node.js 20+
- npm ou pnpm
- **ffmpeg** instalado ([Download](https://ffmpeg.org/download.html))
  ```bash
  # Windows: Baixar e adicionar ao PATH
  # Linux: sudo apt install ffmpeg
  # Mac: brew install ffmpeg
  ```

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/transcriptioon-pro.git
cd transcriptioon-pro/frontend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais (veja seção abaixo)

# 4. Configure o banco de dados
npx prisma generate
npx prisma db push

# 5. Inicie o servidor
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🔐 Variáveis de Ambiente

Crie `.env.local` em `/frontend` com:

```env
# Clerk Authentication (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database - Supabase PostgreSQL (https://supabase.com)
# Use Session Pooler para IPv4
DATABASE_URL="postgresql://postgres.xxx:senha@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

# OpenAI API (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-...

# Cloudflare R2 Storage (https://dash.cloudflare.com)
R2_ACCOUNT_ID=seu_account_id
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=lyricspro-audio
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# App Config
NEXT_PUBLIC_APP_NAME=LyricsPro
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Veja `.env.example` para todos os detalhes.

---

## 🚀 Deploy em Produção

### Deploy Rápido (Vercel)

1. **Push para GitHub**
   ```bash
   git add .
   git commit -m "feat: projeto completo"
   git push
   ```

2. **Importar no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - New Project → Import Repository
   - Root Directory: **frontend**
   - Framework: Next.js (detecta automaticamente)

3. **Adicionar Environment Variables**
   - Copie todas as variáveis de `.env.local`
   - Cole em: Project Settings → Environment Variables

4. **Deploy!**

**Para guia completo de produção**, veja:
- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - Passo a passo detalhado
- [PRODUCTION_READY.md](./PRODUCTION_READY.md) - Checklist e troubleshooting

---

## 📊 Como Funciona

### Fluxo de Transcrição

```
1. Upload (Frontend)
   ↓
2. Salvar em R2 + Criar registro DB (API Route)
   ↓
3. Processamento em background:
   - Verificar duração
   - Se > 20min: dividir em chunks (ffmpeg)
   - Transcrever cada chunk (OpenAI)
   - Juntar resultados
   ↓
4. Pós-processamento (GPT-4o)
   ↓
5. Status → completed
```

### Chunking Automático

Áudios > 20 minutos são divididos automaticamente:

```typescript
// lib/openai-server.ts
async function splitAudioIntoChunks(filePath: string, chunkDuration: number = 1200) {
  const duration = await getAudioDuration(filePath);

  if (duration <= chunkDuration) {
    return [filePath]; // Não precisa dividir
  }

  // Divide em chunks de 20min usando ffmpeg
  // Processa cada um
  // Junta com offset de timestamp
}
```

---

## 🛠️ Desenvolvimento

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start

# Linting
npm run lint

# Prisma Studio (GUI do banco)
npx prisma studio

# Gerar Prisma Client
npx prisma generate

# Sync schema com DB
npx prisma db push
```

### Estrutura de Código

**Components** (`components/ui/`):
- `Button`, `Card`, `Input` - Componentes base
- `ProcessingStatus` - Status de transcrição com etapas
- `LyricViewer` - Visualizador de texto
- `Header`, `BottomNav` - Navegação

**API Routes** (`app/api/transcriptions/`):
- `upload/route.ts` - Upload + processamento
- `[id]/route.ts` - Status e detalhes
- `route.ts` - Listagem

**Libraries** (`lib/`):
- `openai-server.ts` - Cliente OpenAI + chunking
- `r2-storage.ts` - Upload/download R2
- `rate-limit.ts` - Rate limiting simples
- `prisma.ts` - Cliente DB

---

## 📝 API Routes

### POST /api/transcriptions/upload

Upload de arquivo e início de transcrição.

**Request:**
```typescript
FormData {
  file: File                      // Arquivo de áudio/vídeo
  language: string                // 'pt', 'en', 'es', etc
  enable_diarization: boolean     // Separação de falantes
  enable_post_processing: boolean // Correção com GPT-4o
}
```

**Response:**
```json
{
  "id": "uuid-da-transcrição",
  "status": "pending",
  "progress": 0,
  "created_at": "2025-01-14T..."
}
```

### GET /api/transcriptions

Lista transcrições do usuário autenticado.

**Query Params:**
- `limit`: número de itens (default: 50)
- `offset`: paginação
- `status`: filtrar por status (pending/processing/completed/failed)

### GET /api/transcriptions/[id]

Retorna status e detalhes da transcrição.

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "progress": 100,
  "transcription_text": "Texto completo...",
  "word_count": 1523,
  "speaker_count": 2,
  "segments": [...],
  "chapters": [...]
}
```

---

## 🐛 Troubleshooting

### FFmpeg não encontrado
```bash
# Verificar instalação
ffmpeg -version
ffprobe -version

# Se não encontrado:
# Windows: Baixar de ffmpeg.org e adicionar ao PATH
# Linux: sudo apt install ffmpeg
# Mac: brew install ffmpeg
```

### Erro de conexão com banco
```bash
# Testar conexão
psql "postgresql://postgres.xxx:senha@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

# Verificar:
# 1. Usando Session Pooler (não Direct Connection)
# 2. Senha correta
# 3. Supabase não tem firewall bloqueando
```

### Timeout no Vercel
O Vercel tem limite de 60s para execução. Áudios longos podem dar timeout.

**Solução temporária**: Áudios < 5min funcionam bem.
**Solução definitiva**: Implementar worker assíncrono separado (ver PRODUCTION_READY.md).

### Rate limit atingido
```
Erro 429: "Muitas requisições"
```
Limite: 10 uploads/minuto por usuário. Aguarde 1 minuto e tente novamente.

---

## 📈 Performance e Limites

### Otimizações Implementadas

- ✅ Chunking automático (áudios longos)
- ✅ Rate limiting (proteção contra spam)
- ✅ Cleanup de arquivos temporários
- ✅ Connection pooling (Supabase)
- ✅ Image optimization (Next.js)
- ✅ Lazy loading de componentes

### Limites Atuais

| Item | Limite |
|------|--------|
| Tamanho do arquivo | 100MB |
| Duração do áudio | Ilimitada (chunking automático) |
| Uploads por minuto | 10 por usuário |
| Timeout (Vercel) | 60 segundos ⚠️ |

⚠️ **Nota**: Processamento síncrono pode causar timeout para áudios > 5min. Veja [PRODUCTION_READY.md](./PRODUCTION_READY.md) para solução.

### Custos (Estimativa)

| Serviço | Free Tier | Custo após |
|---------|-----------|------------|
| Vercel | 100GB bandwidth | $20/mês |
| Supabase | 500MB DB + 1GB storage | $25/mês |
| Cloudflare R2 | 10GB storage | $0.015/GB |
| OpenAI API | Pay-as-you-go | ~$0.006-0.03/min |

---

## 🔒 Segurança

- ✅ Autenticação obrigatória (Clerk)
- ✅ Rate limiting por usuário
- ✅ Validação de tipo e tamanho de arquivo
- ✅ Sanitização de inputs
- ✅ Variáveis de ambiente protegidas
- ✅ CORS configurado
- ✅ SQL injection protection (Prisma)

---

## 📚 Documentação Adicional

- **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)** - Guia completo de deploy e configuração
- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** - Checklist de produção e melhorias

---

## 📄 Licença

Proprietary - Todos os direitos reservados © 2025

---

## 👨‍💻 Autor

**Erick** - Desenvolvedor Full Stack

---

**Desenvolvido com ❤️ usando Next.js, OpenAI e Vercel**
