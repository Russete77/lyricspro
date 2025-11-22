# 🎉 Como Usar o Executável do LyricsPro

## 📦 Executável Gerado

**Local:** `frontend/out/LyricsPro-win32-x64/lyricspro.exe`

**Tamanho:** ~202 MB (executável) + 1.3 GB (pasta completa com dependências)

## 🚀 Como Executar

### Opção 1: Executar Diretamente (RECOMENDADO)

1. Vá até a pasta: `frontend/out/LyricsPro-win32-x64/`
2. Dê duplo clique em `lyricspro.exe`
3. O aplicativo irá abrir!

### Opção 2: Executar via Terminal

```bash
cd frontend/out/LyricsPro-win32-x64/
./lyricspro.exe
```

## ⚙️ Configuração Inicial

### 1. Obter API Key da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Crie uma conta se não tiver
3. Clique em **"Create new secret key"**
4. Copie a chave (começa com `sk-...`)
5. Guarde em local seguro!

### 2. Configurar no App

1. Abra o LyricsPro
2. Vá em **Configurações** (menu lateral)
3. Cole sua API key da OpenAI
4. Clique em **Salvar**

✅ Pronto! Agora você pode usar offline!

## 📁 Onde os Dados Ficam Armazenados

### No Windows:
- **Banco de dados:** `C:\Users\{seu-usuario}\AppData\Roaming\LyricsPro\lyricspro.db`
- **Arquivos de áudio:** `C:\Users\{seu-usuario}\AppData\Roaming\LyricsPro\storage\uploads\`
- **Configurações:** `C:\Users\{seu-usuario}\AppData\Roaming\LyricsPro\settings.json`

### Estrutura:
```
C:\Users\{usuario}\AppData\Roaming\LyricsPro\
├── lyricspro.db              # Banco SQLite
├── settings.json             # Suas configurações (API key)
└── storage/
    └── uploads/
        └── user_xxx/         # Seus áudios
            ├── 1234567890.mp3
            └── 1234567891.mp3
```

## 🎵 Como Usar

1. **Upload de Áudio:**
   - Clique em "Upload" (menu lateral)
   - Selecione um arquivo de áudio/vídeo
   - Escolha idioma (pt, en, es, etc)
   - Clique em "Enviar"

2. **Processamento:**
   - O arquivo será enviado para OpenAI
   - Aguarde o processamento (barra de progresso)
   - Custo: ~$0.006 por minuto de áudio

3. **Ver Resultado:**
   - Vá em "Biblioteca" (menu lateral)
   - Clique na transcrição processada
   - Veja o texto, segmentos, etc
   - Download em TXT, SRT, VTT ou JSON

## 💰 Custos

| Duração | Custo Aproximado |
|---------|------------------|
| 1 minuto | $0.006 (~R$ 0.03) |
| 10 minutos | $0.06 (~R$ 0.30) |
| 1 hora | $0.36 (~R$ 1.80) |

**Nota:** Valores aproximados. Consulte a tabela de preços da OpenAI para valores atualizados.

## 🔒 Privacidade

- ✅ Seus arquivos ficam no seu computador
- ✅ API key fica no seu computador
- ✅ Banco de dados é local (SQLite)
- ⚠️ Áudios são enviados para OpenAI apenas para transcrição
- ❌ Nada é enviado para nossos servidores

## 🐛 Problemas Comuns

### "API key not configured"
**Solução:** Vá em Configurações e adicione sua API key da OpenAI

### "Erro ao processar transcrição"
**Possíveis causas:**
- API key inválida ou sem créditos
- Arquivo de áudio corrompido
- Sem conexão com internet

**Solução:** Verifique sua API key e créditos em https://platform.openai.com/usage

### "Banco de dados corrompido"
**Solução:**
1. Feche o app
2. Delete o arquivo `lyricspro.db`
3. Abra o app novamente (vai criar novo banco)

### App não abre
**Solução:**
1. Verifique se tem antivírus bloqueando
2. Execute como administrador
3. Verifique logs no terminal

## 📦 Distribuir o App

Para distribuir o app para outras pessoas:

### Opção 1: Pasta Completa (RECOMENDADO)
1. Compacte a pasta `LyricsPro-win32-x64` inteira
2. Envie o arquivo ZIP
3. A pessoa descompacta e executa `lyricspro.exe`

### Opção 2: Criar Instalador (Avançado)
```bash
cd frontend
npm run make  # Gera instalador Squirrel
```

Isso vai criar um instalador em `frontend/out/make/squirrel.windows/x64/`

## 🔄 Atualizações Futuras

Recursos planejados:
- [ ] Auto-update (atualização automática)
- [ ] Criptografia da API key
- [ ] Diarização local (separação de speakers sem API)
- [ ] Suporte a GPU local (processar sem internet)
- [ ] Temas personalizáveis
- [ ] Exportação em mais formatos

## 📞 Suporte

Problemas ou dúvidas? Abra uma issue no GitHub!

## ✅ Checklist de Primeira Execução

- [ ] Baixei/tenho a pasta `LyricsPro-win32-x64`
- [ ] Executei `lyricspro.exe`
- [ ] Criei conta na OpenAI
- [ ] Obtive minha API key
- [ ] Configurei a API key no app
- [ ] Testei com um áudio pequeno
- [ ] Funcionou! 🎉

---

**Versão:** 1.0.0
**Última atualização:** 16/11/2024
