# Guia de Deploy em Produção (Vercel)

## Problemas Identificados

1. ❌ Trigger.dev não está deployado
2. ❌ Variáveis de ambiente faltando
3. ❌ Banco de dados (precisa ser PostgreSQL, não SQLite)

## Passo 1: Configurar Banco de Dados PostgreSQL

### Opção A: Neon (Recomendado - Grátis)
1. Acesse: https://neon.tech
2. Crie uma conta
3. Crie um projeto
4. Copie a `DATABASE_URL` (Connection String)

### Opção B: Supabase
1. Acesse: https://supabase.com
2. Crie projeto
3. Vá em Database → Connection String
4. Copie a URL do PostgreSQL

## Passo 2: Atualizar Prisma Schema

Seu `schema.prisma` atual usa SQLite. Mude para PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"  // ← Era "sqlite"
  url      = env("DATABASE_URL")
}
```

## Passo 3: Migrar Banco de Dados

```bash
cd frontend

# Gerar migração para PostgreSQL
npx prisma migrate dev --name init_postgresql

# Aplicar em produção (depois de configurar DATABASE_URL na Vercel)
npx prisma migrate deploy
```

## Passo 4: Configurar Variáveis na Vercel

### 4.1 - Acessar Vercel Dashboard
1. Vá em: https://vercel.com/dashboard
2. Selecione seu projeto
3. Settings → Environment Variables

### 4.2 - Adicionar Variáveis Obrigatórias

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@host/database

# OpenAI
OPENAI_API_KEY=sk-...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=lyricspro
R2_PUBLIC_URL=https://...

# Trigger.dev (CRÍTICO!)
TRIGGER_SECRET_KEY=tr_prod_...

# Clerk (se estiver usando)
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

## Passo 5: Deploy do Trigger.dev

### 5.1 - Login no Trigger.dev
```bash
npx trigger.dev@latest login
```

### 5.2 - Deploy dos Jobs
```bash
cd frontend
npx trigger.dev@latest deploy
```

Isso vai:
- ✅ Fazer build dos jobs
- ✅ Upload para Trigger.dev Cloud
- ✅ Configurar workers em produção

### 5.3 - Obter Secret Key de Produção
1. Acesse: https://cloud.trigger.dev
2. Vá no seu projeto
3. Environments → Production
4. Copie a `TRIGGER_SECRET_KEY` (começa com `tr_prod_`)
5. Adicione na Vercel (Passo 4.2)

## Passo 6: Verificar Configuração CORS do R2

O R2 precisa permitir uploads do navegador:

### 6.1 - Acessar Cloudflare Dashboard
1. Vá em R2 → Seu bucket
2. Settings → CORS Policy

### 6.2 - Adicionar CORS Policy
```json
[
  {
    "AllowedOrigins": [
      "https://seu-dominio.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

## Passo 7: Deploy na Vercel

```bash
git add .
git commit -m "feat: configure production environment"
git push origin main
```

A Vercel vai fazer deploy automático!

## Passo 8: Testar em Produção

1. Acesse: https://seu-app.vercel.app
2. Faça upload de uma música
3. Verifique os logs:
   - Vercel: https://vercel.com/dashboard → Seu Projeto → Logs
   - Trigger.dev: https://cloud.trigger.dev → Runs

## Troubleshooting

### Erro: "Database connection failed"
- ✅ Verifique se `DATABASE_URL` está configurada na Vercel
- ✅ Execute `npx prisma migrate deploy` em produção

### Erro: "Trigger.dev job failed"
- ✅ Verifique se fez `npx trigger.dev deploy`
- ✅ Confirme que `TRIGGER_SECRET_KEY` de produção está na Vercel
- ✅ Veja logs em https://cloud.trigger.dev

### Erro: "R2 CORS blocked"
- ✅ Configure CORS policy no R2 (Passo 6)
- ✅ Adicione seu domínio Vercel no AllowedOrigins

### Upload fica pendente
- ✅ Verifique se Trigger.dev workers estão rodando
- ✅ Veja logs do job no Trigger.dev dashboard
- ✅ Confirme que todas as env vars estão configuradas

## Checklist Final

- [ ] PostgreSQL configurado (Neon ou Supabase)
- [ ] Prisma schema migrado para PostgreSQL
- [ ] Todas variáveis de ambiente na Vercel
- [ ] Trigger.dev deployado (`npx trigger.dev deploy`)
- [ ] CORS configurado no R2
- [ ] Deploy feito na Vercel
- [ ] Teste de upload funcionando

## Links Úteis

- Trigger.dev Docs: https://trigger.dev/docs
- Vercel Docs: https://vercel.com/docs
- Neon Database: https://neon.tech
- Cloudflare R2: https://developers.cloudflare.com/r2/
