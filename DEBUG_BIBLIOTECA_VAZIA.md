# 🔍 Debug - Biblioteca e Uploads Não Carregam

## Sintomas
- ✅ Login funciona (Clerk OK)
- ❌ Biblioteca não carrega (vazia?)
- ❌ Upload não aparece

## Causas Prováveis

### 1. DATABASE_URL Incorreta
A Vercel não consegue conectar no Supabase

### 2. Prisma Client não foi gerado
O build da Vercel pode não ter gerado o Prisma Client

### 3. NEXT_PUBLIC_API_URL errada
O frontend não consegue chamar as APIs

### 4. Tabelas não existem no banco
As migrations não rodaram

---

## 🔧 SOLUÇÃO RÁPIDA

### Passo 1: Verificar Logs da Vercel

1. Vá em: https://vercel.com/seu-projeto
2. **Deployments** (menu superior)
3. Clique no último deploy
4. **Function Logs** (aba superior)
5. **Procure por erros**

Erros comuns:
```
PrismaClientInitializationError
Database connection error
ECONNREFUSED
Invalid connection string
```

### Passo 2: Testar API Diretamente

Abra no navegador:
```
https://lyricspro.vercel.app/api/transcriptions
```

O que deve aparecer:
- ✅ Sucesso: `{"items":[],"total":0,"limit":10,"offset":0}`
- ❌ Erro: Página de erro ou JSON com erro

Se der erro = Problema no backend (DATABASE_URL ou Prisma)

### Passo 3: Verificar DATABASE_URL

A DATABASE_URL na Vercel está CORRETA?

**IMPORTANTE:** Tem que ser exatamente:
```
postgresql://postgres.fsbrvpavtluirczbapzz:Russo.4815162342R@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

**COM AS ASPAS** ou **SEM AS ASPAS**?
- Na Vercel: **SEM ASPAS!**
- No .env.local: Com aspas

### Passo 4: Verificar se Migrations Rodaram

Execute no terminal local:

```bash
cd frontend
npx prisma migrate deploy --preview-feature
```

Se der erro de conexão = DATABASE_URL errada

---

## 🚨 Erro Mais Comum: Prisma no Build

A Vercel precisa gerar o Prisma Client no build.

Verifique se existe `postinstall` no package.json:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Se NÃO TIVER, adicione e faça redeploy!

---

## 📋 Checklist Completo

```
□ 1. Abrir https://lyricspro.vercel.app/api/transcriptions
     - Ver se retorna JSON ou erro
     
□ 2. Se der erro: Ver logs na Vercel
     - Deployments > Último > Function Logs
     - Procurar "Prisma" ou "Database"
     
□ 3. Verificar DATABASE_URL na Vercel
     - Settings > Environment Variables
     - Conferir se está SEM aspas
     
□ 4. Verificar se tem postinstall no package.json
     - Se não tiver, adicionar
     
□ 5. Fazer redeploy após mudanças
     - Deployments > Redeploy
```

---

## 💡 Teste Rápido

Cole isso no console do navegador (F12):

```javascript
fetch('/api/transcriptions')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Resultado esperado:**
```json
{"items":[],"total":0,"limit":10,"offset":0}
```

**Se der erro:**
- `Failed to fetch` = CORS ou URL errada
- `500 Internal Server Error` = Problema no backend
- `404 Not Found` = API Route não existe (problema no deploy)

