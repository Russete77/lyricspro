# 🚀 Guia de Deploy - TranscritorAI Pro

## 📋 Pré-requisitos

- [ ] Conta no GitHub (grátis)
- [ ] Conta no Render.com (grátis - sem cartão necessário)
- [ ] Conta no Vercel (grátis - sem cartão necessário)
- [ ] OpenAI API Key (opcional - para pós-processamento com GPT-4o)

---

## 🔧 PARTE 1: Preparar Repositório GitHub

### 1. Inicializar Git (se ainda não fez)

```bash
cd C:\Users\erick\transcriptioon-pro
git init
git add .
git commit -m "Initial commit - TranscritorAI Pro"
```

### 2. Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `transcriptor-ai-pro`
3. Visibilidade: `Private` (ou Public se quiser)
4. **NÃO** inicialize com README
5. Clique em `Create repository`

### 3. Push para GitHub

```bash
git remote add origin https://github.com/SEU-USUARIO/transcriptor-ai-pro.git
git branch -M main
git push -u origin main
```

---

## 🎨 PARTE 2: Deploy do Frontend (Vercel)

### Opção A: Via Dashboard (Mais Fácil)

1. Acesse: https://vercel.com/new
2. Conecte sua conta do GitHub
3. Selecione o repositório `transcriptor-ai-pro`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://transcriptor-api.onrender.com
   ```
   ⚠️ **IMPORTANTE:** Você vai pegar esta URL depois do deploy do backend!

6. Clique em `Deploy`

### Opção B: Via CLI

```bash
cd frontend
npm i -g vercel
vercel login
vercel

# Quando perguntar:
# Set up and deploy? Y
# Which scope? [seu usuario]
# Link to existing project? N
# What's your project's name? transcriptor-pro
# In which directory is your code located? ./
# Want to override the settings? N

# Deploy para produção:
vercel --prod
```

### Resultado esperado:
✅ Frontend disponível em: `https://transcriptor-pro-seu-usuario.vercel.app`

---

## 🔥 PARTE 3: Deploy do Backend (Render)

### Opção A: Via Blueprint (Automático - RECOMENDADO)

1. Acesse: https://dashboard.render.com/
2. Clique em `New` → `Blueprint`
3. Conecte sua conta do GitHub
4. Selecione o repositório `transcriptor-ai-pro`
5. Render vai detectar o arquivo `render.yaml` automaticamente
6. **Nome do blueprint:** `transcriptor-ai-pro`
7. Clique em `Apply`

Render vai criar automaticamente:
- ✅ Web Service (FastAPI API)
- ✅ Worker Service (Celery)
- ✅ PostgreSQL (1GB grátis)
- ✅ Redis (25MB grátis)

### Opção B: Manual (Passo a Passo)

#### 3.1 Criar PostgreSQL

1. Dashboard Render → `New` → `PostgreSQL`
2. Nome: `transcriptor-db`
3. Database: `transcriptor_ai`
4. Region: `Oregon` (free)
5. Plan: `Free`
6. Clique em `Create Database`
7. **Copie a `Internal Database URL`** (vai precisar)

#### 3.2 Criar Redis

1. Dashboard Render → `New` → `Redis`
2. Nome: `transcriptor-redis`
3. Region: `Oregon` (free)
4. Plan: `Free`
5. Clique em `Create Redis`
6. **Copie a `Internal Redis URL`** (vai precisar)

#### 3.3 Criar Web Service (API)

1. Dashboard Render → `New` → `Web Service`
2. Conecte o repositório GitHub
3. Configure:
   - **Name:** `transcriptor-api`
   - **Region:** Oregon (free)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.production.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

4. **Environment Variables** (clique em `Advanced`):
   ```
   PYTHON_VERSION=3.11.0
   DATABASE_URL=[Cole a Internal Database URL do PostgreSQL]
   REDIS_URL=[Cole a Internal Redis URL]
   ENVIRONMENT=production
   CORS_ORIGINS=https://transcriptor-pro-seu-usuario.vercel.app
   WHISPER_MODEL_SIZE=base
   WHISPER_DEVICE=cpu
   MAX_FILE_SIZE_MB=100
   MAX_DURATION_MINUTES=30
   ```

5. **Health Check Path:** `/api/health`

6. Clique em `Create Web Service`

#### 3.4 Criar Worker Service (Celery)

1. Dashboard Render → `New` → `Background Worker`
2. Conecte o repositório GitHub
3. Configure:
   - **Name:** `transcriptor-worker`
   - **Region:** Oregon (free)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.production.txt`
   - **Start Command:** `celery -A app.workers.celery_app worker --loglevel=info --concurrency=1 -Q cpu-tasks --pool=solo`
   - **Plan:** Free

4. **Environment Variables** (mesmas da API):
   ```
   PYTHON_VERSION=3.11.0
   DATABASE_URL=[Cole a Internal Database URL]
   REDIS_URL=[Cole a Internal Redis URL]
   ENVIRONMENT=production
   WHISPER_MODEL_SIZE=base
   WHISPER_DEVICE=cpu
   ```

5. Clique em `Create Background Worker`

### Resultado esperado:
✅ API disponível em: `https://transcriptor-api.onrender.com`

---

## 🔗 PARTE 4: Conectar Frontend com Backend

### 1. Pegar URL do Backend

No dashboard do Render, clique no serviço `transcriptor-api` e copie a URL:
```
https://transcriptor-api.onrender.com
```

### 2. Atualizar Frontend na Vercel

1. Vercel Dashboard → Seu projeto → `Settings` → `Environment Variables`
2. Edite `NEXT_PUBLIC_API_URL`:
   ```
   NEXT_PUBLIC_API_URL=https://transcriptor-api.onrender.com
   ```
3. Clique em `Save`
4. Vá em `Deployments` → Clique nos 3 pontinhos do último deploy → `Redeploy`

### 3. Atualizar CORS no Backend

1. Render Dashboard → `transcriptor-api` → `Environment`
2. Edite `CORS_ORIGINS` com a URL real do Vercel:
   ```
   CORS_ORIGINS=https://transcriptor-pro-seu-usuario.vercel.app,http://localhost:3000
   ```
3. Clique em `Save Changes`
4. Render vai fazer redeploy automático

---

## ✅ PARTE 5: Testar Deploy

### 1. Verificar Health Check

Abra no navegador:
```
https://transcriptor-api.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 2. Verificar Frontend

Abra:
```
https://transcriptor-pro-seu-usuario.vercel.app
```

Deve carregar a landing page normalmente.

### 3. Testar Upload

1. Clique em `Começar Agora`
2. Faça upload de um arquivo de áudio pequeno
3. Aguarde processamento

⚠️ **IMPORTANTE:** O primeiro upload pode demorar ~2-3 minutos porque:
- Render está baixando os modelos do Whisper
- Servidor estava "dormindo" (spin down)

---

## 🐛 Troubleshooting

### Problema: Backend não responde (503 Error)

**Solução:** Aguarde 30-60 segundos. Render está "acordando" o servidor.

### Problema: CORS Error no Frontend

**Solução:** Verifique se o `CORS_ORIGINS` no backend tem a URL EXATA do Vercel (sem / no final).

### Problema: Database connection failed

**Solução:**
1. Verifique se o PostgreSQL está rodando no Render
2. Confirme que a `DATABASE_URL` está correta
3. Espere alguns minutos (database pode estar inicializando)

### Problema: Worker não processa

**Solução:**
1. Verifique logs do worker no Render
2. Confirme que `REDIS_URL` está correta
3. Verifique se o worker está rodando (Render Dashboard)

### Problema: Whisper model download failed

**Solução:**
1. Primeira execução é lenta (download do modelo)
2. Use `WHISPER_MODEL_SIZE=base` (mais rápido, 74MB)
3. Logs vão mostrar progresso do download

---

## 🎯 Melhorias Pós-Deploy

### 1. Evitar Spin Down (Grátis)

Use **UptimeRobot** para fazer ping a cada 14 minutos:

1. Crie conta: https://uptimerobot.com/
2. Add New Monitor
3. Monitor Type: `HTTP(s)`
4. URL: `https://transcriptor-api.onrender.com/api/health`
5. Monitoring Interval: `5 minutes`
6. Clique em `Create Monitor`

Pronto! Seu backend nunca mais vai dormir 🎉

### 2. Adicionar OpenAI (Opcional)

Se quiser pós-processamento com GPT-4o:

1. Pegar API Key: https://platform.openai.com/api-keys
2. Render → `transcriptor-api` → Environment
3. Adicionar:
   ```
   OPENAI_API_KEY=sk-seu-key-aqui
   ```
4. Save Changes

### 3. Custom Domain (Opcional)

**Frontend (Vercel):**
1. Vercel → Seu projeto → `Settings` → `Domains`
2. Add seu domínio (ex: `transcriptor.com`)
3. Configurar DNS conforme instruções

**Backend (Render):**
1. Render → `transcriptor-api` → `Settings` → `Custom Domains`
2. Add domínio (ex: `api.transcriptor.com`)
3. Configurar DNS

---

## 📊 Monitoramento

### Logs

**Backend:**
```
Render Dashboard → transcriptor-api → Logs
```

**Worker:**
```
Render Dashboard → transcriptor-worker → Logs
```

**Frontend:**
```
Vercel Dashboard → Seu projeto → Deployments → [clique no deploy] → Logs
```

### Métricas

**Render:**
- CPU, RAM, Network no dashboard
- PostgreSQL: storage usado
- Redis: memória usada

**Vercel:**
- Bandwidth
- Build time
- Function executions

---

## 💰 Custos

### Free Tier (atual):
- Vercel: FREE
- Render API: FREE (750h/mês)
- Render Worker: FREE (750h/mês)
- PostgreSQL: FREE (1GB)
- Redis: FREE (25MB)
- **Total: $0/mês** 🎉

### Quando crescer:
- Render Starter: $7/serviço = $21/mês
- PostgreSQL Starter: $7/mês
- Redis Starter: $7/mês
- **Total: ~$35/mês**

---

## 🎉 Deploy Completo!

Seu app está rodando em produção! 🚀

**URLs:**
- Frontend: `https://transcriptor-pro-seu-usuario.vercel.app`
- Backend API: `https://transcriptor-api.onrender.com`
- Docs: `https://transcriptor-api.onrender.com/docs`

**Próximos passos:**
1. Testar com usuários reais
2. Coletar feedback
3. Iterar e melhorar
4. Monetizar quando validado

Boa sorte! 💪
