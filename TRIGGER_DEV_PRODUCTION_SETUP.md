# 🎯 Trigger.dev - Configuração para Produção

## 📋 O que é o Trigger.dev?

O Trigger.dev gerencia os **background jobs** do LyricsPro:
- Processamento de transcrições (pode levar 5-30 minutos)
- Upload para R2
- Pós-processamento de texto
- Geração de formatos (SRT, VTT, TXT)

Atualmente está configurado para **Development** (`tr_dev_`). Para produção, precisamos criar um ambiente separado.

---

## 🚀 Passo a Passo

### 1. Acessar Dashboard do Trigger.dev

1. Acesse: [https://cloud.trigger.dev/](https://cloud.trigger.dev/)
2. Faça login
3. Selecione seu projeto (deve ter um projeto já criado)

### 2. Criar Ambiente de Produção

1. No menu lateral, clique em **Environments** ou **Settings**
2. Você verá o ambiente atual: **Development**
3. Clique em **Create Environment** ou **New Environment**
4. Preencha:
   - **Name**: `Production`
   - **Type**: `Production`
5. Clique em **Create**

### 3. Copiar Production API Key

1. Após criar, vá na aba **API Keys**
2. Copie a **Secret Key** do ambiente **Production**
3. Ela deve começar com: `tr_prod_XXXXXXXXXXXXXXXX`

**⚠️ IMPORTANTE**:
- `tr_dev_` = Development
- `tr_prod_` = Production
- **NUNCA** use `tr_dev_` em produção!

### 4. Adicionar na Vercel

1. Vá em [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. **Settings** > **Environment Variables**
4. Adicione:

```
Nome: TRIGGER_SECRET_KEY
Valor: tr_prod_XXXXXXXXXXXXXXXX (a key que você copiou)
Ambiente: Production, Preview
```

### 5. Deploy do Trigger.dev

Após fazer deploy na Vercel, você precisa fazer deploy dos **jobs** do Trigger.dev:

```bash
cd frontend
npx trigger.dev@latest deploy
```

**O que esse comando faz:**
- Faz upload do código dos jobs (`trigger/transcription.ts`)
- Registra os jobs no ambiente de produção
- Conecta com a Vercel

**Você verá no terminal:**
```
✓ Deploying to Trigger.dev Production environment
✓ Uploading code...
✓ Jobs deployed:
  - transcribe-audio
✓ Deploy complete!
```

---

## 🔍 Verificar se Está Funcionando

### No Dashboard do Trigger.dev:

1. Vá em **Jobs** ou **Runs**
2. Selecione ambiente: **Production**
3. Você deve ver o job: `transcribe-audio`
4. Status: ✅ Active

### Testando em Produção:

1. Após deploy na Vercel, faça upload de um áudio
2. Volte no Trigger.dev Dashboard
3. Em **Runs**, você deve ver o job rodando em tempo real
4. Clique no run para ver logs detalhados:
   - Upload para R2
   - Chunks de áudio
   - Transcrição do OpenAI
   - Pós-processamento
   - Salvamento no DB

---

## 📊 Monitoramento

### Logs em Tempo Real

No Dashboard do Trigger.dev:
- **Runs**: Histórico de todas as execuções
- **Logs**: Output detalhado de cada job
- **Errors**: Erros que aconteceram

### Alertas

Configure notificações:
1. **Settings** > **Notifications**
2. Ative:
   - ✅ Job failed
   - ✅ Job timed out
   - ✅ Long-running jobs (> 30min)

---

## ⚙️ Configurações Importantes

### Timeout

Por padrão, jobs têm timeout de 1 hora. Para áudios longos, configure no código:

```typescript
// frontend/trigger/transcription.ts
export const transcribeAudio = task({
  id: "transcribe-audio",
  // Adicione se necessário:
  run: async (payload, { ctx }) => {
    // ...
  },
  // Timeout de 2 horas para áudios muito longos
  machine: {
    preset: "large-1x", // Mais recursos
  },
});
```

### Retry em Caso de Falha

O Trigger.dev automaticamente faz retry 3x se o job falhar. Você pode configurar:

```typescript
export const transcribeAudio = task({
  id: "transcribe-audio",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
    randomize: true,
  },
  run: async (payload, { ctx }) => {
    // ...
  },
});
```

---

## 🆘 Problemas Comuns

### Job não aparece no Dashboard
- **Causa**: Deploy não foi feito
- **Solução**: Rode `npx trigger.dev@latest deploy`

### Job falha com "Unauthorized"
- **Causa**: API key errada
- **Solução**: Verifique se usou `tr_prod_` na Vercel

### Job demora muito (timeout)
- **Causa**: Áudio muito longo ou OpenAI lento
- **Solução**:
  1. Aumente timeout no código
  2. Use máquina maior (`preset: "large-1x"`)

### Job falha com "Out of memory"
- **Causa**: Áudio muito grande (> 500MB)
- **Solução**: Use máquina maior ou reduza max file size

---

## 💰 Custos

### Trigger.dev Free Tier:
- ✅ 1000 runs/mês grátis
- ✅ Logs por 7 dias
- ✅ 100MB storage

### Trigger.dev Pro ($20/mês):
- ✅ 10,000 runs/mês
- ✅ Logs por 30 dias
- ✅ 1GB storage
- ✅ Webhooks
- ✅ Suporte prioritário

Para começar, o **Free Tier é suficiente**. Upgrade quando necessário.

---

## ✅ Checklist Final

- [ ] Criar ambiente Production no Trigger.dev
- [ ] Copiar Production API Key (`tr_prod_`)
- [ ] Adicionar `TRIGGER_SECRET_KEY` na Vercel
- [ ] Fazer deploy na Vercel
- [ ] Rodar `npx trigger.dev@latest deploy`
- [ ] Testar upload de áudio em produção
- [ ] Verificar job rodando no Dashboard
- [ ] Configurar notificações de erro

---

## 📚 Documentação Oficial

- [Trigger.dev Docs](https://trigger.dev/docs)
- [Deploy Guide](https://trigger.dev/docs/documentation/guides/deployment)
- [Environments](https://trigger.dev/docs/documentation/concepts/environments)
