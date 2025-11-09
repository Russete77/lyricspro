# LyricsPro Frontend

Frontend Next.js 16 para o sistema LyricsPro - Transcrição inteligente de letras de música com detecção automática de estrutura musical.

## ✅ Setup Completo

### Stack Tecnológica

- **Next.js 16** (App Router + Turbopack)
- **TypeScript** 5.9+
- **Tailwind CSS 4** (com configuração customizada)
- **React 19**
- Bibliotecas utilitárias: `clsx`, `tailwind-merge`, `class-variance-authority`

### Design System

Implementado conforme `DESIGNSYSTEM.MD`:

- ✅ Paleta de cores completa (brand, music structure, neutral, status)
- ✅ Tipografia (Manrope + Inter)
- ✅ Sistema de espaçamento (baseado em 4px)
- ✅ Animações CSS (float, wave, recording, shimmer, etc.)
- ✅ Utilitários customizados (glass, text-gradient, scrollbar, etc.)
- ✅ Responsividade mobile-first

### Estrutura de Arquivos

```
frontend/
├── app/
│   ├── layout.tsx          # Layout raiz com fonts
│   ├── page.tsx            # Página inicial
│   └── globals.css         # Estilos globais + Tailwind
├── components/
│   └── ui/                 # Componentes UI (a implementar)
├── lib/
│   ├── api.ts              # Cliente HTTP para backend FastAPI
│   ├── types.ts            # TypeScript types da API
│   └── utils.ts            # Utilitários (cn, formatDuration, etc.)
├── hooks/                  # Custom hooks (a criar)
├── public/                 # Assets estáticos
├── .env.local              # Variáveis de ambiente
├── tailwind.config.ts      # Configuração Tailwind
├── tsconfig.json           # Configuração TypeScript
└── next.config.ts          # Configuração Next.js
```

## 🚀 Como Rodar

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` se necessário:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=LyricsPro
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Rodar Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### 4. Build para Produção

```bash
npm run build
npm start
```

## 🔌 Integração com Backend

O frontend está configurado para se comunicar com o backend FastAPI rodando em `http://localhost:8000`.

### Endpoints Disponíveis (via `lib/api.ts`)

#### Upload
```typescript
import { uploadFile } from '@/lib/api'

const response = await uploadFile(file, {
  language: 'pt',
  enable_post_processing: true,
  onProgress: (progress) => console.log(`${progress}%`)
})
// response: { job_id, status, estimated_time_minutes, message }
```

#### Status
```typescript
import { getTranscriptionStatus } from '@/lib/api'

const status = await getTranscriptionStatus(jobId)
// status: { job_id, status, progress, transcription_text, ... }
```

#### Segmentos
```typescript
import { getTranscriptionSegments } from '@/lib/api'

const { segments } = await getTranscriptionSegments(jobId)
// segments: [{ start, end, text, confidence, speaker, words }]
```

#### Capítulos (Estrutura Musical)
```typescript
import { getTranscriptionChapters } from '@/lib/api'

const { chapters } = await getTranscriptionChapters(jobId)
// chapters: [{ title: "VERSO 1", start, end, summary }]
```

#### Download
```typescript
import { downloadTranscriptionTXT, downloadTranscriptionJSON } from '@/lib/api'

const { text } = await downloadTranscriptionTXT(jobId)
const data = await downloadTranscriptionJSON(jobId)
```

## 📊 Tipos TypeScript

Todos os tipos estão definidos em `lib/types.ts` baseados nos schemas do backend:

```typescript
import type {
  TranscriptionCreateResponse,
  TranscriptionStatusResponse,
  TranscriptionSegment,
  TranscriptionChapter,
  Song
} from '@/lib/types'
```

## 🎨 Utilitários

### `cn()` - Class Name Merge
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  condition && 'conditional-class',
  'another-class'
)} />
```

### `formatDuration()`
```typescript
import { formatDuration } from '@/lib/utils'

formatDuration(307) // "5:07"
formatDuration(3665) // "1:01:05"
```

### `formatBytes()`
```typescript
import { formatBytes } from '@/lib/utils'

formatBytes(1024) // "1 KB"
formatBytes(1048576) // "1 MB"
```

### `formatRelativeTime()`
```typescript
import { formatRelativeTime } from '@/lib/utils'

formatRelativeTime(new Date()) // "agora mesmo"
formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hora atrás"
```

## 🎯 Próximos Passos

### Fase 2: Componentes Base (Pendente)
- [ ] Button
- [ ] Card
- [ ] Input/Textarea
- [ ] Badge/StructureBadge
- [ ] Modal/Dialog
- [ ] Toast/Notification
- [ ] Dropdown/Select
- [ ] Avatar
- [ ] Progress
- [ ] Skeleton
- [ ] EmptyState
- [ ] Tabs

### Fase 3: Componentes Especializados (Pendente)
- [ ] MusicUploader (drag & drop)
- [ ] LyricViewer (com highlight de estrutura)
- [ ] SongCard (biblioteca)
- [ ] ProcessingStatus
- [ ] BottomNav

### Fase 4: Hooks Customizados (Pendente)
- [ ] useUpload (upload com progresso)
- [ ] usePolling (polling de status)
- [ ] useRecorder (gravação de áudio - opcional)

### Fase 5: Páginas (Pendente)
- [ ] Landing page (`/`)
- [ ] Upload (`/upload`)
- [ ] Biblioteca (`/library`)
- [ ] Visualizar música (`/song/[id]`)
- [ ] Perfil (`/profile`)

## 🐛 Troubleshooting

### Erro de CORS
Se houver erro de CORS ao conectar com o backend, verifique se o FastAPI está configurado com:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Backend não está rodando
Inicie o backend primeiro:

```bash
cd ../backend
uvicorn app.main:app --reload
```

## 📚 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Design System](../DESIGNSYSTEM.MD)

---

**Status**: ✅ Setup inicial completo e funcionando!

**Última atualização**: Janeiro 2025
