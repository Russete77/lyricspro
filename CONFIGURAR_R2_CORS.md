# 🔧 Configurar CORS no Cloudflare R2

## Problema
```
Access to XMLHttpRequest has been blocked by CORS policy
```

O R2 precisa permitir uploads diretos do browser.

## Solução - 2 Minutos

### 1. Acesse o Cloudflare Dashboard

1. Vá em: https://dash.cloudflare.com/
2. Entre na sua conta
3. No menu lateral: **R2**
4. Clique no bucket: **lyricspro-bucket**

### 2. Configurar CORS

1. Na página do bucket, clique na aba **Settings** (Configurações)
2. Role até encontrar **CORS Policy**
3. Clique em **Edit CORS Policy** ou **Add CORS Policy**
4. Cole esta configuração:

```json
[
  {
    "AllowedOrigins": [
      "https://lyricspro.vercel.app",
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

5. Clique em **Save**

### 3. Testar

1. Aguarde ~30 segundos
2. Vá em: https://lyricspro.vercel.app
3. Tente fazer upload novamente
4. **Deve funcionar!**

---

## ⚠️ IMPORTANTE

Quando você adicionar um domínio personalizado (ex: lyricspro.com), adicione ele também em `AllowedOrigins`:

```json
"AllowedOrigins": [
  "https://lyricspro.vercel.app",
  "https://lyricspro.com",
  "http://localhost:3000"
]
```

---

## 🔍 Como Saber se Funcionou?

Após configurar CORS, o console do navegador (F12) NÃO deve mais mostrar o erro:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

Se continuar dando erro, verifique:
- ✅ A configuração CORS foi salva?
- ✅ Esperou 30 segundos após salvar?
- ✅ A URL em `AllowedOrigins` está correta?
- ✅ Deu F5 na página antes de testar?
