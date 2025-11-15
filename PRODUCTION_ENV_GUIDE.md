# 🚀 Guia de Configuração de Variáveis de Ambiente - Produção Vercel

## 📋 Resumo

Este guia lista **todas as variáveis de ambiente** que você precisa configurar na Vercel para deploy em produção.

## 🔧 Como Configurar na Vercel

1. Acesse: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione cada variável abaixo
5. Selecione os ambientes: **Production**, **Preview**, **Development**

---

## ✅ Variáveis Prontas (Podem usar os valores atuais)

Essas variáveis podem ser copiadas diretamente do `.env.local`:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://SUA_DATABASE_URL

# OpenAI API
OPENAI_API_KEY=sk-proj-XXXXX

# Cloudflare R2 Storage
R2_ACCOUNT_ID=SEU_ACCOUNT_ID
R2_ACCESS_KEY_ID=SEU_ACCESS_KEY
R2_SECRET_ACCESS_KEY=SEU_SECRET_KEY
R2_BUCKET_NAME=seu-bucket
R2_PUBLIC_URL=

# App Config
NEXT_PUBLIC_APP_NAME=LyricsPro
NEXT_PUBLIC_MAX_FILE_SIZE_MB=500
NEXT_PUBLIC_MAX_DURATION_MINUTES=120
```

---

## ⚠️ Variáveis que PRECISAM ser Atualizadas

### 1. URLs da Aplicação

Após o primeiro deploy, a Vercel vai gerar uma URL tipo `https://seu-projeto.vercel.app`

```bash
NEXT_PUBLIC_API_URL=https://seu-projeto.vercel.app
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
```

**📝 IMPORTANTE**: Substitua `seu-projeto` pela URL real que a Vercel gerar.

### 2. Trigger.dev (Background Jobs)

**⚠️ AÇÃO NECESSÁRIA**: Criar ambiente de produção no Trigger.dev

**Passos:**
1. Acesse: [https://cloud.trigger.dev/](https://cloud.trigger.dev/)
2. Entre no seu projeto
3. Vá em **Environments**
4. Clique em **Create Environment**
5. Nome: `Production`
6. Copie a **Production API Key** (começa com `tr_prod_`)
7. Configure na Vercel:

```bash
TRIGGER_SECRET_KEY=tr_prod_XXXXXXXXXXXXXXXX
```

**❌ NÃO USE** `tr_dev_` em produção! Deve ser `tr_prod_`

### 3. Clerk Authentication

**⚠️ AÇÃO NECESSÁRIA**: O Clerk será configurado depois, mas reserve essas variáveis:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_XXXX
CLERK_SECRET_KEY=sk_live_XXXX
```

**Passos (faremos depois):**
1. Acesse: [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Crie novo Application para produção
3. Configure domínio: `https://seu-projeto.vercel.app`
4. Copie as keys de produção

---

## 📦 Lista Completa para Copiar/Colar na Vercel

### Variáveis PRONTAS (copie agora):

| Nome da Variável | Valor | Ambiente |
|-----------------|-------|----------|
| `DATABASE_URL` | `postgresql://SUA_DATABASE_URL` | Production, Preview |
| `OPENAI_API_KEY` | `sk-proj-XXXXX` | Production, Preview |
| `R2_ACCOUNT_ID` | `SEU_ACCOUNT_ID` | Production, Preview |
| `R2_ACCESS_KEY_ID` | `SEU_ACCESS_KEY` | Production, Preview |
| `R2_SECRET_ACCESS_KEY` | `SEU_SECRET_KEY` | Production, Preview |
| `R2_BUCKET_NAME` | `seu-bucket` | Production, Preview |
| `R2_PUBLIC_URL` | *(deixar vazio)* | Production, Preview |
| `NEXT_PUBLIC_APP_NAME` | `LyricsPro` | Production, Preview |
| `NEXT_PUBLIC_MAX_FILE_SIZE_MB` | `500` | Production, Preview |
| `NEXT_PUBLIC_MAX_DURATION_MINUTES` | `120` | Production, Preview |

### Variáveis para COMPLETAR depois do deploy:

| Nome da Variável | Valor Temporário | Ação Necessária |
|-----------------|------------------|-----------------|
| `NEXT_PUBLIC_API_URL` | `https://SUBSTITUIR.vercel.app` | Após deploy, substituir pela URL real |
| `NEXT_PUBLIC_APP_URL` | `https://SUBSTITUIR.vercel.app` | Após deploy, substituir pela URL real |
| `TRIGGER_SECRET_KEY` | `CRIAR_NO_TRIGGER_DEV` | Criar ambiente Production no Trigger.dev |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `CRIAR_NO_CLERK` | Criar Application de produção no Clerk |
| `CLERK_SECRET_KEY` | `CRIAR_NO_CLERK` | Criar Application de produção no Clerk |

---

## 🎯 Próximos Passos

1. ✅ **Agora**: Configurar variáveis prontas na Vercel
2. ⏭️ **Próximo**: Configurar Trigger.dev Production
3. ⏭️ **Depois**: Fazer primeiro deploy
4. ⏭️ **Por último**: Configurar Clerk com URL da Vercel

---

## 💡 Dicas

- **URLs Dinâmicas**: A Vercel injeta automaticamente algumas variáveis como `VERCEL_URL`, mas é melhor definir explicitamente para evitar problemas
- **Secrets Sensíveis**: Todas as variáveis na Vercel são criptografadas e seguras
- **Preview Deployments**: Configure as mesmas variáveis para Preview para testar branches antes de mergear
- **Monitoramento**: Configure alertas no OpenAI Dashboard para monitorar uso da API

---

## 🆘 Problemas Comuns

### Build falha com "Missing environment variable"
- Verifique se TODAS as variáveis foram adicionadas na Vercel
- Certifique-se de selecionar o ambiente correto (Production/Preview)

### Trigger.dev não funciona
- Confirme que está usando `tr_prod_` e não `tr_dev_`
- Verifique se o ambiente Production foi criado no Trigger.dev

### Clerk retorna erro 401
- Certifique-se de usar keys de **Production** (`pk_live_` e `sk_live_`)
- Verifique se o domínio da Vercel foi adicionado no Clerk Dashboard
