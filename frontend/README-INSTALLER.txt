================================================================================
                          LYRICSPRO - GUIA DE INSTALACAO
================================================================================

Bem-vindo ao LyricsPro!

Este aplicativo permite transcrever musicas e audios usando inteligencia
artificial da OpenAI (Whisper). Tudo funciona localmente no seu computador,
mantendo suas transcricoes privadas e seguras.


================================================================================
                            1. INSTALACAO DO APP
================================================================================

IMPORTANTE: O LyricsPro ja vem com tudo incluido!
Nao precisa instalar Node.js, SQLite ou qualquer outra dependencia.
Tudo esta empacotado no executavel!

1. Extraia o arquivo "LyricsPro-win32-x64-1.0.0.zip" em uma pasta de sua escolha

2. Entre na pasta extraida "LyricsPro-win32-x64"

3. Execute o arquivo "lyricspro.exe"

4. Pronto! O aplicativo vai abrir em uma janela


================================================================================
                    2. COMO OBTER SUA API KEY DA OPENAI
================================================================================

Antes de transcrever, voce precisa de uma API Key da OpenAI. Siga os passos:


PASSO 1: CRIAR CONTA NA OPENAI
-------------------------------

1. Acesse: https://platform.openai.com/signup

2. Crie uma conta usando:
   - Email e senha, OU
   - Conta Google, OU
   - Conta Microsoft

3. Confirme seu email se solicitado


PASSO 2: ADICIONAR CREDITOS (PAGAMENTO)
----------------------------------------

A API da OpenAI e paga, mas MUITO barata para transcricoes:
- Custo: $0.006 por minuto de audio (menos de 1 centavo por minuto!)
- Exemplo: 1 hora de audio = ~$0.36 (aproximadamente R$ 1,80)

Como adicionar creditos:

1. Faca login em: https://platform.openai.com

2. Clique no seu nome (canto superior direito)

3. Clique em "Billing" (Faturamento)

4. Clique em "Add payment method" (Adicionar metodo de pagamento)

5. Adicione um cartao de credito internacional

6. Adicione creditos:
   - Va em "Add to credit balance"
   - Valor minimo: $5.00 (aproximadamente R$ 25)
   - Isso da para transcrever ~833 minutos (~14 horas de audio!)

IMPORTANTE: A OpenAI so cobra pelo que voce usar. Se adicionar $5 e usar
apenas $2, os $3 restantes ficam na sua conta para uso futuro.


PASSO 3: CRIAR SUA API KEY
---------------------------

1. Ainda logado em https://platform.openai.com

2. No menu lateral, clique em "API keys" ou acesse:
   https://platform.openai.com/api-keys

3. Clique no botao "Create new secret key" (Criar nova chave secreta)

4. De um nome para sua chave (exemplo: "LyricsPro")

5. Clique em "Create secret key"

6. IMPORTANTE: Copie a chave que aparece (comeca com "sk-...")

   ATENCAO: Essa chave so aparece UMA VEZ!
   Copie e guarde em local seguro.
   Se perder, precisara criar uma nova chave.

7. Cole a chave em um bloco de notas temporariamente


================================================================================
                        3. CONFIGURAR O LYRICSPRO
================================================================================

1. Abra o aplicativo LyricsPro (lyricspro.exe)

2. No topo da tela, clique em "Configuracoes"
   (Ou "Config" se a janela estiver pequena)

3. Cole sua API Key da OpenAI no campo "API Key da OpenAI"

4. Clique em "Salvar Configuracoes"

5. Pronto! Agora voce pode transcrever audios


================================================================================
                        4. COMO USAR O LYRICSPRO
================================================================================

FAZER UPLOAD DE AUDIO:
----------------------

1. Clique em "Upload" no menu

2. Clique em "Escolher arquivo" ou arraste um arquivo de audio

3. Formatos aceitos: MP3, WAV, M4A, FLAC, OGG, etc.

4. Aguarde o upload completar

5. A transcricao comecara automaticamente


VER SUAS TRANSCRICOES:
----------------------

1. Clique em "Biblioteca" no menu

2. Veja todas as suas musicas ja transcritas

3. Clique em uma musica para ver a letra completa


ACOMPANHAR PROGRESSO:
---------------------

1. Clique em "Processando" no menu

2. Veja as transcricoes que estao sendo processadas no momento


================================================================================
                            5. SOLUCAO DE PROBLEMAS
================================================================================

ERRO: "API Key invalida"
------------------------
- Verifique se copiou a chave completa (comeca com "sk-")
- Verifique se tem creditos na sua conta OpenAI
- Tente criar uma nova API Key


ERRO: "Insuficiente creditos"
-----------------------------
- Sua conta OpenAI esta sem creditos
- Adicione mais creditos em: https://platform.openai.com/account/billing


APP NAO ABRE OU FECHA IMEDIATAMENTE:
-----------------------------------------------
- Verifique se extraiu TODOS os arquivos do ZIP
- Execute como Administrador (clique direito > Executar como administrador)
- Verifique se tem Windows 10/11 64-bit
- Feche outros programas que possam estar usando a porta 3000
- Tente reiniciar o computador


TRANSCRICAO MUITO LENTA:
-------------------------
- Normal! Audios grandes podem levar alguns minutos
- Depende da velocidade da sua internet
- Depende do tamanho do arquivo


================================================================================
                          6. INFORMACOES IMPORTANTES
================================================================================

PRIVACIDADE:
------------
- Suas transcricoes ficam salvas LOCALMENTE no seu computador
- Nao enviamos seus dados para nenhum servidor
- Apenas o audio e enviado para a OpenAI para transcricao
- Suas API Keys ficam salvas apenas no seu computador


SEGURANCA:
----------
- NUNCA compartilhe sua API Key com ninguem
- Se sua chave vazar, delete ela em: https://platform.openai.com/api-keys
- Crie uma nova chave se suspeitar de vazamento


CUSTOS:
-------
- O LyricsPro e 100% GRATUITO
- Voce paga apenas pelo uso da API da OpenAI
- Custo: $0.006 por minuto de audio
- Exemplo de custos:
  * 10 musicas de 3 min cada = 30 min = $0.18 (~R$ 0,90)
  * 1 album de 1 hora = 60 min = $0.36 (~R$ 1,80)
  * 100 musicas de 4 min = 400 min = $2.40 (~R$ 12,00)


ONDE FICAM SALVOS MEUS DADOS:
------------------------------
- Transcricoes: C:\Users\SEU_USUARIO\AppData\Roaming\LyricsPro\
- Configuracoes: C:\Users\SEU_USUARIO\AppData\Roaming\LyricsPro\settings.json
- Banco de dados: C:\Users\SEU_USUARIO\AppData\Roaming\LyricsPro\prisma\dev.db


================================================================================
                              7. SUPORTE
================================================================================

Problemas? Duvidas?

- Verifique se seguiu TODOS os passos deste guia
- Verifique se tem creditos na OpenAI
- Verifique se sua API Key esta correta
- Tente fechar e abrir o app novamente


================================================================================
                         8. VERIFICAR GASTOS NA OPENAI
================================================================================

Para ver quanto ja gastou:

1. Acesse: https://platform.openai.com/usage

2. Veja seu uso nos ultimos meses

3. Veja graficos de uso por dia/mes

4. Configure alertas de gastos em "Billing > Limits"


DICA: Configure um limite de gastos mensal para nao ter surpresas!


================================================================================
                           APROVEITE O LYRICSPRO!
================================================================================

Versao: 1.0.0
Data: Novembro 2024

Obrigado por usar o LyricsPro!
