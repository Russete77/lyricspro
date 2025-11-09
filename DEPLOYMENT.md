# 🚀 Guia de Deploy - Transcription Pro

## Arquitetura Híbrida (Grátis + GPU Local)

```
┌─────────────┐      ┌──────────────┐      ┌────────────────┐
│  Frontend   │─────▶│   Backend    │─────▶│   PostgreSQL   │
│  (Vercel)   │      │   (Render)   │      │   (Render)     │
└─────────────┘      └──────────────┘      └────────────────┘
                            │
                            ├─────▶ Redis (Render)
                            │
                     ┌──────┴──────┐
                     │             │
              ┌──────▼───┐  ┌──────▼────────┐
              │  Worker  │  │ Worker GPU    │
              │  CPU     │  │ (Seu PC)      │
              │ (Render) │  │  ⚡ GTX 1650  │
              └──────────┘  └───────────────┘
                Backup        Performance!
```

---

## 📋 Pré-requisitos

- [ ] Conta no [Render](https://render.com) (grátis)
- [ ] Conta no [Vercel](https://vercel.com) (grátis)
- [ ] Repositório no GitHub
- [ ] OpenAI API Key (para GPT-4o)

---

## 🔧 Passo 1: Preparar Repositório GitHub

### 1.1 Inicializar Git (se ainda não foi)
```bash
cd C:\Users\erick\transcriptioon-pro
git init
git add .
git commit -m "Initial commit: Transcription Pro com GPU"
```

### 1.2 Criar repositório no GitHub
1. Acesse: https://github.com/new
2. Nome: `transcription-pro`
3. Descrição: "AI-powered music transcription with GPU acceleration"
4. Visibilidade: Private (recomendado) ou Public
5. **NÃO** marque "Initialize with README"

### 1.3 Push para GitHub
```bash
git remote add origin https://github.com/SEU_USERNAME/transcription-pro.git
git branch -M main
git push -u origin main
```

---

## ☁️ Passo 2: Deploy Backend no Render

### 2.1 Criar Conta e Conectar GitHub
1. Acesse: https://render.com
2. Sign up com GitHub
3. Autorize acesso ao repositório `transcription-pro`

### 2.2 Deploy Automático com render.yaml
O arquivo `render.yaml` já está configurado! O Render vai criar automaticamente:
- ✅ **Web Service** (API FastAPI)
- ✅ **Worker CPU** (Celery backup)
- ✅ **PostgreSQL** (banco de dados)
- ✅ **Redis** (fila do Celery)

**Passos:**
1. Dashboard Render → "New" → "Blueprint"
2. Conecte o repo `transcription-pro`
3. Branch: `main`
4. Render detecta `render.yaml` automaticamente
5. Clique "Apply"

### 2.3 Configurar Variáveis de Ambiente Adicionais
Após criar os serviços, adicione manualmente:

**Em `transcription-pro-api` (Web Service):**
- `OPENAI_API_KEY`: sua chave da OpenAI (obrigatório para GPT-4o)
- `CORS_ORIGINS`: `https://SEU-APP.vercel.app,http://localhost:3000`

**Em `transcription-pro-worker-cpu` (Worker):**
- `OPENAI_API_KEY`: mesma chave

### 2.4 Aguardar Deploy
- Backend API: ~5-10 minutos
- Worker CPU: ~5-10 minutos
- Databases: ~2-3 minutos

**URL da API:** `https://transcription-pro-api.onrender.com`

---

## 🌐 Passo 3: Deploy Frontend na Vercel

### 3.1 Criar Projeto na Vercel
1. Acesse: https://vercel.com
2. "Add New Project"
3. Import do GitHub: `transcription-pro`
4. Framework: **Next.js** (detectado automaticamente)
5. Root Directory: `frontend`

### 3.2 Configurar Variáveis de Ambiente
```env
NEXT_PUBLIC_API_URL=https://transcription-pro-api.onrender.com
NEXT_PUBLIC_APP_URL=https://SEU-APP.vercel.app
```

### 3.3 Deploy
- Clique "Deploy"
- Aguardar ~2-3 minutos

**URL do Frontend:** `https://SEU-APP.vercel.app`

### 3.4 Atualizar CORS no Backend
Volte no Render e atualize `CORS_ORIGINS` com a URL real da Vercel.

---

## 💻 Passo 4: Worker GPU Local (Seu PC)

### 4.1 Criar arquivo `.env.local` no backend
```env
# Copie do .env e adicione:
REDIS_URL=redis://default:SEU_REDIS_PASSWORD@red-xxx.oregon.render.com:6379
DATABASE_URL=postgresql://user:pass@dpg-xxx.oregon.render.com/transcriptions
CELERY_BROKER_URL=redis://default:SEU_REDIS_PASSWORD@red-xxx.oregon.render.com:6379
CELERY_RESULT_BACKEND=redis://default:SEU_REDIS_PASSWORD@red-xxx.oregon.render.com:6379

# GPU Settings
ENABLE_VOCAL_SEPARATION=true
WHISPER_DEVICE=cuda
WHISPER_COMPUTE_TYPE=int8
WHISPER_MODEL_SIZE=large-v3

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

**Como obter as URLs:**
1. Redis URL: Render Dashboard → `transcription-redis` → "Internal Redis URL"
2. Database URL: Render Dashboard → `transcription-db` → "Internal Database URL"

### 4.2 Rodar Worker GPU Localmente
```bash
cd C:\Users\erick\transcriptioon-pro\backend

# Ativar ambiente conda
conda activate transcription

# Rodar worker
celery -A app.workers.celery_app worker --loglevel=info --pool=solo -Q gpu-tasks,celery --hostname=gpu-worker@%h
```

### 4.3 Manter Worker Rodando (Opcional)
**Windows - Criar Batch Script:**
```batch
@echo off
cd C:\Users\erick\transcriptioon-pro\backend
call conda activate transcription
celery -A app.workers.celery_app worker --loglevel=info --pool=solo -Q gpu-tasks,celery --hostname=gpu-worker@%h
```

Salvar como `start-gpu-worker.bat` e criar atalho no "Inicializar" do Windows.

---

## ⚡ Como Funciona a Solução Híbrida

### Cenário 1: PC Ligado (GPU Worker Online)
```
Upload → Render API → Redis Queue
                         ↓
                    GPU Worker (Seu PC)
                    ├─ Demucs GPU (~23s)
                    ├─ Whisper GPU (rápido)
                    └─ GPT-4o (correção)
                         ↓
                    100% Perfeito! ✅
```

### Cenário 2: PC Desligado (GPU Worker Offline)
```
Upload → Render API → Redis Queue
                         ↓
                    CPU Worker (Render)
                    ├─ Sem Demucs ❌
                    ├─ Whisper CPU (5-10min)
                    └─ GPT-4o (correção)
                         ↓
                    90-95% Qualidade 🐢
```

---

## 🧪 Teste de Deploy

### Teste 1: Backend API
```bash
curl https://transcription-pro-api.onrender.com/health
# Esperado: {"status":"healthy"}
```

### Teste 2: Frontend
Abra no navegador: `https://SEU-APP.vercel.app`

### Teste 3: Upload e Processamento
1. Acesse o frontend
2. Faça upload de uma música de teste
3. Aguarde processamento
4. Verifique qualidade da transcrição

---

## 📊 Monitoramento

### Render Dashboard
- **API Logs**: Ver requests e erros
- **Worker Logs**: Ver jobs processados
- **Databases**: Monitorar uso

### Celery Flower (Opcional)
Adicionar worker de monitoramento:
```bash
celery -A app.workers.celery_app flower --port=5555
```

---

## 💰 Custos Estimados

### Grátis:
- ✅ Render (Backend + Worker CPU + PostgreSQL + Redis)
- ✅ Vercel (Frontend)
- ✅ GPU Local (seu PC)

### Pago:
- 💵 OpenAI GPT-4o: ~$0.01-0.05 por música
- 💵 Energia elétrica PC: desprezível

**Total mensal (10 músicas/dia):** ~$3-15/mês apenas OpenAI

---

## 🔒 Segurança

### Variáveis Secretas
**NUNCA commit:**
- ❌ `OPENAI_API_KEY`
- ❌ `DATABASE_URL`
- ❌ `REDIS_URL`

Sempre usar variáveis de ambiente no Render/Vercel.

### CORS
Só permitir origens conhecidas:
```
https://transcription-pro.vercel.app
http://localhost:3000  (desenvolvimento)
```

---

## 🐛 Troubleshooting

### Problema: Worker não conecta no Redis
**Solução:** Verificar `REDIS_URL` no `.env.local`

### Problema: "No workers available"
**Solução:**
- Verificar se worker GPU está rodando
- Fallback para worker CPU do Render

### Problema: Frontend não conecta no Backend
**Solução:**
- Verificar `NEXT_PUBLIC_API_URL` na Vercel
- Verificar `CORS_ORIGINS` no Render

### Problema: Render suspende serviços (Free Tier)
**Solução:**
- Free tier desliga após 15min inatividade
- Primeiro request após inatividade demora ~30s (cold start)
- Considerar upgrade para Starter ($7/mês) se necessário

---

## 🚀 Próximas Melhorias

Quando quiser escalar:

1. **RunPod GPU Cloud** (~$0.02/música)
   - Disponibilidade 24/7
   - Não precisa PC ligado

2. **Render Paid Plan** ($7/mês)
   - Sem sleep
   - Mais RAM

3. **Custom Domain**
   - `transcription.seudomain.com`

---

## 📞 Suporte

Problemas? Verifique:
1. Logs do Render (Backend/Worker)
2. Console do navegador (Frontend)
3. Worker GPU local (se rodando)

---

**Pronto para deploy?** Siga os passos acima! 🎉
