# Campos Necessários para Cadastro de Obras e Fonogramas - ABRAMUS e UBC

## 📋 Visão Geral

Este documento lista todos os campos necessários para automatizar o cadastro de obras musicais e fonogramas nas principais associações de direitos autorais do Brasil (ABRAMUS e UBC).

---

## 🎵 PARTE 1: CADASTRO DE OBRAS MUSICAIS

### Informações Básicas da Obra

**Campos Obrigatórios:**
- **Título da Obra** (nome da música)
- **Data de Criação** (quando a música foi composta)
- **Categoria/Gênero Musical** (ex: Pop, Rock, Sertanejo, Funk, etc.)
- **Idioma da Obra** (Português, Inglês, Espanhol, etc.)
- **Nacionalidade** (Se é obra nacional ou estrangeira)
- **Tipo de Obra**:
  - INSTRUMENTAL + TEXTO (música cantada)
  - INSTRUMENTAL SOMENTE (música instrumental)

**Campos Opcionais:**
- **Subtítulo** (se houver)
- **Outros Títulos** (nomes alternativos, versões)
- **Tipo de Obra Especial**:
  - Original
  - Versão Modificada (derivada de outra obra)
  - Pot-pourri (medley de várias obras)

---

### Autores/Compositores (Corpo da Obra)

**Para CADA Autor/Compositor:**
- **Nome Completo**
- **CPF**
- **Função/Papel**:
  - Compositor
  - Letrista
  - Autor (letra + melodia)
  - Adaptador
  - Versionista
- **Percentual de Participação** (deve somar 100% no total)
- **Associação** (se filiado: ABRAMUS, UBC, SICAM, etc.)

**Observação:** Se houver parcerias, apenas um autor faz o cadastro incluindo todos os parceiros com seus percentuais.

---

### Documentos de Anexo (Pelo menos um)

**Opções:**
- **Áudio** (MP3, WAV - pode ser demo, não precisa ser produzido)
- **Letra** (arquivo PDF com letra completa)
- **Partitura/Cifra** (se disponível)
- **Contrato** (usado principalmente por editoras musicais)

---

## 🎧 PARTE 2: CADASTRO DE FONOGRAMAS (ISRC)

### Informações Básicas do Fonograma

**Campos Obrigatórios:**
- **Título do Fonograma** (normalmente igual ao título da obra)
- **Obra Musical Associada** (vinculação com a obra já cadastrada)
- **Duração** (minutos e segundos - ex: 03:45)
- **Data da Gravação**
- **Data de Lançamento**
- **Data de Emissão do ISRC**
- **Tipo de Mídia**:
  - Digital
  - CD
  - DVD
  - Vinil
  - Outro

**Campos Opcionais:**
- **Código ISRC** (se já gerado por agregadora - ex: Spotify, Deezer via CDBaby, DistroKid)
- **Agregadora/Distribuidor** (se aplicável - CDBaby, DistroKid, ONErpm, etc.)

---

### Participantes do Fonograma

#### 1. Produtor Fonográfico (Obrigatório)
- **Nome Completo ou Razão Social**
- **CPF ou CNPJ**
- **Associação** (ABRAMUS, UBC, etc.)
- **Percentual** (41,70% dos direitos conexos)

#### 2. Intérpretes/Cantores (Obrigatório)
**Para CADA Intérprete:**
- **Nome Completo/Nome Artístico**
- **CPF**
- **Associação** (se filiado)
- **Percentual Individual** (divide 41,70% entre todos os intérpretes)

#### 3. Músicos Executantes (Obrigatório)
**Para CADA Músico:**
- **Nome Completo**
- **CPF**
- **Instrumento Tocado** (Guitarra, Baixo, Bateria, Teclado, etc.)
- **Associação** (se filiado)
- **Percentual Individual** (divide 16,66% entre todos os músicos)

**Observação:** Se a pessoa fez tudo sozinha no computador, ela pode ser Produtor Fonográfico + Intérprete + Músico ao mesmo tempo.

---

### Estrutura do Código ISRC

O ISRC é gerado automaticamente pela associação ou agregadora com 12 caracteres:

**Formato:** BR-XXX-YY-ZZZZZ

- **BR/BX/BC/BK**: Código do país (Brasil)
- **XXX**: Código do Produtor Fonográfico (3 dígitos)
- **YY**: Ano de geração (2 dígitos)
- **ZZZZZ**: Número sequencial (até 99999)

**Exemplo:** BR-A49-20-00001

---

## 📊 CAMPOS PARA TRANSCRIÇÃO DE ÁUDIO → CADASTRO AUTOMÁTICO

### O Que Você Pode Extrair Automaticamente da Transcrição

✅ **Extração Direta:**
1. **Letra da Música** (transcrição completa do áudio)
2. **Duração do Áudio** (em minutos e segundos)
3. **Data de Criação do Arquivo** (como referência para data de gravação)

⚠️ **Precisa de Input do Usuário:**
1. Título da Obra
2. Dados dos Autores/Compositores (nomes, CPFs, percentuais)
3. Dados dos Participantes da Gravação (intérpretes, músicos, instrumentos)
4. Gênero Musical
5. Tipo de Obra (com letra ou instrumental)
6. Se é obra original ou versão modificada

---

## 🚀 FLUXO SUGERIDO PARA SEU APP

### Etapa 1: Upload de Áudio
- Usuário faz upload do arquivo de áudio
- Sistema transcreve automaticamente a letra
- Sistema extrai duração e data

### Etapa 2: Formulário Inteligente
- **Seção 1: Dados da Obra**
  - Título (input)
  - Gênero (dropdown com opções)
  - Idioma (detectado ou selecionado)
  - Letra (pré-preenchida da transcrição - editável)

- **Seção 2: Autores/Compositores**
  - Adicionar autores (nome, CPF, função, %)
  - Botão "+Adicionar Parceiro" para múltiplos autores
  - Validação: soma dos % = 100%

- **Seção 3: Fonograma (se aplicável)**
  - Checkbox "Deseja cadastrar também o fonograma?"
  - Produtor Fonográfico (pode auto-preencher com dados do usuário)
  - Intérpretes (lista dinâmica)
  - Músicos (lista dinâmica com campo de instrumento)

### Etapa 3: Documentos Gerados
- **PDF da Obra** (pronto para upload na ABRAMUS/UBC)
- **PDF do Fonograma** (com todas as informações do ISRC)
- **Arquivo de Áudio** (para anexar no cadastro)

### Etapa 4: Integração com Associações
- **Opção Manual:** Gerar PDFs prontos para o usuário fazer upload
- **Opção Futura (API):** Integração direta com portais ABRAMUS/UBC (se disponibilizarem API)

---

## 💡 DIFERENCIAIS COMPETITIVOS DO SEU APP

### Problema que Resolve:
✅ Artistas perdem dinheiro porque não cadastram obras corretamente  
✅ Processo manual é demorado e burocrático  
✅ Muitos artistas não sabem a diferença entre obra e fonograma  
✅ Perda de direitos autorais por falta de cadastro  

### Solução:
1. **Transcrição Automática** - elimina digitação manual da letra
2. **Formulários Inteligentes** - guia o usuário pelo processo
3. **Validação de Dados** - garante que tudo está correto antes do envio
4. **Geração de PDFs Prontos** - documentos formatados para as associações
5. **Educação** - explica a diferença entre obra e fonograma
6. **Checklist Completo** - garante que nada foi esquecido

---

## 📝 TEMPLATES DE FORMULÁRIOS

### Template 1: Declaração de Repertório (Obra)

```
DECLARAÇÃO DE REPERTÓRIO - CADASTRO DE OBRA

Título da Obra: _________________________________
Subtítulo: _____________________________________
Data de Criação: _______________________________
Gênero Musical: ________________________________
Idioma: ________________________________________
Tipo: ( ) Instrumental + Texto  ( ) Instrumental Somente

AUTORES/COMPOSITORES:
1. Nome: ______________________ CPF: ________________
   Função: __________ Percentual: _____%
   
2. Nome: ______________________ CPF: ________________
   Função: __________ Percentual: _____%

LETRA DA MÚSICA:
[Letra completa transcrita]

______________________________
Assinatura do Declarante
```

### Template 2: Cadastro de Fonograma (ISRC)

```
CADASTRO DE FONOGRAMA - GERAÇÃO DE ISRC

Título do Fonograma: ___________________________
Obra Associada: ________________________________
Duração: ___:___
Data da Gravação: ______________________________
Data de Lançamento: ____________________________
Tipo de Mídia: _________________________________

PRODUTOR FONOGRÁFICO:
Nome/Razão Social: _____________________________
CPF/CNPJ: ______________________________________
Percentual: 41,70%

INTÉRPRETES:
1. Nome: ______________________ CPF: ________________
   Percentual: _____%
   
2. Nome: ______________________ CPF: ________________
   Percentual: _____%

MÚSICOS EXECUTANTES:
1. Nome: ________________ Instrumento: ____________
   CPF: ________________ Percentual: _____%
   
2. Nome: ________________ Instrumento: ____________
   CPF: ________________ Percentual: _____%

______________________________
Assinatura do Produtor Fonográfico
```

---

## 🎯 PRÓXIMOS PASSOS PARA IMPLEMENTAÇÃO

### MVP (Produto Mínimo Viável):
1. Upload de áudio + transcrição
2. Formulário web com os campos listados acima
3. Geração de PDF pronto para impressão/assinatura
4. Download do pacote completo (PDFs + áudio)

### Versão 2.0:
1. Salvamento de perfis de usuários (dados recorrentes)
2. Integração com APIs das associações (se existirem)
3. Dashboard de obras cadastradas
4. Lembretes de renovação/atualização
5. Cálculo automático de percentuais
6. Validação de CPF em tempo real

### Versão 3.0:
1. App mobile (iOS/Android)
2. Reconhecimento de acordes/melodia (IA)
3. Sugestão automática de gênero musical
4. Integração com distribuidoras digitais
5. Sistema de coautoria colaborativa
6. Blockchain para prova de autoria

---

## 📞 RECURSOS ÚTEIS

**ABRAMUS:**
- Site: https://www.abramus.org.br
- Portal do Associado: https://portal.abramus.org.br
- Tel: (11) 3825-5249

**UBC:**
- Site: https://www.ubc.org.br
- Portal do Associado: https://login.ubc.org.br
- Manuais: https://www.ubc.org.br/Publicacoes/Manuais

**ECAD:**
- Site: https://www.ecad.org.br
- Consulta de Obras: https://www.ecad.org.br/consulta

---

## ⚖️ IMPORTANTE - ASPECTOS LEGAIS

1. **Registro ≠ Cadastro**
   - Registro (Biblioteca Nacional): prova de autoria, direito moral
   - Cadastro (ABRAMUS/UBC/ECAD): direito patrimonial, arrecadação

2. **Não é obrigatório** ter registro na Biblioteca Nacional para cadastrar na associação

3. **Filiação é gratuita** nas associações (ABRAMUS, UBC)

4. **Cada gravação diferente** da mesma música precisa de um ISRC diferente

5. **O cadastro é único** mesmo que a música seja gravada por outros artistas

6. **Direitos Autorais** (Obra): pagos aos compositores/autores
7. **Direitos Conexos** (Fonograma): pagos aos intérpretes, músicos e produtores

---

## 💰 MODELO DE NEGÓCIO SUGERIDO

### Preços Sugeridos:
- **Plano Free**: 3 transcrições/mês + formulário básico
- **Plano Solo**: R$ 29,90/mês - transcrições ilimitadas + PDFs automáticos
- **Plano Profissional**: R$ 79,90/mês - tudo do Solo + gestão de catálogo + relatórios
- **Plano Gravadora**: R$ 299,90/mês - múltiplos usuários + API + suporte prioritário

### Diferenciais de Preço:
- Cobrança por transcrição avulsa: R$ 9,90
- Pacote de 10 transcrições: R$ 79,90
- Serviço de consultoria para cadastro: R$ 150,00/hora

---

**Última atualização:** Novembro 2025  
**Versão do documento:** 1.0
