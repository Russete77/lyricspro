# 🚀 Guia de Deploy - LyricsPro

## 📋 Arquitetura Final

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                    │
│  - Next.js 16 + App Router                             │
│  - Clerk Authentication                                  │
│  - Vercel Analytics                                      │
│  - Upload → Envia para Backend API                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   BACKEND API (Render)                  │
│  - FastAPI (Python)                                     │
│  - Recebe upload → Salva em R2                          │
│  - Cria task no Celery                                  │
│  - Retorna job_id                                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                 CELERY WORKER (Render)                  │
│  - Processa transcrições async                          │
│  - OpenAI API (gpt-4o-transcribe)                       │
│  - Post-processing (GPT-4o)                             │
│  - Atualiza status no DB                                │
└─────────────────────────────────────────────────────────┘
        ↓                    ↓                    ↓
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Supabase    │   │   Redis      │   │ Cloudflare   │
│  PostgreSQL  │   │   (Upstash)  │   │     R2       │
│              │   │              │   │              │
│  - Dados     │   │  - Queue     │   │  - Files     │
│  - Users     │   │  - Jobs      │   │  - Audio     │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 🔧 Passo 1: Configurar Serviços Externos

### 1.1 Clerk (Autenticação)
1. Acesse https://dashboard.clerk.com
2. Create Application → "LyricsPro"
3. Copie as chaves:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```

### 1.2 Supabase (Database)
1. Acesse https://supabase.com
2. New Project → "lyricspro"
3. Database → Connection Pooling → **Session pooler**
4. Copie a URL:
   ```
   DATABASE_URL=postgresql://postgres.xxx:pass@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
   ```

### 1.3 Upstash Redis (Celery Queue)
1. Acesse https://upstash.com
2. Create Database → "lyricspro-queue"
3. Copie as URLs:
   ```
   REDIS_URL=rediss://default:xxx@warm-koala-12345.upstash.io:6379
   CELERY_BROKER_URL=rediss://default:xxx@warm-koala-12345.upstash.io:6379/0
   CELERY_RESULT_BACKEND=rediss://default:xxx@warm-koala-12345.upstash.io:6379/1
   ```

### 1.4 Cloudflare R2 (Storage)
1. Acesse https://dash.cloudflare.com
2. R2 → Create Bucket → "lyricspro-audio"
3. Manage R2 API Tokens → Create API Token
4. Copie as credenciais:
   ```
   R2_ACCOUNT_ID=seu_account_id
   R2_ACCESS_KEY_ID=xxx
   R2_SECRET_ACCESS_KEY=xxx
   R2_BUCKET_NAME=lyricspro-audio
   ```
5. Settings → Public Access → **Enable** (para URLs públicas)
   ```
   R2_PUBLIC_URL=https://pub-xxx.r2.dev
   ```

### 1.5 OpenAI API
1. Acesse https://platform.openai.com/api-keys
2. Create new secret key
3. Copie:
   ```
   OPENAI_API_KEY=sk-proj-...
   ```

---

## 🚀 Passo 2: Deploy do Backend (Render.com)

### 2.1 Criar Web Service (API)

1. **Push código para GitHub**
   ```bash
   cd backend
   git add .
   git commit -m "feat: backend pronto para produção"
   git push
   ```

2. **Criar Web Service no Render**
   - Acesse https://render.com
   - New → Web Service
   - Connect repository: `transcriptioon-pro`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.production.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Configurar Environment Variables**
   ```env
   # API
   DEBUG=false
   API_PORT=8000

   # Database
   DATABASE_URL=postgresql://postgres.xxx:pass@aws-1-sa-east-1.pooler.supabase.com:5432/postgres

   # Redis/Celery
   REDIS_URL=rediss://default:xxx@warm-koala-12345.upstash.io:6379
   CELERY_BROKER_URL=rediss://default:xxx@warm-koala-12345.upstash.io:6379/0
   CELERY_RESULT_BACKEND=rediss://default:xxx@warm-koala-12345.upstash.io:6379/1

   # Storage (R2)
   STORAGE_TYPE=s3
   STORAGE_ENDPOINT=<account_id>.r2.cloudflarestorage.com
   STORAGE_ACCESS_KEY=xxx
   STORAGE_SECRET_KEY=xxx
   STORAGE_BUCKET=lyricspro-audio
   STORAGE_SECURE=true

   # OpenAI
   TRANSCRIPTION_STRATEGY=api
   OPENAI_API_KEY=sk-proj-...
   OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe-diarize

   # CORS
   CORS_ORIGINS=https://lyricspro.vercel.app
   ```

4. **Deploy!**

### 2.2 Criar Background Worker (Celery)

1. **Criar novo serviço no Render**
   - New → Background Worker
   - Mesmo repositório
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.production.txt`
   - Start Command: `celery -A app.workers.celery_app worker --loglevel=info`

2. **Usar MESMAS environment variables** do Web Service

3. **Deploy!**

### 2.3 Verificar Logs

```bash
# No Render dashboard
# Web Service → Logs
# Background Worker → Logs

# Deve ver:
# [API] Server started
# [Celery] worker ready
```

---

## 🎨 Passo 3: Deploy do Frontend (Vercel)

### 3.1 Preparar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Testar build local
npm run build
```

### 3.2 Deploy no Vercel

1. **Push para GitHub**
   ```bash
   git add .
   git commit -m "feat: frontend pronto para produção"
   git push
   ```

2. **Importar no Vercel**
   - Acesse https://vercel.com
   - Add New → Project
   - Import Git Repository
   - Root Directory: `frontend`
   - Framework Preset: Next.js (detecta automaticamente)

3. **Configurar Environment Variables**
   ```env
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...

   # Database
   DATABASE_URL=postgresql://postgres.xxx:pass@aws-1-sa-east-1.pooler.supabase.com:5432/postgres

   # OpenAI (apenas para API routes)
   OPENAI_API_KEY=sk-proj-...

   # R2 Storage
   R2_ACCOUNT_ID=xxx
   R2_ACCESS_KEY_ID=xxx
   R2_SECRET_ACCESS_KEY=xxx
   R2_BUCKET_NAME=lyricspro-audio
   R2_PUBLIC_URL=https://pub-xxx.r2.dev

   # Backend API URL
   NEXT_PUBLIC_API_URL=https://lyricspro-api.onrender.com
   ```

4. **Deploy!**

### 3.3 Configurar Domínio no Clerk

1. Clerk Dashboard → Configure → Domains
2. Add domain: `lyricspro.vercel.app` (ou seu custom domain)
3. Save

---

## ✅ Passo 4: Verificação Pós-Deploy

### 4.1 Testar Backend

```bash
# Health check
curl https://lyricspro-api.onrender.com/health

# Deve retornar: {"status": "ok"}
```

### 4.2 Testar Frontend

1. Acesse https://lyricspro.vercel.app
2. Clique em "Entrar" (Clerk modal deve abrir)
3. Crie uma conta
4. Faça upload de um áudio pequeno (1-2 min)
5. Verifique se transcrição inicia

### 4.3 Monitorar Processamento

**Render Logs (Backend Worker):**
```
[Celery] Received task: transcribe_audio[xxx]
[OpenAI] Transcribing audio...
[OpenAI] Transcription completed
[Celery] Task complete
```

**Vercel Analytics:**
- Dashboard → Analytics
- Ver page views e usuários

---

## 🐛 Troubleshooting

### Erro: "Can't reach database"
```bash
# Teste conexão manual
psql "postgresql://postgres.xxx:pass@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

# Se falhar:
# 1. Verificar se usou Session Pooler (não Direct Connection)
# 2. Verificar senha
# 3. Verificar whitelist no Supabase (deve estar liberado)
```

### Erro: "Celery worker not processing"
```bash
# Verificar Redis connection
redis-cli -u rediss://default:xxx@warm-koala-12345.upstash.io:6379 ping
# Deve retornar: PONG

# Verificar logs do Celery Worker no Render
# Procurar por erros de conexão
```

### Erro: "Upload failed"
```bash
# Verificar R2 credentials
# Render → Web Service → Environment
# Confirmar que todas as vars R2_* estão preenchidas

# Testar upload manual:
aws s3 cp test.txt s3://lyricspro-audio/test.txt \
  --endpoint-url https://<account_id>.r2.cloudflarestorage.com
```

### Erro: "Timeout" no frontend
```bash
# Frontend não deve processar - apenas enviar para backend
# Verificar em app/api/transcriptions/upload/route.ts
# Se estiver processando direto, remover e deixar só criar job no backend
```

---

## 📊 Monitoramento

### Vercel
- **Analytics**: Dashboard → Analytics
- **Logs**: Project → Deployments → View Function Logs

### Render
- **API Logs**: Web Service → Logs
- **Worker Logs**: Background Worker → Logs
- **Metrics**: Dashboard (CPU, Memory, Response Time)

### Supabase
- **Queries**: Dashboard → Database → Query Performance
- **Storage**: Dashboard → Database → Disk Usage

### Upstash Redis
- **Commands**: Dashboard → Metrics
- **Memory**: Dashboard → Memory Usage

---

## 💰 Custos Estimados (Tier Gratuito)

| Serviço | Free Tier | Custo após limite |
|---------|-----------|-------------------|
| Vercel | 100GB bandwidth | $20/mês (Pro) |
| Render (API) | 750h/mês | $7/mês |
| Render (Worker) | 750h/mês | $7/mês |
| Supabase | 500MB DB + 1GB storage | $25/mês (Pro) |
| Upstash Redis | 10k commands/day | $0.2/100k commands |
| Cloudflare R2 | 10GB storage | $0.015/GB |
| OpenAI API | Pay-as-you-go | ~$0.006-0.03/min |

**Total FREE: Até ~100 usuários/mês**
**Total PAGO: ~$60-100/mês para escala média**

---

## 🎯 Checklist Final

- [ ] Clerk configurado e testado
- [ ] Supabase conectado
- [ ] Redis/Upstash funcionando
- [ ] R2 com upload/download OK
- [ ] Backend API deployado no Render
- [ ] Celery Worker rodando no Render
- [ ] Frontend deployado no Vercel
- [ ] Analytics aparecendo no Vercel
- [ ] Upload + Transcrição funcionando end-to-end
- [ ] Logs sem erros críticos

---

## 🚀 Está Pronto!

Parabéns! Seu app está em produção.

**Próximos Passos:**
1. Compartilhe com beta testers
2. Monitore erros e performance
3. Ajuste rate limits conforme necessário
4. Configure domínio custom (opcional)
5. Configure alertas (Render → Notifications)

**Suporte:**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Clerk Docs: https://clerk.com/docs
