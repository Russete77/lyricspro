# 🔐 Corrigir Credenciais do R2 (Erro 401 Unauthorized)

## Problema
```
PUT ... net::ERR_FAILED 401 (Unauthorized)
```

As API Keys do R2 não têm permissões para fazer upload.

---

## Solução - Recriar API Token com Permissões Corretas

### 1. Acesse Cloudflare Dashboard

1. Vá em: https://dash.cloudflare.com/
2. Menu lateral: **R2**
3. Clique em **Manage R2 API Tokens** (canto superior direito)

### 2. Criar Novo Token

1. Clique em **Create API Token**
2. Configure assim:

**Token Name:**
```
lyricspro-upload-token
```

**Permissions:**
- ✅ **Object Read & Write** (IMPORTANTE!)

**Apply to buckets:**
- ✅ Selecione: **lyricspro-bucket**

  OU

- ✅ Marque: **Apply to all buckets in this account**

3. Clique em **Create API Token**

### 3. Copiar as Novas Credenciais

Você vai ver algo assim:

```
Access Key ID: abc123def456...
Secret Access Key: xyz789uvw012...
```

**⚠️ IMPORTANTE:** Copie AGORA! Não vai aparecer de novo!

### 4. Atualizar na Vercel

1. Vá em: https://vercel.com/seu-usuario/lyricspro
2. **Settings** > **Environment Variables**
3. Encontre estas variáveis e EDITE:

**R2_ACCESS_KEY_ID**
```
Cole o novo Access Key ID aqui
```

**R2_SECRET_ACCESS_KEY**
```
Cole o novo Secret Access Key aqui
```

4. **IMPORTANTE:** Marque os 3 ambientes:
   - [x] Production
   - [x] Preview
   - [x] Development

5. Clique em **Save**

### 5. Fazer Redeploy

1. Na Vercel, vá em **Deployments**
2. Clique no último deploy
3. Clique nos 3 pontinhos (...)
4. Clique em **Redeploy**
5. Aguarde ~2 minutos

### 6. Atualizar no Trigger.dev (Também!)

1. Vá em: https://trigger.dev
2. Entre no projeto **lyricspro**
3. **Environment Variables** > **Production**
4. Encontre e EDITE:

**R2_ACCESS_KEY_ID** → Cole o novo
**R2_SECRET_ACCESS_KEY** → Cole o novo (marcar como Secret!)

5. **Save**

### 7. Atualizar Localmente

Edite seu `.env.local`:

```env
R2_ACCESS_KEY_ID="NOVO_ACCESS_KEY_ID_AQUI"
R2_SECRET_ACCESS_KEY="NOVO_SECRET_ACCESS_KEY_AQUI"
```

---

## 🧪 Como Testar

1. Aguarde o redeploy da Vercel terminar
2. Vá em: https://lyricspro.vercel.app
3. Tente fazer upload
4. **Não deve mais dar erro 401!**

---

## 📋 Checklist

```
□ 1. Criar novo API Token no R2 com "Object Read & Write"
□ 2. Copiar Access Key ID e Secret Access Key
□ 3. Atualizar R2_ACCESS_KEY_ID na Vercel
□ 4. Atualizar R2_SECRET_ACCESS_KEY na Vercel
□ 5. Atualizar R2_ACCESS_KEY_ID no Trigger.dev
□ 6. Atualizar R2_SECRET_ACCESS_KEY no Trigger.dev
□ 7. Fazer redeploy na Vercel
□ 8. Testar upload novamente
```

---

## ⚠️ Erro Comum

Se você criou o token SEM permissão "Object Read & Write", ele só vai conseguir LISTAR arquivos, não fazer UPLOAD.

**Solução:** Delete o token antigo e crie um novo com as permissões corretas.
