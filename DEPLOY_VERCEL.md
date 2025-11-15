# 🚀 Deploy na Vercel - Guia Completo

## 📋 Resumo

Este guia te leva do zero até o deploy completo do **LyricsPro** na Vercel em produção.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Build passou sem erros (`npm run build` funcionou)
- ✅ Conta na Vercel ([vercel.com](https://vercel.com))
- ✅ Conta no Trigger.dev ([cloud.trigger.dev](https://cloud.trigger.dev))
- ✅ Conta no Clerk ([clerk.com](https://clerk.com))
- ✅ Git configurado e código commitado

---

## 🎯 Fluxo de Deploy

```
1. Push para GitHub
     ↓
2. Conectar GitHub → Vercel
     ↓
3. Fazer primeiro deploy (vai falhar, é normal)
     ↓
4. Configurar variáveis de ambiente
     ↓
5. Configurar Trigger.dev Production
     ↓
6. Redeploy
     ↓
7. Configurar Clerk com URL da Vercel
     ↓
8. Testar tudo em produção
```

---

## 📦 PASSO 1: Push para GitHub

### Se ainda não tem repositório:

```bash
# Inicializar git
git init

# Adicionar remote (substitua com seu repo)
git remote add origin https://github.com/SEU_USUARIO/lyricspro.git

# Commit tudo
git add .
git commit -m "chore: preparar para deploy em produção"

# Push
git push -u origin main
```

### Se já tem repositório:

```bash
# Commit mudanças
git add .
git commit -m "chore: preparar para deploy em produção"

# Push
git push
```

---

## 🔗 PASSO 2: Conectar Vercel ao GitHub

1. Acesse: [https://vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione seu repositório do GitHub
4. Se não aparecer, clique em **Adjust GitHub App Permissions** e permita acesso

---

## ⚙️ PASSO 3: Configurar Projeto na Vercel

1. **Framework Preset**: Next.js (auto-detectado)
2. **Root Directory**: `frontend` ⚠️ **IMPORTANTE!**
3. **Build Command**: `npm run build` (padrão)
4. **Output Directory**: `.next` (padrão)
5. **Install Command**: `npm install` (padrão)

**NÃO ADICIONE** variáveis de ambiente ainda!

6. Clique em **Deploy**

**O deploy vai FALHAR**. É esperado! Faltam as variáveis de ambiente.

---

## 🌐 PASSO 4: Pegar URL da Vercel

Após o deploy (mesmo que tenha falhado):

1. Você verá a URL do projeto: `https://seu-projeto-xxxx.vercel.app`
2. **COPIE** essa URL completa
3. Vamos usar ela nos próximos passos

---

## 🔧 PASSO 5: Configurar Variáveis de Ambiente

Vá em: **Settings** > **Environment Variables**

### Variáveis PRONTAS (copie diretamente):

```bash
DATABASE_URL
postgresql://SUA_DATABASE_URL

OPENAI_API_KEY
sk-proj-XXXXX

R2_ACCOUNT_ID
SEU_ACCOUNT_ID

R2_ACCESS_KEY_ID
SEU_ACCESS_KEY

R2_SECRET_ACCESS_KEY
SEU_SECRET_KEY

R2_BUCKET_NAME
seu-bucket

R2_PUBLIC_URL
(deixe vazio)

NEXT_PUBLIC_APP_NAME
LyricsPro

NEXT_PUBLIC_MAX_FILE_SIZE_MB
500

NEXT_PUBLIC_MAX_DURATION_MINUTES
120
```

### Variáveis que PRECISAM da URL da Vercel:

Substitua `https://seu-projeto-xxxx.vercel.app` pela URL real que você copiou:

```bash
NEXT_PUBLIC_API_URL
https://seu-projeto-xxxx.vercel.app

NEXT_PUBLIC_APP_URL
https://seu-projeto-xxxx.vercel.app
```

### Variáveis do Clerk (por enquanto, use as de dev):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
pk_test_cG93ZXJmdWwtaWJleC0zMy5jbGVyay5hY2NvdW50cy5kZXYk

CLERK_SECRET_KEY
sk_test_J0nb3vj7DKu8sGj2LAa84ZuCsIu4Q0vukqzL1ydEdg
```

### Variável do Trigger.dev (temporária):

Por enquanto, use a de dev. Vamos trocar depois:

```bash
TRIGGER_SECRET_KEY
tr_dev_RySQoJNq37s4DRSzNmRn
```

**Para CADA variável:**
- Selecione ambiente: ✅ **Production** e ✅ **Preview**
- Clique em **Add**

---

## 🔄 PASSO 6: Redeploy

1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deployment
3. Clique em **Redeploy**
4. Aguarde o build...

**Dessa vez deve funcionar!** ✅

Se falhar, verifique os logs:
- **Building** > Clique no deployment > **View Logs**
- Procure por erros de variáveis faltando

---

## 🎯 PASSO 7: Configurar Trigger.dev Production

Agora que temos a URL da Vercel, vamos configurar o Trigger.dev:

### 7.1. Criar Ambiente Production

1. Acesse: [https://cloud.trigger.dev/](https://cloud.trigger.dev/)
2. Vá em **Environments**
3. Clique em **Create Environment**
4. Nome: `Production`
5. Copie a **Production API Key** (`tr_prod_XXXX`)

### 7.2. Atualizar na Vercel

1. Volte na Vercel: **Settings** > **Environment Variables**
2. Encontre `TRIGGER_SECRET_KEY`
3. Clique em **Edit**
4. Substitua `tr_dev_XXXX` por `tr_prod_XXXX`
5. Salve

### 7.3. Deploy dos Jobs

No seu terminal local:

```bash
cd frontend
npx trigger.dev@latest deploy
```

Quando perguntar qual ambiente:
- Selecione: **Production**

Você verá:
```
✓ Jobs deployed:
  - transcribe-audio
✓ Deploy complete!
```

### 7.4. Redeploy Novamente

Volte na Vercel e faça redeploy para usar a nova key do Trigger.dev.

---

## 🔐 PASSO 8: Configurar Clerk Production

Você tem **2 opções**:

### Opção A: Adicionar Domínio ao Mesmo Application (Mais Simples)

1. Acesse: [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Vá em **Domains**
3. Clique em **Add Domain**
4. Adicione: `https://seu-projeto-xxxx.vercel.app` (sua URL da Vercel)
5. Salve

**Pronto!** Não precisa mudar as keys. As mesmas de dev funcionam.

### Opção B: Criar Application Separado (Recomendado)

1. Acesse: [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Clique no nome do projeto (canto superior esquerdo)
3. **Create Application**
4. Nome: `LyricsPro Production`
5. Após criar:
   - Vá em **Domains**
   - Adicione: `https://seu-projeto-xxxx.vercel.app`
   - Vá em **API Keys**
   - Copie `pk_live_XXXX` e `sk_live_XXXX`
6. Volte na Vercel: **Settings** > **Environment Variables**
7. Edite:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_XXXX`
   - `CLERK_SECRET_KEY` → `sk_live_XXXX`
8. Redeploy novamente

---

## ✅ PASSO 9: Testar em Produção

1. Acesse sua URL: `https://seu-projeto-xxxx.vercel.app`
2. Teste o fluxo completo:

### Teste 1: Autenticação
- ✅ Cadastrar novo usuário
- ✅ Fazer login
- ✅ Ver perfil

### Teste 2: Upload
- ✅ Fazer upload de um áudio pequeno (1-2 min)
- ✅ Verificar que está processando
- ✅ Monitorar no Trigger.dev Dashboard

### Teste 3: Transcrição
- ✅ Aguardar completar
- ✅ Ver transcrição na Library
- ✅ Testar player de áudio
- ✅ Testar sincronização de letra (karaoke)
- ✅ Fazer download (TXT, SRT, VTT, JSON)

### Teste 4: Performance
- ✅ Upload de arquivo grande (20+ min)
- ✅ Verificar chunks funcionando
- ✅ Verificar armazenamento no R2

---

## 🐛 Troubleshooting

### Deploy falha com "Missing environment variable"
- Verifique se TODAS as variáveis foram adicionadas
- Certifique-se de selecionar **Production**

### "Clerk: Invalid publishable key"
- Verifique se adicionou o domínio da Vercel no Clerk
- Se usando keys de produção, confirme que copiou corretamente

### Trigger.dev job não roda
- Verifique se fez `npx trigger.dev@latest deploy`
- Confirme que usou `tr_prod_` na Vercel
- Veja logs no Dashboard do Trigger.dev

### Upload falha com "File too large"
- Verifique `NEXT_PUBLIC_MAX_FILE_SIZE_MB=500`
- Confirme que está usando R2 (não filesystem local)

### Transcrição fica travada em "Processing"
- Veja logs no Trigger.dev Dashboard
- Verifique se OpenAI API key está válida
- Confirme que FFmpeg está funcionando (deve funcionar automaticamente na Vercel)

---

## 📊 Monitoramento em Produção

### Vercel Analytics
1. **Analytics** (menu lateral)
2. Monitore:
   - Requests por segundo
   - Tempo de resposta
   - Erros 4xx/5xx

### Trigger.dev Runs
1. Dashboard do Trigger.dev
2. Ambiente: **Production**
3. **Runs** > Histórico de execuções
4. Configure alertas para falhas

### OpenAI Usage
1. [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. Monitore gastos
3. Configure limite de budget

### Cloudflare R2
1. [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. Veja storage usado
3. Monitore requests

---

## 💰 Estimativa de Custos

### Vercel Pro ($20/mês):
- Deployment automático
- Analytics
- Logs ilimitados
- Sem cold starts

### Trigger.dev Free:
- 1000 runs/mês grátis
- Suficiente para começar

### OpenAI (Whisper Large-v3):
- ~$0.006 por minuto de áudio
- 100 horas de áudio = ~$36
- Monitorar uso é CRÍTICO

### Cloudflare R2:
- $0.015/GB/mês storage
- Primeiros 10GB grátis
- 100GB = ~$1.50/mês

### Total Estimado:
- **Mínimo**: $20/mês (só Vercel + OpenAI pay-as-you-go)
- **Médio**: $50-100/mês (com uso regular)

---

## 🎉 Pronto!

Seu app está no ar! 🚀

**Próximos passos:**
1. Adicionar domínio customizado (opcional)
2. Configurar SSL (automático na Vercel)
3. SEO e Open Graph tags
4. Monitoramento de erros (Sentry?)
5. Analytics de usuários (PostHog?)

---

## 📚 Guias Relacionados

- [PRODUCTION_ENV_GUIDE.md](./PRODUCTION_ENV_GUIDE.md) - Detalhes de todas as variáveis
- [TRIGGER_DEV_PRODUCTION_SETUP.md](./TRIGGER_DEV_PRODUCTION_SETUP.md) - Trigger.dev em profundidade
- [CLERK_PRODUCTION_SETUP.md](./CLERK_PRODUCTION_SETUP.md) - Clerk em profundidade

---

## 🆘 Precisa de Ajuda?

Se algo der errado:
1. Verifique os logs na Vercel
2. Verifique runs no Trigger.dev
3. Teste localmente com as mesmas variáveis de produção
