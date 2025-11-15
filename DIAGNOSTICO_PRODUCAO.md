# 🔍 Diagnóstico - Upload Não Carrega na Vercel

## Causa Provável: Keys de Desenvolvimento

Você está usando keys de **desenvolvimento** em **produção**. Isso causa problemas!

## ✅ SOLUÇÃO RÁPIDA (Temporária)

### Opção A: Adicionar Domínio Vercel no Clerk (Mais Rápido)

1. Acesse: https://dashboard.clerk.com/
2. Entre no seu Application atual
3. Vá em **Domains** (menu lateral)
4. Clique em **Add Domain**
5. Cole a URL da sua Vercel: `https://lyricspro-XXXX.vercel.app`
6. Salve

**Pronto!** As keys `pk_test_` e `sk_test_` vão funcionar com a URL da Vercel também.

**NÃO PRECISA** trocar as variáveis na Vercel!

## 🔍 Como Verificar se é o Clerk

Abra o console do navegador (F12) na página de upload e veja se tem erro tipo:

```
Clerk: This domain is not authorized
Clerk: Invalid publishable key
```

Se tiver esse erro = É o Clerk!

## ⚙️ Verificar Variáveis na Vercel

Confirme se você adicionou TODAS as variáveis:

### Variáveis Críticas para Upload Funcionar:

```
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✅ CLERK_SECRET_KEY
✅ NEXT_PUBLIC_API_URL (com URL da Vercel!)
✅ NEXT_PUBLIC_APP_URL (com URL da Vercel!)
✅ DATABASE_URL
✅ OPENAI_API_KEY
✅ R2_ACCOUNT_ID
✅ R2_ACCESS_KEY_ID
✅ R2_SECRET_ACCESS_KEY
✅ R2_BUCKET_NAME
✅ TRIGGER_SECRET_KEY
```

## 🚨 Erros Comuns

### 1. URL ainda está como localhost
```
NEXT_PUBLIC_API_URL=http://localhost:3000  ❌ ERRADO!
NEXT_PUBLIC_API_URL=https://lyricspro-xxxx.vercel.app  ✅ CORRETO!
```

### 2. Esqueceu de adicionar variável
- Vá na Vercel: Settings > Environment Variables
- Confira se TODAS as 15 variáveis estão lá

### 3. Adicionou variável mas não fez redeploy
- Após adicionar variáveis, precisa fazer **redeploy**
- Vercel > Deployments > Último deploy > 3 pontinhos > Redeploy

## 📋 Checklist de Debug

Faça nesta ordem:

```
□ 1. Abrir console do navegador (F12)
□ 2. Ir na página de upload
□ 3. Ver se tem erro de Clerk
□ 4. Se tiver: Adicionar domínio Vercel no Clerk Dashboard
□ 5. Verificar se NEXT_PUBLIC_API_URL está correto
□ 6. Verificar se todas as 15 variáveis foram adicionadas
□ 7. Fazer redeploy na Vercel
□ 8. Testar novamente
```

## 🔧 Logs da Vercel

Para ver o que está acontecendo:

1. Vercel Dashboard > Seu projeto
2. **Deployments** (menu superior)
3. Clique no deploy mais recente
4. **Function Logs** ou **Build Logs**
5. Procure por erros

Erros comuns:
- `Missing publishableKey` = Falta variável Clerk
- `Unauthorized` = Domínio não autorizado no Clerk
- `500 Internal Server Error` = Alguma variável faltando

## ⚡ Solução Imediata

**TESTE ISSO PRIMEIRO:**

1. Vá em: https://dashboard.clerk.com/
2. **Domains** > **Add Domain**
3. Cole: `https://sua-url.vercel.app`
4. Salve
5. Teste o upload novamente

Isso deve resolver 90% dos casos!

---

## 📞 Se Ainda Não Funcionar

Me avise e vou precisar que você envie:
1. URL da sua aplicação na Vercel
2. Screenshot do erro no console (F12)
3. Screenshot das variáveis configuradas na Vercel
