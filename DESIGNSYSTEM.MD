# 🎵 Design System - LyricsPro

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Identidade da Marca](#identidade-da-marca)
3. [Fundamentos](#fundamentos)
4. [Componentes](#componentes)
5. [Padrões de Interface](#padrões-de-interface)
6. [Stack Técnica](#stack-técnica)
7. [Guia de Implementação](#guia-de-implementação)

---

## Visão Geral

Este Design System foi criado especificamente para o **LyricsPro** - uma plataforma SaaS focada em transcrição automática de letras de música com detecção inteligente de estrutura musical (VERSO, REFRÃO, PONTE).

### 🎯 Proposta de Valor
Transformar áudios de música em letras formatadas profissionalmente, com estrutura musical identificada automaticamente via IA (GPT-4o + Whisper).

### 🎨 Conceito Visual
- **Estilo**: Moderno, minimalista, profissional mas musical
- **Abordagem**: Glassmorphism com gradientes vibrantes
- **Foco**: Facilitar leitura e edição de letras musicais
- **Mobile-First**: Otimizado para músicos em movimento

### Inspirações
- **Genius**: Interface limpa para visualização de letras
- **Spotify**: Design moderno e musical
- **Linear**: Minimalismo e performance
- **Notion**: Editabilidade e organização

---

## Identidade da Marca

### 🎵 Logo & Iconografia

**Conceito**: Ícone de fone de ouvido + nota musical formando a letra "L"

```
Variações:
- Logo completo: Ícone + "LyricsPro" wordmark
- Logo símbolo: Apenas ícone (para favicons, apps)
- Logo horizontal: Para headers/navbars
```

**Cores do Logo**:
- Primária: Gradiente roxo (#7435FD → #C381E7)
- Alternativa: Branco/neutro para fundos escuros
- Monocromático: Para usos limitados

### ✨ Tagline

**Principal**: "Suas letras, profissionalmente transcritas"

**Alternativas**:
- "Transforme áudio em letras perfeitas"
- "IA que entende música"
- "Da gravação à letra em minutos"

### 🎯 Tom de Voz (Brand Voice)

**Características**:
- **Profissional mas acessível**: Não usar jargões técnicos desnecessários
- **Encorajador**: Músicos são criativos, não técnicos
- **Direto e claro**: Evitar ambiguidades
- **Apaixonado por música**: Demonstrar que entendemos o processo criativo

**Exemplos de copywriting**:
- ✅ "Grave sua música, nós cuidamos da transcrição"
- ✅ "Detectamos automaticamente refrão, versos e pontes"
- ❌ "Processamento avançado de NLP com modelos Transformer"
- ❌ "Utilize nossa API RESTful para integração"

### 🎨 Personalidade da Marca

- **Inovador**: Usamos IA de ponta (GPT-4o + Whisper)
- **Confiável**: 100% fiel ao áudio original
- **Rápido**: Processamento em minutos, não horas
- **Acessível**: Planos para todos os bolsos

---

## Fundamentos

### 🎨 Paleta de Cores

#### Primary Colors (Música & Criatividade)
```css
--brand-dark: #0A0731      /* Backgrounds escuros, header */
--brand-primary: #7435FD   /* Ações principais, CTAs, botões de upload */
--brand-light: #C381E7     /* Acentos, hover states, highlights */
--brand-accent: #FF6B6B    /* Ações destrutivas, alertas, badges de erro */

/* Cores específicas de estrutura musical */
--music-verso: #34C759     /* Indicador de VERSO */
--music-refrao: #FF9500    /* Indicador de REFRÃO */
--music-ponte: #007AFF     /* Indicador de PONTE */
--music-intro: #B4B4BB     /* Indicador de INTRO/OUTRO */
```

#### Neutral Colors
```css
--neutral-50: #F5F5F7      /* Backgrounds claros */
--neutral-100: #E8E8ED
--neutral-200: #D1D1D6
--neutral-300: #B4B4BB
--neutral-400: #8E8E93     /* Texto secundário */
--neutral-500: #636366
--neutral-600: #48484A
--neutral-700: #3A3A3C
--neutral-800: #2C2C2E     /* Cards dark mode */
--neutral-900: #1C1C1E     /* Texto principal dark */
```

#### Status Colors
```css
--success: #34C759
--warning: #FF9500
--error: #FF3B30
--info: #007AFF
```

#### Gradients
```css
/* Gradient Principal - Usado em backgrounds hero */
background: linear-gradient(135deg, #0A0731 0%, #7435FD 100%);

/* Gradient Secundário - Usado em botões e elementos interativos */
background: linear-gradient(135deg, #7435FD 0%, #C381E7 100%);

/* Gradient Radial - Usado em elementos decorativos */
background: radial-gradient(circle, #7435FD 0%, #0A0731 100%);
```

#### Glassmorphism
```css
background: rgba(116, 53, 253, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

---

### ✍️ Tipografia

**Font Family**: `'Manrope', 'Inter', -apple-system, sans-serif`

#### Escala Tipográfica
| Nível | Tamanho | Line Height | Letter Spacing | Peso | Uso |
|-------|---------|-------------|----------------|------|-----|
| Heading 1 | 32px | 40px | -0.5px | 700 (Bold) | Títulos principais, landing page |
| Heading 2 | 24px | 32px | -0.3px | 700 (Bold) | Subtítulos, seções |
| Heading 3 | 20px | 28px | -0.2px | 600 (SemiBold) | Nomes de músicas |
| Body | 16px | 24px | 0px | 400 (Regular) | UI geral, descrições |
| **Lyrics** | **18px** | **32px** | **0px** | **400** | **Letras de música (legibilidade++)** |
| Caption | 14px | 20px | 0.1px | 500 (Medium) | Metadados, timestamps |
| Small | 12px | 16px | 0.2px | 400 (Regular) | Hints, labels pequenas |

**Nota sobre Lyrics**: Line-height maior (32px) para facilitar leitura e permitir espaço para highlights de estrutura musical.

---

### 📐 Espaçamento

Sistema baseado em múltiplos de 4px:

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
```

---

### 🔲 Border Radius

```css
--radius-xs: 4px    /* Elementos pequenos */
--radius-sm: 8px    /* Tags, badges */
--radius-md: 12px   /* Inputs, botões */
--radius-lg: 16px   /* Cards */
--radius-xl: 20px   /* Modals, sheets */
--radius-2xl: 24px  /* Hero sections */
--radius-full: 9999px /* Círculos perfeitos */
```

---

### 💫 Sombras

```css
/* Soft - Cards sutis */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* Medium - Cards interativos */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

/* Strong - Modals, overlays */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);

/* Glow - Botões primários hover */
box-shadow: 0 0 20px rgba(116, 53, 253, 0.4);

/* Glow Strong - Elementos ativos */
box-shadow: 0 0 40px rgba(116, 53, 253, 0.6);
```

---

## Componentes

### 🔘 Button

#### Variantes
- **Primary**: Ações principais (gravar, salvar)
- **Secondary**: Ações secundárias
- **Outline**: Ações alternativas
- **Ghost**: Ações terciárias, menu items
- **Gradient**: CTAs principais
- **Glass**: Botões sobre backgrounds escuros
- **Error**: Ações destrutivas (deletar)
- **Success**: Confirmações positivas

#### Tamanhos
- **sm**: 36px altura (h-9)
- **md**: 44px altura (h-11) - padrão
- **lg**: 56px altura (h-14)
- **xl**: 64px altura (h-16)
- **icon**: 44x44px (h-11 w-11)

#### Exemplo de Uso
```tsx
<Button variant="primary" size="lg" fullWidth>
  Iniciar Gravação
</Button>

<Button variant="ghost" size="icon">
  <IconTrash />
</Button>
```

---

### 🎵 MusicUploader

Componente especializado para upload de arquivos de música/áudio.

#### Features
- Drag & drop de arquivos
- Preview do nome do arquivo e tamanho
- Validação de formato (mp3, wav, m4a, mp4, etc.)
- Indicador de progresso de upload
- Suporte a múltiplos formatos de áudio e vídeo
- Animação de hover com gradient glow

#### Estados
- **Empty**: "Arraste um arquivo ou clique para fazer upload"
- **Hover**: Glow effect roxo, borda destacada
- **Uploading**: Progress bar com percentual
- **Success**: Checkmark verde, nome do arquivo
- **Error**: Mensagem de erro com retry button

#### Exemplo de Uso
```tsx
<MusicUploader
  onFileSelect={(file) => handleUpload(file)}
  maxSizeMB={100}
  acceptedFormats={['mp3', 'wav', 'm4a', 'mp4']}
/>
```

---

### 📝 LyricViewer

Componente principal para visualização de letras com estrutura musical destacada.

#### Features
- Exibição de letras com line-height otimizado (32px)
- Badges coloridos para estrutura musical (VERSO, REFRÃO, PONTE)
- Timestamps clicáveis (se disponíveis)
- Modo de edição inline
- Exportação (TXT, PDF, JSON)
- Scroll automático durante reprodução de áudio

#### Estrutura
```tsx
<LyricViewer
  lyrics={transcriptionData.text}
  chapters={transcriptionData.chapters}
  segments={transcriptionData.segments}
  editable={true}
  onEdit={(newLyrics) => saveChanges(newLyrics)}
/>
```

#### Exemplo Visual
```
[VERSO 1] ← Badge verde
Eu vou porque eu sou vagabundo ou nato
E a morena me jogou no chão
...

[REFRÃO] ← Badge laranja
A fim que eu fui buscar
Onde você se esconde
...
```

---

### 🏷️ StructureBadge

Badge para indicar estrutura musical.

#### Variantes
- **verso**: Verde (#34C759) - Versos únicos
- **refrao**: Laranja (#FF9500) - Refrões (partes repetidas)
- **ponte**: Azul (#007AFF) - Pontes/transições
- **intro**: Cinza (#B4B4BB) - Intro/Outro

#### Exemplo de Uso
```tsx
<StructureBadge type="refrao">REFRÃO</StructureBadge>
<StructureBadge type="verso">VERSO 1</StructureBadge>
<StructureBadge type="ponte">PONTE</StructureBadge>
```

---

### 🃏 Card

Container versátil com múltiplas variantes.

#### Variantes
- **default**: Card branco/neutral, sombra suave
- **glass**: Glassmorphism, backdrop blur
- **gradient**: Background gradient primary
- **outline**: Apenas borda, sem background

#### Padding Levels
- **none**: sem padding
- **sm**: 12px
- **md**: 16px (padrão)
- **lg**: 24px
- **xl**: 32px

#### Sub-componentes
- `CardHeader`: Cabeçalho com espaçamento
- `CardTitle`: Título h3 semibold
- `CardDescription`: Texto secundário
- `CardContent`: Conteúdo principal
- `CardFooter`: Rodapé com ações

---

### 🎵 SongCard

Card especializado para exibir músicas transcritas na biblioteca.

#### Features
- Status badge (completed, processing, error)
- Nome da música com line-clamp
- Data de criação e duração
- Preview das primeiras linhas da letra (3 linhas)
- Indicadores de estrutura detectada (ex: "3 versos, 1 refrão")
- Ações hover (visualizar, editar, download, compartilhar, deletar)
- Thumbnail/capa (opcional)
- Progress bar para músicas em processamento

#### Exemplo de Uso
```tsx
<SongCard
  id="a13cc242-47d9-47e9-9f4a-5f23bcf3a737"
  title="Minha Música"
  status="completed"
  duration={307}
  createdAt="2025-01-08"
  preview="Eu vou porque eu sou vagabundo ou nato..."
  chapters={[
    { title: "VERSO 1" },
    { title: "REFRÃO" },
    { title: "PONTE" }
  ]}
  onView={() => navigate(`/song/${id}`)}
  onDelete={() => confirmDelete(id)}
/>
```

---

### ⏳ ProcessingStatus

Componente de feedback para mostrar progresso de transcrição.

#### Features
- Progress bar animada (0-100%)
- Estágios de processamento com ícones
- Tempo estimado restante
- Animações suaves de transição entre estágios
- Indicador de qual estágio está ativo

#### Estágios
1. **Upload** (0-5%): Upload do arquivo
2. **Extração de Áudio** (5-15%): FFmpeg extraindo áudio
3. **Redução de Ruído** (15-25%): Limpeza de áudio
4. **Transcrição** (25-70%): Whisper processando
5. **Pós-processamento** (70-95%): GPT-4o refinando
6. **Finalização** (95-100%): Exportando formatos

#### Exemplo de Uso
```tsx
<ProcessingStatus
  progress={67}
  currentStage="transcription"
  estimatedTimeRemaining={120} // segundos
/>
```

---

### 📱 BottomNav

Navegação inferior mobile com 4 items principais.

#### Características
- Ícones com estados ativo/inativo
- Labels descritivas
- Badge de notificações (ex: músicas em processamento)
- Indicador de aba ativa (gradiente roxo embaixo)
- Safe area para iOS
- Animações suaves de transição

#### Ícones/Abas do LyricsPro
- **Upload** (MusicalNoteIcon): Tela de upload de música
- **Biblioteca** (FolderIcon): Músicas já transcritas
- **Processando** (ClockIcon + Badge): Músicas em processamento
- **Perfil** (UserIcon): Configurações, planos, créditos

---

### 🔤 Input & Textarea

Campos de entrada com suporte a ícones e estados de validação.

#### Features
- Label opcional
- Ícones left/right
- Estados: default, focus, error, disabled
- Helper text e mensagens de erro
- Focus ring com cor da marca
- Suporte a dark mode

---

### 🔔 Toast/Notification

Sistema de notificações toast para feedback de ações.

#### Variantes
- **success**: Fundo verde, ícone de checkmark
- **error**: Fundo vermelho, ícone de X
- **warning**: Fundo laranja, ícone de alerta
- **info**: Fundo azul, ícone de info

#### Posições
- **top-right**: Padrão
- **top-center**: Para mensagens importantes
- **bottom-right**: Para confirmações
- **bottom-center**: Para ações de desfazer

#### Features
- Auto-dismiss em 3-5 segundos
- Botão de fechar manual
- Ação opcional (ex: "Desfazer")
- Empilhamento de múltiplas notificações
- Animação de slide-in/slide-out

#### Exemplo de Uso
```tsx
import { toast } from '@/lib/toast'

// Success
toast.success('Música salva com sucesso!')

// Error
toast.error('Erro ao fazer upload do arquivo')

// Com ação
toast.success('Música deletada', {
  action: {
    label: 'Desfazer',
    onClick: () => restoreSong(id)
  }
})
```

---

### 🗨️ Modal/Dialog

Componente de modal para confirmações e formulários.

#### Variantes
- **default**: Modal padrão com overlay
- **alert**: Para confirmações importantes
- **drawer**: Slide-in lateral (mobile)

#### Tamanhos
- **sm**: 400px largura
- **md**: 600px largura (padrão)
- **lg**: 800px largura
- **xl**: 1000px largura
- **full**: Tela cheia (mobile)

#### Features
- Overlay escuro com blur
- Fechar com ESC ou clique fora
- Animação de fade-in/scale
- Trap de foco (acessibilidade)
- Scroll interno se conteúdo grande
- Botões de ação no footer

#### Sub-componentes
- `ModalHeader`: Título e botão fechar
- `ModalBody`: Conteúdo principal
- `ModalFooter`: Ações (cancelar, confirmar)

#### Exemplo de Uso
```tsx
<Modal open={isOpen} onClose={() => setIsOpen(false)} size="md">
  <ModalHeader>
    <h2>Deletar música?</h2>
  </ModalHeader>
  <ModalBody>
    <p>Esta ação não pode ser desfeita. A música "{songName}" será permanentemente removida.</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancelar
    </Button>
    <Button variant="error" onClick={handleDelete}>
      Deletar
    </Button>
  </ModalFooter>
</Modal>
```

---

### 📋 Dropdown/Select

Componente de seleção com menu dropdown.

#### Features
- Busca/filtro de opções
- Múltipla seleção (opcional)
- Ícones nas opções
- Agrupamento de opções
- Keyboard navigation (↑↓ Enter ESC)
- Loading state
- Empty state

#### Exemplo de Uso
```tsx
<Select
  label="Idioma da transcrição"
  placeholder="Selecione um idioma"
  options={[
    { value: 'pt', label: 'Português', icon: '🇧🇷' },
    { value: 'en', label: 'English', icon: '🇺🇸' },
    { value: 'es', label: 'Español', icon: '🇪🇸' },
  ]}
  value={language}
  onChange={setLanguage}
/>

// Formato de exportação
<Select
  label="Exportar como"
  options={[
    { value: 'txt', label: 'Texto (.txt)' },
    { value: 'srt', label: 'Legendas SRT (.srt)' },
    { value: 'json', label: 'JSON completo (.json)' },
    { value: 'pdf', label: 'PDF formatado (.pdf)' },
  ]}
/>
```

---

### 👤 Avatar

Componente de avatar do usuário.

#### Tamanhos
- **xs**: 24px (h-6)
- **sm**: 32px (h-8)
- **md**: 40px (h-10) - padrão
- **lg**: 48px (h-12)
- **xl**: 64px (h-16)
- **2xl**: 96px (h-24) - página de perfil

#### Variantes
- **image**: Foto do usuário
- **initials**: Iniciais com background gradient
- **icon**: Ícone genérico de usuário

#### Features
- Fallback para iniciais se imagem falhar
- Status indicator (online/offline)
- Badge de notificações
- Borda com gradient (opcional)

#### Exemplo de Uso
```tsx
<Avatar
  src={user.imageUrl}
  alt={user.name}
  size="md"
  fallback={user.initials}
/>

// Com status
<Avatar
  src={user.imageUrl}
  size="lg"
  status="online"
/>
```

---

### 🏷️ Badge

Badge genérico para labels, contadores e status.

#### Variantes
- **default**: Cinza neutro
- **primary**: Roxo da marca
- **success**: Verde
- **warning**: Laranja
- **error**: Vermelho
- **info**: Azul

#### Tamanhos
- **sm**: 20px altura, text-xs
- **md**: 24px altura, text-sm (padrão)
- **lg**: 28px altura, text-base

#### Exemplo de Uso
```tsx
<Badge variant="primary">Novo</Badge>
<Badge variant="success">Concluído</Badge>
<Badge variant="warning">3 processando</Badge>
<Badge variant="error">Falhou</Badge>

// Contador
<div className="relative">
  <IconBell />
  <Badge variant="error" className="absolute -top-1 -right-1">
    5
  </Badge>
</div>
```

---

### 📊 Progress

Barra de progresso genérica.

#### Variantes
- **linear**: Barra horizontal (padrão)
- **circular**: Progresso circular
- **stepped**: Múltiplos passos

#### Features
- Porcentagem visível (opcional)
- Gradiente animado
- Estados: pending, processing, completed, error
- Indeterminate mode (loading contínuo)

#### Exemplo de Uso
```tsx
<Progress value={67} max={100} variant="linear" />

<Progress
  value={uploadProgress}
  max={100}
  showPercentage
  gradient
/>

// Circular
<Progress
  value={75}
  max={100}
  variant="circular"
  size="lg"
/>
```

---

### 💀 Skeleton

Loading placeholders para conteúdo em carregamento.

#### Variantes
- **text**: Linha de texto
- **circle**: Avatar/ícone circular
- **rectangle**: Card/imagem
- **custom**: Forma customizada

#### Features
- Animação de pulse/shimmer
- Mesmas dimensões do conteúdo final
- Cores adaptadas ao dark mode

#### Exemplo de Uso
```tsx
// Loading de SongCard
<Card>
  <Skeleton variant="rectangle" className="h-12 w-12 rounded-lg mb-4" />
  <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
  <Skeleton variant="text" className="h-4 w-1/2 mb-4" />
  <Skeleton variant="text" className="h-4 w-full" />
  <Skeleton variant="text" className="h-4 w-full" />
  <Skeleton variant="text" className="h-4 w-2/3" />
</Card>

// Loading de Avatar
<Skeleton variant="circle" className="h-10 w-10" />
```

---

### 🌵 EmptyState

Componente para estados vazios (sem dados).

#### Variantes
- **library**: Biblioteca vazia
- **search**: Busca sem resultados
- **error**: Erro ao carregar
- **processing**: Nenhum item em processamento

#### Features
- Ilustração ou ícone grande
- Título descritivo
- Mensagem explicativa
- CTA para ação primária
- Link para ajuda (opcional)

#### Exemplo de Uso
```tsx
<EmptyState
  icon={<MusicalNoteIcon className="h-24 w-24" />}
  title="Nenhuma música ainda"
  description="Faça upload da sua primeira música para começar a transcrever"
  action={
    <Button variant="primary" onClick={() => navigate('/upload')}>
      Fazer Upload
    </Button>
  }
/>

// Busca vazia
<EmptyState
  icon={<MagnifyingGlassIcon className="h-20 w-20" />}
  title="Nenhum resultado encontrado"
  description={`Não encontramos músicas com "${searchQuery}"`}
  action={
    <Button variant="ghost" onClick={clearSearch}>
      Limpar busca
    </Button>
  }
/>

// Erro
<EmptyState
  variant="error"
  icon={<ExclamationTriangleIcon className="h-20 w-20" />}
  title="Erro ao carregar músicas"
  description="Não foi possível conectar ao servidor. Tente novamente."
  action={
    <Button variant="primary" onClick={retry}>
      Tentar Novamente
    </Button>
  }
/>
```

---

### 🎛️ Tabs

Navegação por abas.

#### Variantes
- **line**: Linha embaixo da aba ativa (padrão)
- **pill**: Fundo arredondado na aba ativa
- **enclosed**: Bordas como abas de arquivo

#### Features
- Keyboard navigation (← →)
- Indicador de aba ativa
- Scroll horizontal em mobile
- Badge de contador (opcional)

#### Exemplo de Uso
```tsx
<Tabs defaultValue="all">
  <TabsList>
    <TabsTrigger value="all">
      Todas <Badge variant="default">12</Badge>
    </TabsTrigger>
    <TabsTrigger value="completed">
      Concluídas <Badge variant="success">10</Badge>
    </TabsTrigger>
    <TabsTrigger value="processing">
      Processando <Badge variant="warning">2</Badge>
    </TabsTrigger>
  </TabsList>

  <TabsContent value="all">
    {/* Lista de todas as músicas */}
  </TabsContent>

  <TabsContent value="completed">
    {/* Lista de concluídas */}
  </TabsContent>

  <TabsContent value="processing">
    {/* Lista em processamento */}
  </TabsContent>
</Tabs>
```

---

## Padrões de Interface

### 📱 Mobile-First

Todas as interfaces são projetadas mobile-first com breakpoints:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg)
- **Wide Desktop**: > 1280px (xl)
- **Ultra Wide**: > 1536px (2xl)

#### Breakpoints Tailwind

```js
screens: {
  'sm': '640px',   // => @media (min-width: 640px)
  'md': '768px',   // => @media (min-width: 768px)
  'lg': '1024px',  // => @media (min-width: 1024px)
  'xl': '1280px',  // => @media (min-width: 1280px)
  '2xl': '1536px', // => @media (min-width: 1536px)
}
```

#### Padrões de Responsividade

##### Layout de Grid Responsivo

```tsx
// Biblioteca de músicas - Grade adaptável
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {songs.map(song => <SongCard key={song.id} {...song} />)}
</div>

// Mobile: 1 coluna
// Tablet: 2 colunas
// Desktop: 3 colunas
// Wide: 4 colunas
```

##### Navegação Adaptável

```tsx
// Mobile: BottomNav
// Desktop: SideNav
<div>
  {/* Desktop Sidebar (hidden on mobile) */}
  <aside className="hidden lg:block w-64 fixed left-0 top-0 h-screen">
    <SideNav />
  </aside>

  {/* Mobile Bottom Navigation (hidden on desktop) */}
  <nav className="lg:hidden fixed bottom-0 left-0 right-0">
    <BottomNav />
  </nav>

  {/* Content area with responsive padding */}
  <main className="pb-20 lg:pb-0 lg:ml-64">
    {children}
  </main>
</div>
```

##### Tipografia Responsiva

```tsx
// Títulos que diminuem em mobile
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Minhas Músicas
</h1>

// Letras com tamanho adaptável
<div className="text-base sm:text-lg lg:text-lyrics leading-relaxed sm:leading-loose">
  {lyrics}
</div>
```

##### Espaçamento Responsivo

```tsx
// Padding que aumenta em telas maiores
<section className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
  <Container />
</section>

// Gap entre elementos
<div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
  {items}
</div>
```

##### Modais Responsivos

```tsx
// Mobile: Full screen
// Desktop: Centrado com largura fixa
<Modal>
  <div className="
    fixed inset-0 sm:inset-auto
    sm:relative sm:w-full sm:max-w-lg
    bg-white dark:bg-neutral-800
    sm:rounded-xl
  ">
    <ModalContent />
  </div>
</Modal>
```

##### Formulários Responsivos

```tsx
// Mobile: Inputs empilhados
// Desktop: Inputs lado a lado
<form className="space-y-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Input label="Nome" />
    <Input label="Email" />
  </div>

  <div className="flex flex-col sm:flex-row gap-4">
    <Button variant="ghost" className="w-full sm:w-auto">
      Cancelar
    </Button>
    <Button variant="primary" className="w-full sm:w-auto">
      Salvar
    </Button>
  </div>
</form>
```

##### Componente Completo Responsivo (SongCard)

```tsx
<Card className="
  flex flex-col sm:flex-row
  gap-4 sm:gap-6
  p-4 sm:p-6
">
  {/* Thumbnail */}
  <div className="
    w-full sm:w-24
    h-48 sm:h-24
    rounded-lg bg-neutral-200
    flex-shrink-0
  ">
    <Image src={thumbnail} alt={title} className="object-cover" />
  </div>

  {/* Content */}
  <div className="flex-1 min-w-0">
    <h3 className="text-lg sm:text-xl font-semibold truncate">
      {title}
    </h3>
    <p className="text-sm text-neutral-500 line-clamp-2 sm:line-clamp-1">
      {description}
    </p>
  </div>

  {/* Actions */}
  <div className="
    flex flex-row sm:flex-col
    gap-2
    justify-end sm:justify-start
  ">
    <Button size="sm" variant="ghost">Ver</Button>
    <Button size="sm" variant="ghost">Editar</Button>
  </div>
</Card>
```

##### Hide/Show Elementos por Breakpoint

```tsx
// Mostrar apenas em mobile
<div className="block sm:hidden">
  <MobileOnlyContent />
</div>

// Mostrar apenas em tablet+
<div className="hidden sm:block">
  <TabletDesktopContent />
</div>

// Mostrar apenas em desktop
<div className="hidden lg:block">
  <DesktopOnlyContent />
</div>
```

##### Container com Max Width

```tsx
// Container centralizado com largura máxima
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
  <Content />
</div>

// Diferentes max-width por breakpoint
<div className="w-full sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
  <Form />
</div>
```

##### Performance em Mobile

```tsx
// Lazy load de imagens
<Image
  src={thumbnail}
  alt={title}
  loading="lazy"
  className="w-full h-auto"
/>

// Reduzir animações em mobile
<div className="
  transition-all duration-300
  md:hover:scale-105 md:hover:shadow-lg
">
  <Card />
</div>
```

##### Touch-Friendly Targets

```tsx
// Botões maiores em mobile (min 44x44px)
<Button className="
  h-12 sm:h-10
  px-6 sm:px-4
  text-base sm:text-sm
">
  Fazer Upload
</Button>

// Aumentar padding de áreas clicáveis
<button className="
  p-4 sm:p-2
  -m-4 sm:-m-2
">
  <IconClose className="w-6 h-6" />
</button>
```

### 🌙 Dark Mode

Suporte completo a dark mode usando Tailwind `dark:` prefix.

```tsx
<div className="bg-white dark:bg-neutral-900">
  <h1 className="text-neutral-900 dark:text-white">Título</h1>
</div>
```

### ♿ Acessibilidade

- Contraste mínimo WCAG AA (4.5:1 para texto)
- Estados de foco visíveis
- Suporte a leitores de tela
- Touch targets mínimo 44x44px
- Animações respeitam prefers-reduced-motion

### 🎬 Animações

#### Keyframes CSS

```css
/* Float - Elementos decorativos flutuantes */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Wave - Visualizador de áudio (barras) */
@keyframes wave {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

/* Recording Pulse - Indicador de gravação ativo */
@keyframes recording {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

/* Pulse Slow - Glow effects suaves */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Shimmer - Loading skeleton effect */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Slide In Right - Toast notifications */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Slide Out Right - Toast dismiss */
@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Fade In - Modals e overlays */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Scale In - Modal content */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Progress Bar - Animação indeterminada */
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

/* Spin - Loading spinners */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

#### Classes de Animação (Tailwind)

```tsx
// Float
<div className="animate-float">🎵</div>

// Wave (aplicar em múltiplos elementos com delay)
<div className="animate-wave" style={{ animationDelay: '0s' }} />
<div className="animate-wave" style={{ animationDelay: '0.1s' }} />
<div className="animate-wave" style={{ animationDelay: '0.2s' }} />

// Recording Pulse
<div className="animate-recording bg-red-500 rounded-full" />

// Shimmer Skeleton
<div className="animate-shimmer bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200" />

// Toast
<div className="animate-slide-in-right">Toast message</div>

// Modal
<div className="animate-fade-in">Overlay</div>
<div className="animate-scale-in">Modal Content</div>

// Spinner
<div className="animate-spin">⚙️</div>
```

#### Respeitando Preferências de Movimento

```tsx
// Desabilitar animações se o usuário preferir reduced motion
<div className="motion-safe:animate-float motion-reduce:animate-none">
  Conteúdo
</div>
```

---

### 🎨 Configuração Tailwind Completa

#### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          dark: '#0A0731',
          primary: '#7435FD',
          light: '#C381E7',
          accent: '#FF6B6B',
        },
        // Music structure colors
        music: {
          verso: '#34C759',
          refrao: '#FF9500',
          ponte: '#007AFF',
          intro: '#B4B4BB',
        },
        // Neutral palette
        neutral: {
          50: '#F5F5F7',
          100: '#E8E8ED',
          200: '#D1D1D6',
          300: '#B4B4BB',
          400: '#8E8E93',
          500: '#636366',
          600: '#48484A',
          700: '#3A3A3C',
          800: '#2C2C2E',
          900: '#1C1C1E',
        },
        // Status colors
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        info: '#007AFF',
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'lyrics': ['18px', '32px'], // Special size for lyrics
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.16)',
        'glow': '0 0 20px rgba(116, 53, 253, 0.4)',
        'glow-strong': '0 0 40px rgba(116, 53, 253, 0.6)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0A0731 0%, #7435FD 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #7435FD 0%, #C381E7 100%)',
        'gradient-radial': 'radial-gradient(circle, #7435FD 0%, #0A0731 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'recording': 'recording 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        },
        recording: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.1)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

#### globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand colors */
    --brand-dark: #0A0731;
    --brand-primary: #7435FD;
    --brand-light: #C381E7;
    --brand-accent: #FF6B6B;

    /* Music structure colors */
    --music-verso: #34C759;
    --music-refrao: #FF9500;
    --music-ponte: #007AFF;
    --music-intro: #B4B4BB;
  }

  * {
    @apply border-neutral-200 dark:border-neutral-700;
  }

  body {
    @apply bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }
}

@layer components {
  /* Glassmorphism */
  .glass {
    background: rgba(116, 53, 253, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-dark {
    background: rgba(10, 7, 49, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Focus ring customizado */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900;
  }

  /* Scrollbar customizada */
  .scrollbar-custom::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .scrollbar-custom::-webkit-scrollbar-track {
    @apply bg-neutral-100 dark:bg-neutral-800;
  }

  .scrollbar-custom::-webkit-scrollbar-thumb {
    @apply bg-neutral-300 dark:bg-neutral-600 rounded-full;
  }

  .scrollbar-custom::-webkit-scrollbar-thumb:hover {
    @apply bg-neutral-400 dark:bg-neutral-500;
  }
}

@layer utilities {
  /* Text gradient */
  .text-gradient {
    background: linear-gradient(135deg, #7435FD 0%, #C381E7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Line clamp helpers */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Safe area (iOS) */
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }
}
```

---

## Stack Técnica

### Frontend
```json
{
  "framework": "Next.js 14+ (App Router)",
  "styling": "Tailwind CSS 3.4+",
  "ui": "React 18+",
  "auth": "Clerk",
  "pwa": "next-pwa",
  "icons": "Heroicons / Lucide React",
  "animations": "Framer Motion (opcional)"
}
```

### Backend (Já Implementado ✅)
```json
{
  "language": "Python 3.11+",
  "framework": "FastAPI",
  "transcription": "faster-whisper (modelo: medium)",
  "post_processing": "OpenAI GPT-4o",
  "diarization": "pyannote.audio 3.1",
  "audio_processing": "FFmpeg + noisereduce",
  "task_queue": "Celery + Redis",
  "database": "SQLite (dev) / PostgreSQL (prod)",
  "storage": "Local filesystem / MinIO (S3-compatible)",
  "containerization": "Docker + Docker Compose"
}
```

**Pipeline de Processamento Implementado**:
1. **Upload** → FastAPI endpoint (`/api/transcriptions/upload`)
2. **Audio Extraction** → FFmpeg
3. **Noise Reduction** → noisereduce library
4. **Diarization** (opcional) → pyannote speaker-diarization-3.1
5. **Transcription** → faster-whisper medium model
6. **Post-processing** → GPT-4o (correção, estrutura musical, resumo)
7. **Export** → JSON, TXT, SRT, VTT

### Database Schema

**Tabela: transcriptions**
```sql
CREATE TABLE transcriptions (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  original_filename TEXT NOT NULL,

  -- Arquivo
  file_type TEXT NOT NULL, -- 'audio' ou 'video'
  file_size BIGINT NOT NULL, -- bytes
  storage_path TEXT NOT NULL,

  -- Configuração
  language TEXT DEFAULT 'pt',
  model_size TEXT DEFAULT 'medium',
  enable_diarization BOOLEAN DEFAULT false,
  enable_post_processing BOOLEAN DEFAULT true,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  progress INTEGER DEFAULT 0, -- 0-100
  error_message TEXT,

  -- Resultados (JSON ou campos separados)
  transcription_text TEXT,
  word_count INTEGER,
  duration REAL, -- segundos
  avg_confidence REAL,

  -- Pós-processamento (GPT-4o)
  summary TEXT,
  keywords JSONB, -- ["palavra1", "palavra2"]
  topics JSONB, -- ["tópico1", "tópico2"]
  chapters JSONB, -- [{"title": "VERSO 1", "summary": "..."}]
  segments JSONB, -- Array com word-level timestamps

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_user_id ON transcriptions(user_id);
CREATE INDEX idx_status ON transcriptions(status);
CREATE INDEX idx_created_at ON transcriptions(created_at DESC);
```

**Estrutura do campo `segments`**:
```json
[
  {
    "id": 0,
    "start": 0.0,
    "end": 5.2,
    "text": "Eu vou porque eu sou vagabundo ou nato",
    "words": [
      {"word": "Eu", "start": 0.0, "end": 0.3, "confidence": 0.95},
      {"word": "vou", "start": 0.4, "end": 0.6, "confidence": 0.98}
    ]
  }
]
```

**Estrutura do campo `chapters`**:
```json
[
  {"title": "VERSO 1", "summary": "Abertura da música"},
  {"title": "REFRÃO", "summary": "Parte que se repete"},
  {"title": "PONTE", "summary": "Transição"}
]
```

---

## Guia de Implementação

### 1. Setup do Projeto

```bash
# Criar projeto Next.js
npx create-next-app@latest transcription-app --typescript --tailwind --app

# Instalar dependências
cd transcription-app
npm install @clerk/nextjs class-variance-authority clsx tailwind-merge
npm install @supabase/supabase-js
npm install -D @tailwindcss/forms

# Setup PWA
npm install next-pwa
```

### 2. Configurar Tailwind

Copiar o arquivo `tailwind.config.js` do design system.

### 3. Configurar Clerk

```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 4. Configurar Supabase

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 5. Setup Docker para Backend Python

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./backend:/app
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
```

### 6. Estrutura de Arquivos (LyricsPro)

```
lyricspro/
├── frontend/                      # Next.js App (a criar)
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── pricing/page.tsx  # Planos
│   │   │   └── about/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx
│   │   │   ├── upload/page.tsx   # Upload de música
│   │   │   ├── library/page.tsx  # Biblioteca de músicas
│   │   │   ├── song/[id]/page.tsx # Visualizar letra
│   │   │   └── profile/page.tsx
│   │   ├── api/
│   │   │   └── proxy/route.ts    # Proxy para backend
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── MusicUploader.tsx
│   │   │   ├── LyricViewer.tsx
│   │   │   ├── StructureBadge.tsx
│   │   │   ├── SongCard.tsx
│   │   │   ├── ProcessingStatus.tsx
│   │   │   └── BottomNav.tsx
│   │   └── providers/
│   │       └── ThemeProvider.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── api.ts              # Cliente HTTP para backend
│   │   └── types.ts            # TypeScript types
│   ├── hooks/
│   │   ├── useUpload.ts
│   │   ├── useSongs.ts
│   │   └── usePolling.ts       # Polling de status
│   ├── public/
│   │   ├── logo.svg
│   │   └── manifest.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── package.json
│
├── backend/                       # ✅ FastAPI (já implementado)
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── upload.py     # ✅ Upload endpoint
│   │   │       ├── status.py     # ✅ Status endpoint
│   │   │       └── download.py   # ✅ Download exports
│   │   ├── workers/
│   │   │   ├── celery_app.py     # ✅ Celery config
│   │   │   ├── tasks.py          # ✅ Task orchestrator
│   │   │   └── processors/
│   │   │       ├── audio_extractor.py    # ✅
│   │   │       ├── noise_reducer.py      # ✅
│   │   │       ├── diarizer.py           # ✅
│   │   │       ├── transcriber.py        # ✅
│   │   │       ├── post_processor.py     # ✅
│   │   │       └── exporter.py           # ✅
│   │   ├── models/
│   │   │   ├── transcription.py  # ✅ SQLAlchemy models
│   │   │   └── schemas.py        # ✅ Pydantic schemas
│   │   ├── config.py             # ✅ Settings
│   │   └── main.py               # ✅ FastAPI app
│   ├── .env                       # ✅ Config
│   ├── requirements.txt           # ✅
│   └── Dockerfile
│
├── docker-compose.yml             # Redis, PostgreSQL, MinIO
├── DESIGNSYSTEM.md                # Este arquivo
└── README.md
```

### 7. Hook de Gravação de Áudio

```typescript
// hooks/useRecorder.ts
import { useState, useRef } from 'react'

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          resolve(blob)
        }
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        setRecordingTime(0)
      }
    })
  }

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
  }
}
```

---

## 🚀 Próximos Passos

### Checklist de Implementação

#### Fase 1: Setup Inicial ⏳
- [ ] Criar projeto Next.js 14+ com TypeScript
- [ ] Instalar e configurar Tailwind CSS
- [ ] Configurar fonts (Manrope, Inter)
- [ ] Setup inicial de pastas (components/ui, lib, hooks, app)
- [ ] Configurar ESLint e Prettier
- [ ] Configurar variáveis de ambiente (.env.local)

#### Fase 2: Componentes Base ⏳
- [ ] Implementar componente Button com todas as variantes
- [ ] Implementar componente Card e sub-componentes
- [ ] Implementar componente Input e Textarea
- [ ] Implementar componente Badge e StructureBadge
- [ ] Implementar componente Modal/Dialog
- [ ] Implementar componente Toast/Notification
- [ ] Implementar componente Dropdown/Select
- [ ] Implementar componente Avatar
- [ ] Implementar componente Progress
- [ ] Implementar componente Skeleton
- [ ] Implementar componente EmptyState
- [ ] Implementar componente Tabs

#### Fase 3: Componentes Especializados ⏳
- [ ] Implementar MusicUploader (drag & drop)
- [ ] Implementar LyricViewer (com highlight de estrutura)
- [ ] Implementar SongCard (biblioteca de músicas)
- [ ] Implementar ProcessingStatus (progresso de transcrição)
- [ ] Implementar BottomNav (navegação mobile)
- [ ] Implementar hook useRecorder (gravação de áudio)
- [ ] Implementar hook useUpload (upload com progresso)
- [ ] Implementar hook usePolling (status de processamento)

#### Fase 4: Autenticação e Backend ⏳
- [ ] Configurar Clerk para autenticação
- [ ] Criar páginas de sign-in e sign-up
- [ ] Implementar middleware de autenticação
- [ ] Configurar Supabase para banco de dados
- [ ] Criar schema do banco (tabela transcriptions)
- [ ] Conectar frontend com backend FastAPI
- [ ] Implementar cliente HTTP (lib/api.ts)
- [ ] Criar types TypeScript para API responses

#### Fase 5: Páginas Principais ⏳
- [ ] Landing page (marketing)
- [ ] Página de pricing (planos)
- [ ] Página de upload (/app/upload)
- [ ] Página de biblioteca (/app/library)
- [ ] Página de visualização de música (/app/song/[id])
- [ ] Página de perfil (/app/profile)
- [ ] Página de processamento (/app/processing)

#### Fase 6: Features Avançadas ⏳
- [ ] Implementar sistema de busca de músicas
- [ ] Implementar filtros (concluídas, processando, erro)
- [ ] Implementar exportação (TXT, SRT, JSON, PDF)
- [ ] Implementar edição inline de letras
- [ ] Implementar compartilhamento de músicas
- [ ] Implementar sistema de créditos/planos
- [ ] Dark mode toggle
- [ ] Preferências do usuário (idioma, tema)

#### Fase 7: PWA e Mobile ⏳
- [ ] Configurar next-pwa
- [ ] Criar manifest.json
- [ ] Adicionar service worker
- [ ] Implementar install prompt
- [ ] Otimizar para offline mode
- [ ] Testar em dispositivos móveis
- [ ] Implementar gestos de swipe (opcional)

#### Fase 8: Otimização e Deploy ⏳
- [ ] Otimizar imagens (next/image)
- [ ] Implementar lazy loading
- [ ] Code splitting
- [ ] Lighthouse audit (Performance, Accessibility, SEO)
- [ ] Testes end-to-end (Playwright/Cypress)
- [ ] Configurar CI/CD
- [ ] Deploy em Vercel/AWS
- [ ] Monitoramento de erros (Sentry)

---

## 📊 Status do Projeto

### Concluído ✅
- ✅ Design System completo e documentado
- ✅ Paleta de cores definida
- ✅ Tipografia e escala definidas
- ✅ Sistema de espaçamento
- ✅ Componentes documentados
- ✅ Configuração Tailwind completa
- ✅ Animações e keyframes CSS
- ✅ Padrões de responsividade
- ✅ Backend FastAPI implementado
- ✅ Pipeline de transcrição funcional

### Em Desenvolvimento ⏳
- ⏳ Frontend Next.js (não iniciado)
- ⏳ Integração com Clerk
- ⏳ Integração com Supabase
- ⏳ Implementação dos componentes UI

### Pendente 📋
- 📋 Testes automatizados
- 📋 Deploy em produção
- 📋 PWA capabilities
- 📋 Documentação de API
- 📋 Analytics e monitoramento

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Whisper AI](https://openai.com/research/whisper)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

### Design Inspiration
- [Dribbble - Music Apps](https://dribbble.com/search/music-app)
- [Mobbin - Mobile Patterns](https://mobbin.com/)
- [Refactoring UI](https://www.refactoringui.com/)

### Component Libraries (Referência)
- [shadcn/ui](https://ui.shadcn.com/) - Componentes Tailwind
- [Radix UI](https://www.radix-ui.com/) - Primitivos acessíveis
- [Headless UI](https://headlessui.com/) - Componentes unstyled

### Tools
- [Coolors](https://coolors.co/) - Paleta de cores
- [Google Fonts](https://fonts.google.com/) - Manrope & Inter
- [Heroicons](https://heroicons.com/) - Ícones
- [Lucide Icons](https://lucide.dev/) - Alternativa de ícones

---

## 🎓 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `MusicUploader.tsx`)
- **Hooks**: camelCase com prefixo `use` (ex: `useRecorder.ts`)
- **Utils**: camelCase (ex: `formatDuration.ts`)
- **Types**: PascalCase com sufixo (ex: `TranscriptionData`)
- **Constants**: UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`)

### Estrutura de Componentes
```tsx
// 1. Imports
import { useState } from 'react'
import { cn } from '@/lib/utils'

// 2. Types/Interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

// 3. Componente
export function Button({ variant = 'primary', size = 'md', children }: ButtonProps) {
  // 4. State e hooks
  const [isLoading, setIsLoading] = useState(false)

  // 5. Handlers
  const handleClick = () => {
    // ...
  }

  // 6. Render
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-all',
        variant === 'primary' && 'bg-brand-primary text-white',
        size === 'md' && 'h-11 px-6'
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}
```

### Git Commit Messages
- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação, espaçamento
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Tarefas de manutenção

Exemplo: `feat: add MusicUploader component with drag & drop`

---

## ✨ Design System Finalizado

Este Design System está completo e pronto para implementação! 🎉

**Última atualização**: Janeiro 2025

**Versão**: 1.0.0

**Autor**: Erick - LyricsPro Team