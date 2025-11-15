# 🔐 Clerk Authentication - Configuração para Produção

## 📋 O que é o Clerk?

O Clerk gerencia toda a **autenticação** do LyricsPro:
- Login/Signup
- Gerenciamento de usuários
- Sessões
- Perfis

Atualmente está configurado para **Development** (`pk_test_`, `sk_test_`). Para produção, precisamos criar um novo Application.

---

## 🚀 Passo a Passo

### 1. Acessar Dashboard do Clerk

1. Acesse: [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Faça login
3. Você verá seu projeto atual (Development)

### 2. Opção A: Usar o Mesmo Application (Mais Simples)

**⚠️ AVISO**: Esta opção usa o mesmo Application para dev e produção, diferenciando apenas pelos domínios.

1. Vá em **Domains** (menu lateral)
2. Você verá: `localhost:3000` (já configurado)
3. Clique em **Add Domain**
4. Adicione a URL da Vercel: `https://seu-projeto.vercel.app`
   - **Importante**: Substitua `seu-projeto` pela URL real que a Vercel gerar
5. Clique em **Add**

**Pronto!** Você pode usar as mesmas keys:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cG93ZXJmdWwtaWJleC0zMy5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_J0nb3vj7DKu8sGj2LAa84ZuCsIu4Q0vukqzL1ydEdg
```

### 2. Opção B: Criar Application Separado (Recomendado para Produção)

**✅ RECOMENDADO**: Esta opção separa completamente dev de produção.

#### Passo 1: Criar Novo Application

1. No canto superior esquerdo, clique no nome do projeto
2. Clique em **Create Application**
3. Preencha:
   - **Name**: `LyricsPro Production`
   - **Type**: `Web Application`
4. Clique em **Create Application**

#### Passo 2: Configurar Domínio

1. Após criar, vá em **Domains**
2. Remova `localhost` (não precisa em produção)
3. Adicione: `https://seu-projeto.vercel.app`
   - **Importante**: Substitua `seu-projeto` pela URL real que a Vercel gerar
4. Clique em **Add**

#### Passo 3: Copiar Production Keys

1. Vá em **API Keys** (menu lateral)
2. Você verá:
   - **Publishable Key**: `pk_live_XXXXXXXX`
   - **Secret Key**: `sk_live_XXXXXXXX` (clique em "Show" para revelar)
3. Copie ambas as keys

**⚠️ IMPORTANTE**:
- `pk_test_` / `sk_test_` = Development
- `pk_live_` / `sk_live_` = Production
- **NUNCA** use keys de test em produção!

#### Passo 4: Adicionar na Vercel

1. Vá em [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. **Settings** > **Environment Variables**
4. Adicione:

```
Nome: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Valor: pk_live_XXXXXXXX (a key que você copiou)
Ambiente: Production, Preview

Nome: CLERK_SECRET_KEY
Valor: sk_live_XXXXXXXX (a key que você copiou)
Ambiente: Production, Preview
```

---

## 🔧 Configurações Importantes

### 1. Sign-up Methods

Configure quais métodos de cadastro permitir:

1. **User & Authentication** > **Email, Phone, Username**
2. Ative:
   - ✅ Email address (obrigatório)
   - ✅ Username (opcional)
   - ⬜ Phone number (opcional)

### 2. Social Login (Opcional)

Adicionar login com Google, GitHub, etc:

1. **User & Authentication** > **Social Connections**
2. Ative os que quiser:
   - ✅ Google (recomendado)
   - ✅ GitHub
   - ⬜ Facebook
   - ⬜ Twitter/X

Para cada um, você precisa configurar OAuth no respectivo provedor.

### 3. Session Management

1. **Sessions** > **Settings**
2. Configure:
   - **Session lifetime**: `7 days` (padrão)
   - **Idle timeout**: `30 minutes`
   - **Multi-session**: ✅ Ativado (permite login em múltiplos dispositivos)

### 4. Email Templates (Opcional)

Personalize emails de boas-vindas, recuperação de senha, etc:

1. **Customization** > **Emails**
2. Edite os templates:
   - Welcome email
   - Password reset
   - Email verification

---

## 🎨 Customização Visual

### 1. Logo e Cores

1. **Customization** > **Theme**
2. Configure:
   - **Logo**: Upload do logo do LyricsPro
   - **Primary Color**: `#8B5CF6` (roxo brand)
   - **Background**: `#0F0A1F` (dark)
   - **Button Color**: `#8B5CF6`

### 2. Domínio Customizado (Opcional)

Por padrão, Clerk usa `accounts.clerk.dev`. Você pode usar seu próprio domínio:

1. **Domains** > **Custom Domain**
2. Adicione: `auth.seudominio.com`
3. Configure DNS conforme instruções

---

## 🔗 Redirects e Callbacks

### URLs Importantes

Após deploy na Vercel, configure:

```bash
# Homepage após login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/upload

# Homepage após signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/upload

# Homepage após logout
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/
```

Adicione essas variáveis na Vercel também.

### Allowed Redirect URLs

No Clerk Dashboard:

1. **Paths** > **Redirects**
2. Adicione:
   - `https://seu-projeto.vercel.app/`
   - `https://seu-projeto.vercel.app/upload`
   - `https://seu-projeto.vercel.app/library`

---

## 🆘 Problemas Comuns

### "Clerk: Invalid publishable key"
- **Causa**: Key errada ou não configurada
- **Solução**: Verifique se usou `pk_live_` para produção

### "Redirect URL não permitido"
- **Causa**: URL não está na whitelist
- **Solução**: Adicione a URL em **Paths** > **Redirects**

### Usuário não consegue fazer login
- **Causa**: Domínio não configurado
- **Solução**: Verifique em **Domains** se a URL da Vercel está lá

### Email de verificação não chega
- **Causa**: Email em spam ou domínio bloqueado
- **Solução**:
  1. Verificar pasta de spam
  2. Configurar SPF/DKIM (opção avançada)
  3. Usar domínio customizado de email

---

## 🔐 Segurança

### Rate Limiting

Clerk automaticamente protege contra:
- ✅ Brute force (tentativas de senha)
- ✅ Account enumeration
- ✅ CSRF attacks

### Session Security

Configure em **Sessions** > **Security**:
- ✅ **Secure cookies**: Ativado
- ✅ **HttpOnly cookies**: Ativado
- ✅ **SameSite**: `Lax`

### Two-Factor Authentication (2FA)

Habilite 2FA opcional:

1. **User & Authentication** > **Multi-factor**
2. Ative:
   - ✅ SMS (requer Twilio)
   - ✅ Authenticator app (TOTP)
   - ✅ Backup codes

---

## 💰 Custos

### Clerk Free Tier:
- ✅ 10,000 usuários ativos/mês grátis
- ✅ Autenticação social ilimitada
- ✅ Email/senha ilimitado
- ✅ Suporte por email

### Clerk Pro ($25/mês):
- ✅ 100,000 usuários ativos/mês
- ✅ Domínio customizado
- ✅ Remoção de branding Clerk
- ✅ Webhooks avançados
- ✅ Suporte prioritário

Para começar, o **Free Tier é suficiente**. Upgrade quando necessário.

---

## 🔔 Webhooks (Opcional mas Recomendado)

Para sincronizar usuários do Clerk com seu banco de dados:

### 1. Configurar Webhook

1. **Webhooks** > **Add Endpoint**
2. **Endpoint URL**: `https://seu-projeto.vercel.app/api/webhooks/clerk`
3. **Events**: Selecione:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
4. Copie o **Signing Secret**

### 2. Criar Endpoint na API

**Você já tem isso implementado?** Verifique se existe `frontend/app/api/webhooks/clerk/route.ts`

Se não, vou criar depois se precisar.

### 3. Adicionar Secret na Vercel

```bash
Nome: CLERK_WEBHOOK_SECRET
Valor: whsec_XXXXXXXX (o signing secret)
Ambiente: Production, Preview
```

---

## ✅ Checklist Final

### Opção A (Mesmo Application):
- [ ] Adicionar domínio da Vercel em **Domains**
- [ ] Usar mesmas keys de desenvolvimento
- [ ] Testar login após deploy

### Opção B (Application Separado):
- [ ] Criar novo Application "Production"
- [ ] Configurar domínio da Vercel
- [ ] Copiar keys de produção (`pk_live_`, `sk_live_`)
- [ ] Adicionar keys na Vercel
- [ ] Configurar redirect URLs
- [ ] Customizar tema (opcional)
- [ ] Configurar webhooks (opcional)
- [ ] Testar login após deploy

---

## 📚 Documentação Oficial

- [Clerk Docs](https://clerk.com/docs)
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Production Checklist](https://clerk.com/docs/deployments/production-checklist)
