PRD: Sistema Avançado de Transcrição de Áudio/Vídeo com IA
1. VISÃO GERAL DO PROJETO
1.1 Objetivo
Criar um sistema de transcrição de áudio e vídeo profissional, otimizado para o mercado brasileiro, que supere o Whisper padrão através de otimizações, pós-processamento inteligente e features diferenciadas.
1.2 Nome do Projeto
TranscritorAI Pro
1.3 Casos de Uso Principais

Transcrição automática de vídeos para cursos online (CursoBot)
Geração de legendas SRT/VTT
Diarização (identificação de múltiplos speakers)
Resumo e extração de tópicos
Timestamps automáticos de capítulos


2. ARQUITETURA TÉCNICA
2.1 Stack Tecnológica
Backend Core
- Python 3.11+
- FastAPI (API REST)
- Celery (processamento assíncrono)
- Redis (fila de jobs)
- PostgreSQL (metadados e histórico)
Processamento de Áudio/Vídeo
- faster-whisper (transcrição otimizada)
- pyannote.audio (diarização)
- FFmpeg (conversão e extração)
- pydub (manipulação de áudio)
- noisereduce (redução de ruído)
IA e NLP
- OpenAI GPT-4o (pós-processamento e correção)
- deepmultilingualpunctuation (pontuação)
- spaCy (análise linguística)
Armazenamento
- MinIO/S3 (arquivos de áudio/vídeo)
- Local filesystem (temporário)
2.2 Arquitetura de Microserviços
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (Upload Interface)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      FASTAPI GATEWAY                        │
│              (Upload, Status, Download)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      REDIS QUEUE                            │
│                  (Job Management)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    CELERY WORKERS                           │
│                   (Parallel Processing)                     │
└───┬─────────┬──────────┬──────────┬──────────┬─────────────┘
    │         │          │          │          │
    ▼         ▼          ▼          ▼          ▼
┌───────┐ ┌────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐
│Extract│ │ Noise  │ │Diari-│ │Transcri-│ │  Post    │
│ Audio │ │Reduction│ │zation│ │  ption  │ │Processing│
└───────┘ └────────┘ └──────┘ └─────────┘ └──────────┘
    │         │          │          │          │
    └─────────┴──────────┴──────────┴──────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  STORAGE & DATABASE                         │
│         (MinIO/S3 + PostgreSQL + File System)               │
└─────────────────────────────────────────────────────────────┘

3. ESTRUTURA DE PASTAS
transcritor-ai-pro/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app
│   │   ├── config.py               # Configurações
│   │   ├── database.py             # PostgreSQL setup
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── upload.py       # Upload endpoints
│   │   │   │   ├── transcription.py # Status e download
│   │   │   │   └── health.py       # Health checks
│   │   │   └── dependencies.py
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── transcription.py    # SQLAlchemy models
│   │   │   └── schemas.py          # Pydantic schemas
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── storage.py          # S3/MinIO service
│   │   │   └── notification.py     # Webhooks
│   │   │
│   │   └── workers/
│   │       ├── __init__.py
│   │       ├── celery_app.py       # Celery config
│   │       ├── tasks.py            # Celery tasks
│   │       │
│   │       └── processors/
│   │           ├── __init__.py
│   │           ├── audio_extractor.py
│   │           ├── noise_reducer.py
│   │           ├── diarizer.py
│   │           ├── transcriber.py
│   │           ├── punctuator.py
│   │           └── post_processor.py
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api.py
│   │   └── test_processors.py
│   │
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── README.md
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.worker
│   └── docker-compose.yml
│
├── scripts/
│   ├── setup.sh                    # Instalação inicial
│   ├── download_models.py          # Download de modelos IA
│   └── benchmark.py                # Testes de performance
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
│
├── .env.example
├── .gitignore
└── README.md

4. PIPELINE DE PROCESSAMENTO DETALHADO
4.1 Fluxo Completo
python# STAGE 1: Upload e Validação
1. Cliente faz upload do arquivo (vídeo/áudio)
2. API valida formato, tamanho, duração
3. Arquivo salvo no storage temporário
4. Job criado no Redis com ID único
5. Resposta imediata ao cliente com job_id

# STAGE 2: Extração de Áudio (se vídeo)
6. FFmpeg extrai áudio do vídeo
7. Conversão para WAV 16kHz mono
8. Normalização de volume
9. Salva arquivo de áudio processado

# STAGE 3: Pré-processamento
10. Análise de qualidade do áudio
11. Redução de ruído (noisereduce)
12. Detecção de silêncios
13. Divisão inteligente em chunks (30-60s)

# STAGE 4: Diarização (opcional)
14. pyannote.audio identifica speakers
15. Gera timestamps de cada speaker
16. Associa chunks aos speakers

# STAGE 5: Transcrição
17. faster-whisper processa cada chunk
18. Gera texto + word-level timestamps
19. Detecta idioma automaticamente
20. Combina chunks preservando contexto

# STAGE 6: Pós-processamento
21. Adiciona pontuação (deepmultilingualpunctuation)
22. Correção contextual com GPT-4o
23. Formatação de parágrafos
24. Detecção de capítulos/tópicos
25. Extração de palavras-chave

# STAGE 7: Exportação
26. Gera múltiplos formatos:
    - TXT (texto puro)
    - SRT (legendas com timestamps)
    - VTT (legendas web)
    - JSON (estruturado com metadados)
27. Salva no storage permanente
28. Atualiza status no banco de dados
29. Notifica cliente (webhook opcional)
4.2 Tratamento de Erros
python# Cada stage tem retry logic:
- Tentativas: 3x
- Backoff exponencial: 2^n segundos
- Fallback para qualidade menor se GPU falhar
- Logs detalhados em cada etapa
- Notificação de erro ao cliente

5. ESPECIFICAÇÕES DOS COMPONENTES
5.1 Audio Extractor (audio_extractor.py)
python"""
Responsável por extrair e preparar áudio para transcrição

Funcionalidades:
- Extrai áudio de vídeos (MP4, AVI, MOV, MKV)
- Converte para formato padrão (WAV 16kHz mono)
- Normaliza volume para -20dB
- Valida integridade do arquivo
- Calcula duração e metadados

Tecnologias:
- FFmpeg (subprocess)
- pydub (manipulação)
- librosa (análise)

Output:
- audio_processed.wav
- metadata.json (duração, sample_rate, channels, etc)
"""
5.2 Noise Reducer (noise_reducer.py)
python"""
Melhora qualidade do áudio antes da transcrição

Funcionalidades:
- Redução de ruído de fundo
- Supressão de eco
- Filtro passa-banda (80Hz - 8kHz para voz)
- Equalização automática
- Detecção de clipping

Tecnologias:
- noisereduce
- scipy.signal
- librosa

Parâmetros ajustáveis:
- noise_threshold: 0.0 - 1.0
- aggressiveness: low, medium, high
- preserve_speech: boolean
"""
5.3 Diarizer (diarizer.py)
python"""
Identifica e separa diferentes speakers

Funcionalidades:
- Detecção automática de número de speakers (1-10)
- Segmentação por speaker
- Timestamps precisos de cada fala
- Clustering de vozes similares
- Labels: SPEAKER_00, SPEAKER_01, etc

Tecnologias:
- pyannote.audio (modelo pre-trained)
- NVIDIA NeMo (alternativa)

Output:
- segments.json: [{start, end, speaker, confidence}]
- speaker_count: int
- timeline_visualization: opcional
"""
5.4 Transcriber (transcriber.py)
python"""
Core da transcrição usando faster-whisper

Funcionalidades:
- Transcrição multi-idioma (foco PT-BR)
- Word-level timestamps
- Confiança por palavra/segmento
- Detecção automática de idioma
- Suporte a modelos: tiny, base, small, medium, large-v3
- Beam search otimizado
- Quantização INT8 para economia de memória

Parâmetros:
- model_size: "large-v3" (padrão)
- language: "pt" ou "auto"
- beam_size: 5 (padrão)
- best_of: 5
- temperature: 0.0 - 1.0
- compression_ratio_threshold: 2.4
- log_prob_threshold: -1.0
- no_speech_threshold: 0.6

Otimizações:
- GPU obrigatória (CUDA)
- Batch processing de chunks
- Cache de modelo em memória
- Processamento paralelo quando possível

Output:
- segments: [{text, start, end, confidence, words}]
- detected_language: string
- average_confidence: float
"""
5.5 Punctuator (punctuator.py)
python"""
Adiciona pontuação e formatação ao texto

Funcionalidades:
- Pontuação automática (. , ! ? : ; )
- Capitalização de início de frases
- Detecção de nomes próprios
- Quebra de parágrafos
- Formatação de números e datas

Tecnologias:
- deepmultilingualpunctuation
- spaCy (NER para PT-BR)

Regras especiais para PT-BR:
- Tratamento de "né", "tá", "pra"
- Gírias e expressões coloquiais
- Números por extenso
"""
5.6 Post Processor (post_processor.py)
python"""
Refinamento final usando IA generativa

Funcionalidades:
- Correção contextual de erros
- Padronização de termos técnicos
- Detecção de capítulos/seções
- Geração de resumo
- Extração de tópicos e palavras-chave
- Remoção de hesitações (ãh, éh, né)

Tecnologias:
- OpenAI GPT-4o
- Dicionário customizado (opcional)

Features diferenciadas:
- Dicionário jurídico (OAB)
- Termos médicos
- Vocabulário técnico por área
- Correção de nomes próprios brasileiros

Output:
- transcription_refined.txt
- summary.txt
- topics: [string]
- keywords: [string]
- chapters: [{title, start, end}]
"""

6. SCHEMAS E MODELOS DE DADOS
6.1 Database Schema (PostgreSQL)
sql-- Tabela principal de transcrições
CREATE TABLE transcriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Arquivo original
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL, -- 'video' ou 'audio'
    file_size BIGINT NOT NULL,
    duration FLOAT NOT NULL, -- em segundos
    storage_path TEXT NOT NULL,
    
    -- Status do processamento
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, processing, completed, failed
    progress INT DEFAULT 0, -- 0-100
    current_stage VARCHAR(50),
    error_message TEXT,
    
    -- Configurações
    language VARCHAR(10) DEFAULT 'pt',
    model_size VARCHAR(20) DEFAULT 'large-v3',
    enable_diarization BOOLEAN DEFAULT false,
    enable_post_processing BOOLEAN DEFAULT true,
    
    -- Resultados
    transcription_text TEXT,
    word_count INT,
    average_confidence FLOAT,
    detected_language VARCHAR(10),
    speaker_count INT,
    
    -- Metadados
    processing_time_seconds FLOAT,
    gpu_used BOOLEAN,
    cost_credits DECIMAL(10, 2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Índices
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Segmentos de transcrição (para navegação)
CREATE TABLE transcription_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
    
    segment_index INT NOT NULL,
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    text TEXT NOT NULL,
    confidence FLOAT,
    speaker_label VARCHAR(50),
    
    -- Word-level timestamps (JSON)
    words JSONB,
    
    INDEX idx_transcription_id (transcription_id)
);

-- Capítulos detectados
CREATE TABLE transcription_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
    
    chapter_index INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    summary TEXT,
    
    INDEX idx_transcription_id (transcription_id)
);

-- Arquivos exportados
CREATE TABLE transcription_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
    
    format VARCHAR(10) NOT NULL, -- 'txt', 'srt', 'vtt', 'json'
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_transcription_id (transcription_id)
);
6.2 API Request/Response Schemas (Pydantic)
python# Upload Request
class TranscriptionCreateRequest(BaseModel):
    language: Optional[str] = "pt"  # ou "auto"
    model_size: str = "large-v3"
    enable_diarization: bool = False
    enable_post_processing: bool = True
    webhook_url: Optional[str] = None

# Upload Response
class TranscriptionCreateResponse(BaseModel):
    job_id: UUID
    status: str = "pending"
    estimated_time_minutes: float
    message: str

# Status Response
class TranscriptionStatusResponse(BaseModel):
    job_id: UUID
    status: str
    progress: int  # 0-100
    current_stage: Optional[str]
    error_message: Optional[str]
    
    # Quando completado:
    transcription_text: Optional[str]
    word_count: Optional[int]
    duration: Optional[float]
    speaker_count: Optional[int]
    
    # Downloads disponíveis
    exports: List[ExportFormat]
    
    created_at: datetime
    completed_at: Optional[datetime]

class ExportFormat(BaseModel):
    format: str  # txt, srt, vtt, json
    download_url: str
    file_size: int

# Segment Detail
class TranscriptionSegment(BaseModel):
    start: float
    end: float
    text: str
    confidence: float
    speaker: Optional[str]
    words: List[WordTimestamp]

class WordTimestamp(BaseModel):
    word: str
    start: float
    end: float
    confidence: float

# Chapter Detail
class TranscriptionChapter(BaseModel):
    title: str
    start: float
    end: float
    summary: Optional[str]
```

---

## 7. API ENDPOINTS

### 7.1 Upload e Criação
```
POST /api/v1/transcriptions/upload
Content-Type: multipart/form-data

Parâmetros:
- file: File (required) - vídeo ou áudio
- language: string (optional) - default "pt"
- model_size: string (optional) - default "large-v3"
- enable_diarization: boolean (optional) - default false
- enable_post_processing: boolean (optional) - default true
- webhook_url: string (optional) - callback URL

Response 201:
{
  "job_id": "uuid",
  "status": "pending",
  "estimated_time_minutes": 5.2,
  "message": "Transcrição iniciada com sucesso"
}

Response 400: Arquivo inválido
Response 413: Arquivo muito grande (max 2GB)
Response 429: Rate limit excedido
```

### 7.2 Status da Transcrição
```
GET /api/v1/transcriptions/{job_id}

Response 200:
{
  "job_id": "uuid",
  "status": "processing",
  "progress": 65,
  "current_stage": "transcription",
  "created_at": "2025-11-08T10:00:00Z",
  "estimated_completion": "2025-11-08T10:05:00Z"
}

Status possíveis:
- pending: Na fila
- processing: Em processamento
- completed: Finalizado
- failed: Erro
```

### 7.3 Download de Resultados
```
GET /api/v1/transcriptions/{job_id}/download?format=txt

Formatos disponíveis:
- txt: Texto puro
- srt: Legendas SubRip
- vtt: WebVTT
- json: Estruturado com metadados

Response 200: File download
Response 404: Job não encontrado
Response 422: Job ainda processando
```

### 7.4 Segmentos Detalhados
```
GET /api/v1/transcriptions/{job_id}/segments

Response 200:
{
  "segments": [
    {
      "start": 0.0,
      "end": 5.2,
      "text": "Olá, bem-vindo ao curso.",
      "confidence": 0.95,
      "speaker": "SPEAKER_00",
      "words": [
        {"word": "Olá", "start": 0.0, "end": 0.5, "confidence": 0.98},
        ...
      ]
    },
    ...
  ],
  "total_segments": 150
}
```

### 7.5 Capítulos
```
GET /api/v1/transcriptions/{job_id}/chapters

Response 200:
{
  "chapters": [
    {
      "title": "Introdução",
      "start": 0.0,
      "end": 120.5,
      "summary": "Apresentação do curso e objetivos"
    },
    ...
  ]
}
```

### 7.6 Health Check
```
GET /api/health

Response 200:
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "api": "up",
    "redis": "up",
    "postgresql": "up",
    "workers": 3,
    "gpu_available": true
  }
}

8. CONFIGURAÇÃO E VARIÁVEIS DE AMBIENTE
8.1 .env.example
bash# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
DEBUG=false

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/transcritor_ai
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Storage (MinIO/S3)
STORAGE_TYPE=minio  # ou 's3'
STORAGE_ENDPOINT=localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=transcriptions
STORAGE_SECURE=false

# File Limits
MAX_FILE_SIZE_MB=2048
MAX_DURATION_MINUTES=180
ALLOWED_FORMATS=mp4,avi,mov,mkv,mp3,wav,m4a,flac

# Whisper Configuration
WHISPER_MODEL_SIZE=large-v3
WHISPER_DEVICE=cuda  # ou 'cpu'
WHISPER_COMPUTE_TYPE=int8  # ou 'float16', 'float32'
WHISPER_BATCH_SIZE=16

# Diarization
DIARIZATION_ENABLED=true
PYANNOTE_AUTH_TOKEN=your_huggingface_token

# OpenAI (Post-processing)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=2000

# Workers
CELERY_WORKER_CONCURRENCY=2
CELERY_MAX_TASKS_PER_CHILD=10
WORKER_LOG_LEVEL=INFO

# Monitoring
SENTRY_DSN=
PROMETHEUS_ENABLED=true

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_HOUR=100

# Webhooks
WEBHOOK_TIMEOUT_SECONDS=30
WEBHOOK_RETRY_ATTEMPTS=3

9. REQUIREMENTS.TXT
txt# Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# Async Tasks
celery==5.3.4
redis==5.0.1

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1

# Audio/Video Processing
faster-whisper==0.10.0
pyannote.audio==3.1.1
pydub==0.25.1
librosa==0.10.1
noisereduce==3.0.0
soundfile==0.12.1

# NLP and AI
openai==1.3.5
deepmultilingualpunctuation==0.1.0
spacy==3.7.2

# Storage
minio==7.2.0
boto3==1.29.7

# Utilities
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
httpx==0.25.2

# Monitoring
prometheus-client==0.19.0
sentry-sdk==1.38.0

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0

# Development
black==23.11.0
ruff==0.1.6
mypy==1.7.1

10. DOCKER COMPOSE
yamlversion: '3.8'

services:
  # PostgreSQL
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: transcritor_ai
      POSTGRES_USER: transcritor
      POSTGRES_PASSWORD: transcritor_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U transcritor"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO (S3-compatible storage)
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # FastAPI Application
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://transcritor:transcritor_pass@postgres:5432/transcritor_ai
      - REDIS_URL=redis://redis:6379/0
      - STORAGE_ENDPOINT=minio:9000
    volumes:
      - ./backend:/app
      - temp_files:/tmp/transcriptions
    ports:
      - "8000:8000"
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Celery Worker (CPU)
  worker-cpu:
    build:
      context: .
      dockerfile: docker/Dockerfile.worker
    depends_on:
      - redis
      - postgres
      - api
    environment:
      - DATABASE_URL=postgresql://transcritor:transcritor_pass@postgres:5432/transcritor_ai
      - REDIS_URL=redis://redis:6379/0
      - WHISPER_DEVICE=cpu
    volumes:
      - ./backend:/app
      - temp_files:/tmp/transcriptions
      - models_cache:/root/.cache
    command: celery -A app.workers.celery_app worker --loglevel=info --concurrency=2 -Q cpu-tasks

  # Celery Worker (GPU) - Descomentar se tiver GPU
  # worker-gpu:
  #   build:
  #     context: .
  #     dockerfile: docker/Dockerfile.worker
  #   depends_on:
  #     - redis
  #     - postgres
  #     - api
  #   environment:
  #     - DATABASE_URL=postgresql://transcritor:transcritor_pass@postgres:5432/transcritor_ai
  #     - REDIS_URL=redis://redis:6379/0
  #     - WHISPER_DEVICE=cuda
  #   volumes:
  #     - ./backend:/app
  #     - temp_files:/tmp/transcriptions
  #     - models_cache:/root/.cache
  #   deploy:
  #     resources:
  #       reservations:
  #         devices:
  #           - driver: nvidia
  #             count: 1
  #             capabilities: [gpu]
  #   command: celery -A app.workers.celery_app worker --loglevel=info --concurrency=1 -Q gpu-tasks

  # Celery Flower (Monitoring)
  flower:
    build:
      context: .
      dockerfile: docker/Dockerfile.worker
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379/0
    ports:
      - "5555:5555"
    command: celery -A app.workers.celery_app flower --port=5555

volumes:
  postgres_data:
  minio_data:
  temp_files:
  models_cache:
```

---

## 11. INSTRUÇÕES DETALHADAS PARA CLAUDE CODE

### 11.1 Ordem de Criação dos Arquivos

**IMPORTANTE: Siga esta ordem exata para evitar dependências quebradas**

#### Fase 1: Setup Inicial (5 arquivos)
```
1. backend/requirements.txt
2. backend/.env.example
3. backend/pyproject.toml
4. docker/docker-compose.yml
5. .gitignore
```

#### Fase 2: Configuração Base (4 arquivos)
```
6. backend/app/__init__.py
7. backend/app/config.py
8. backend/app/database.py
9. backend/app/models/__init__.py
```

#### Fase 3: Modelos de Dados (2 arquivos)
```
10. backend/app/models/transcription.py
11. backend/app/models/schemas.py
```

#### Fase 4: Celery Core (2 arquivos)
```
12. backend/app/workers/__init__.py
13. backend/app/workers/celery_app.py
```

#### Fase 5: Processadores (ordem importante - do mais simples ao mais complexo)
```
14. backend/app/workers/processors/__init__.py
15. backend/app/workers/processors/audio_extractor.py
16. backend/app/workers/processors/noise_reducer.py
17. backend/app/workers/processors/diarizer.py
18. backend/app/workers/processors/transcriber.py
19. backend/app/workers/processors/punctuator.py
20. backend/app/workers/processors/post_processor.py
```

#### Fase 6: Celery Tasks (1 arquivo)
```
21. backend/app/workers/tasks.py  # Depende de todos os processadores
```

#### Fase 7: Services (2 arquivos)
```
22. backend/app/services/__init__.py
23. backend/app/services/storage.py
```

#### Fase 8: API Routes (4 arquivos)
```
24. backend/app/api/__init__.py
25. backend/app/api/dependencies.py
26. backend/app/api/routes/__init__.py
27. backend/app/api/routes/health.py
28. backend/app/api/routes/upload.py
29. backend/app/api/routes/transcription.py
```

#### Fase 9: FastAPI Main (1 arquivo)
```
30. backend/app/main.py  # Depende de todas as routes
```

#### Fase 10: Dockerfiles (2 arquivos)
```
31. docker/Dockerfile.api
32. docker/Dockerfile.worker
```

#### Fase 11: Scripts Auxiliares (3 arquivos)
```
33. scripts/setup.sh
34. scripts/download_models.py
35. scripts/benchmark.py
```

#### Fase 12: Documentação (3 arquivos)
```
36. README.md
37. docs/API.md
38. docs/DEPLOYMENT.md

11.2 Especificações Detalhadas por Arquivo
ARQUIVO 1: backend/requirements.txt
txt# Copiar exatamente da seção 9 (REQUIREMENTS.TXT)
# Adicionar também:
ffmpeg-python==0.2.0
python-json-logger==2.0.7
ARQUIVO 2: backend/.env.example
txt# Copiar exatamente da seção 8.1
ARQUIVO 3: backend/pyproject.toml
toml[tool.poetry]
name = "transcritor-ai-pro"
version = "1.0.0"
description = "Sistema avançado de transcrição com IA"
authors = ["Erick <erick@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"

[tool.black]
line-length = 100
target-version = ['py311']

[tool.ruff]
line-length = 100
select = ["E", "F", "I"]
ignore = ["E501"]

[tool.mypy]
python_version = "3.11"
disallow_untyped_defs = true
ARQUIVO 4: docker/docker-compose.yml
yaml# Copiar exatamente da seção 10
```

#### ARQUIVO 5: .gitignore
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.venv
*.egg-info/
dist/
build/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.env.local

# Uploads and temp files
uploads/
temp/
*.wav
*.mp4
*.mp3

# Models
models/
*.pt
*.bin

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# OS
.DS_Store
Thumbs.db

# Testing
.coverage
htmlcov/
.pytest_cache/
ARQUIVO 6: backend/app/init.py
python"""
TranscritorAI Pro - Sistema de Transcrição com IA
"""

__version__ = "1.0.0"
ARQUIVO 7: backend/app/config.py
python"""
Configurações centralizadas do sistema
"""

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_workers: int = 4
    debug: bool = False
    
    # Database
    database_url: str
    database_pool_size: int = 20
    
    # Redis
    redis_url: str
    celery_broker_url: str
    celery_result_backend: str
    
    # Storage
    storage_type: str = "minio"
    storage_endpoint: str
    storage_access_key: str
    storage_secret_key: str
    storage_bucket: str = "transcriptions"
    storage_secure: bool = False
    
    # File Limits
    max_file_size_mb: int = 2048
    max_duration_minutes: int = 180
    allowed_formats: str = "mp4,avi,mov,mkv,mp3,wav,m4a,flac"
    
    # Whisper
    whisper_model_size: str = "large-v3"
    whisper_device: str = "cuda"
    whisper_compute_type: str = "int8"
    whisper_batch_size: int = 16
    
    # Diarization
    diarization_enabled: bool = True
    pyannote_auth_token: Optional[str] = None
    
    # OpenAI
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o"
    openai_max_tokens: int = 2000
    
    # Workers
    celery_worker_concurrency: int = 2
    celery_max_tasks_per_child: int = 10
    worker_log_level: str = "INFO"
    
    # Rate Limiting
    rate_limit_per_minute: int = 10
    rate_limit_per_hour: int = 100
    
    # Webhooks
    webhook_timeout_seconds: int = 30
    webhook_retry_attempts: int = 3
    
    @property
    def allowed_formats_list(self) -> list[str]:
        return [fmt.strip() for fmt in self.allowed_formats.split(",")]
    
    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    """Singleton para settings"""
    return Settings()
ARQUIVO 8: backend/app/database.py
python"""
Configuração do banco de dados SQLAlchemy
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

# Engine
engine = create_engine(
    settings.database_url,
    pool_size=settings.database_pool_size,
    max_overflow=20,
    pool_pre_ping=True,
    echo=settings.debug
)

# Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para models
Base = declarative_base()


def get_db():
    """Dependency para obter session do banco"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
ARQUIVO 9-11: Models (transcription.py e schemas.py)
Muito extenso - seguir estruturas da seção 6
NOTA PARA CLAUDE CODE:

Use os schemas SQL da seção 6.1 para criar transcription.py
Use os Pydantic schemas da seção 6.2 para criar schemas.py
Implemente TODOS os campos e relacionamentos
Adicione indexes apropriados
Use UUID como primary key

ARQUIVO 12-13: Celery Setup
python# celery_app.py

from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "transcritor",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=7200,  # 2 horas
    task_soft_time_limit=7000,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=settings.celery_max_tasks_per_child,
)

# Configurar filas
celery_app.conf.task_routes = {
    "app.workers.tasks.process_transcription": {"queue": "gpu-tasks" if settings.whisper_device == "cuda" else "cpu-tasks"},
}
ARQUIVOS 14-20: Processadores
REGRAS CRÍTICAS:

Cada processador deve ter:

Docstring completa
Type hints em todos os métodos
Logging detalhado
Tratamento de erros robusto
Cleanup de recursos temporários
Progresso reportado via callback


audio_extractor.py - DEVE:

Validar arquivo de entrada
Usar FFmpeg via subprocess
Converter para WAV 16kHz mono
Retornar metadata JSON
Calcular duração exata


noise_reducer.py - DEVE:

Aplicar noisereduce
Preservar qualidade da voz
Ter parâmetros ajustáveis
Retornar métricas de melhoria


diarizer.py - DEVE:

Usar pyannote.audio
Detectar número de speakers automaticamente
Gerar timeline com timestamps
Lidar com token HuggingFace


transcriber.py - DEVE:

Usar faster-whisper
Implementar chunking inteligente
Word-level timestamps
Beam search otimizado
Fallback para CPU se GPU falhar
Cache de modelo em memória


punctuator.py - DEVE:

Usar deepmultilingualpunctuation
Regras especiais PT-BR
Preservar timestamps
Capitalização inteligente


post_processor.py - DEVE:

Integração OpenAI GPT-4o
Dicionário customizado opcional
Detecção de capítulos
Extração de keywords
Geração de resumo



TEMPLATE PARA TODOS OS PROCESSADORES:
python"""
[Nome do Processador] - [Descrição]
"""

import logging
from pathlib import Path
from typing import Dict, Any, Optional, Callable

logger = logging.getLogger(__name__)


class [NomeDoProcessador]:
    """
    [Descrição detalhada]
    
    Args:
        [parâmetros]
    
    Attributes:
        [atributos]
    """
    
    def __init__(self, **kwargs):
        """Inicialização"""
        self.config = kwargs
        logger.info(f"{self.__class__.__name__} inicializado")
    
    def process(
        self,
        input_path: Path,
        output_path: Path,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> Dict[str, Any]:
        """
        Processa o arquivo
        
        Args:
            input_path: Caminho do arquivo de entrada
            output_path: Caminho do arquivo de saída
            progress_callback: Função para reportar progresso (0-100)
        
        Returns:
            Dict com resultados e metadata
        
        Raises:
            ProcessingError: Se algo der errado
        """
        try:
            logger.info(f"Processando {input_path}")
            
            # [Lógica do processador]
            
            if progress_callback:
                progress_callback(100)
            
            logger.info(f"Processamento concluído: {output_path}")
            
            return {
                "success": True,
                "output_path": str(output_path),
                # ... metadata específica
            }
            
        except Exception as e:
            logger.error(f"Erro no processamento: {e}", exc_info=True)
            raise ProcessingError(f"Falha em {self.__class__.__name__}: {e}")
    
    def cleanup(self):
        """Limpa recursos temporários"""
        pass


class ProcessingError(Exception):
    """Exceção customizada para erros de processamento"""
    pass
ARQUIVO 21: backend/app/workers/tasks.py
ESTE É O ARQUIVO MAIS COMPLEXO - ORQUESTRA TODO O PIPELINE
python"""
Celery tasks para processamento de transcrições
"""

import logging
from pathlib import Path
from typing import Dict, Any
from celery import Task
from sqlalchemy.orm import Session

from app.workers.celery_app import celery_app
from app.database import SessionLocal
from app.models.transcription import Transcription, TranscriptionSegment
from app.workers.processors.audio_extractor import AudioExtractor
from app.workers.processors.noise_reducer import NoiseReducer
from app.workers.processors.diarizer import Diarizer
from app.workers.processors.transcriber import Transcriber
from app.workers.processors.punctuator import Punctuator
from app.workers.processors.post_processor import PostProcessor

logger = logging.getLogger(__name__)


class TranscriptionTask(Task):
    """Base task com tracking de progresso"""
    
    def update_progress(self, job_id: str, progress: int, stage: str):
        """Atualiza progresso no banco"""
        db = SessionLocal()
        try:
            transcription = db.query(Transcription).filter(
                Transcription.id == job_id
            ).first()
            
            if transcription:
                transcription.progress = progress
                transcription.current_stage = stage
                db.commit()
                
        except Exception as e:
            logger.error(f"Erro ao atualizar progresso: {e}")
        finally:
            db.close()


@celery_app.task(
    bind=True,
    base=TranscriptionTask,
    name="app.workers.tasks.process_transcription",
    max_retries=3,
    default_retry_delay=60
)
def process_transcription(
    self,
    job_id: str,
    file_path: str,
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Pipeline completo de transcrição
    
    Args:
        job_id: UUID da transcrição
        file_path: Caminho do arquivo original
        config: Configurações de processamento
    
    Returns:
        Dict com resultados finais
    """
    
    db = SessionLocal()
    temp_dir = Path(f"/tmp/transcriptions/{job_id}")
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Atualiza status inicial
        transcription = db.query(Transcription).filter(
            Transcription.id == job_id
        ).first()
        
        if not transcription:
            raise ValueError(f"Transcrição {job_id} não encontrada")
        
        transcription.status = "processing"
        db.commit()
        
        # STAGE 1: Extração de Áudio (0-15%)
        self.update_progress(job_id, 5, "audio_extraction")
        logger.info(f"[{job_id}] Iniciando extração de áudio")
        
        extractor = AudioExtractor()
        audio_path = temp_dir / "audio.wav"
        
        audio_result = extractor.process(
            input_path=Path(file_path),
            output_path=audio_path,
            progress_callback=lambda p: self.update_progress(
                job_id, 5 + int(p * 0.1), "audio_extraction"
            )
        )
        
        transcription.duration = audio_result["duration"]
        db.commit()
        
        # STAGE 2: Redução de Ruído (15-25%)
        self.update_progress(job_id, 15, "noise_reduction")
        logger.info(f"[{job_id}] Aplicando redução de ruído")
        
        reducer = NoiseReducer()
        audio_clean_path = temp_dir / "audio_clean.wav"
        
        reducer.process(
            input_path=audio_path,
            output_path=audio_clean_path,
            progress_callback=lambda p: self.update_progress(
                job_id, 15 + int(p * 0.1), "noise_reduction"
            )
        )
        
        # STAGE 3: Diarização (25-40%) - Opcional
        speaker_segments = None
        if config.get("enable_diarization", False):
            self.update_progress(job_id, 25, "diarization")
            logger.info(f"[{job_id}] Executando diarização")
            
            diarizer = Diarizer()
            diarization_result = diarizer.process(
                input_path=audio_clean_path,
                output_path=temp_dir / "diarization.json",
                progress_callback=lambda p: self.update_progress(
                    job_id, 25 + int(p * 0.15), "diarization"
                )
            )
            
            speaker_segments = diarization_result["segments"]
            transcription.speaker_count = diarization_result["speaker_count"]
            db.commit()
        
        # STAGE 4: Transcrição (40-70%)
        self.update_progress(job_id, 40, "transcription")
        logger.info(f"[{job_id}] Iniciando transcrição")
        
        transcriber = Transcriber(
            model_size=config.get("model_size", "large-v3"),
            language=config.get("language", "pt"),
            device=config.get("device", "cuda")
        )
        
        transcription_result = transcriber.process(
            input_path=audio_clean_path,
            output_path=temp_dir / "transcription_raw.json",
            speaker_segments=speaker_segments,
            progress_callback=lambda p: self.update_progress(
                job_id, 40 + int(p * 0.3), "transcription"
            )
        )
        
        # Salvar segmentos no banco
        for idx, segment in enumerate(transcription_result["segments"]):
            db_segment = TranscriptionSegment(
                transcription_id=job_id,
                segment_index=idx,
                start_time=segment["start"],
                end_time=segment["end"],
                text=segment["text"],
                confidence=segment.get("confidence"),
                speaker_label=segment.get("speaker"),
                words=segment.get("words", [])
            )
            db.add(db_segment)
        
        transcription.detected_language = transcription_result.get("language")
        transcription.average_confidence = transcription_result.get("avg_confidence")
        db.commit()
        
        # STAGE 5: Pontuação (70-80%)
        self.update_progress(job_id, 70, "punctuation")
        logger.info(f"[{job_id}] Adicionando pontuação")
        
        punctuator = Punctuator()
        punctuation_result = punctuator.process(
            input_path=temp_dir / "transcription_raw.json",
            output_path=temp_dir / "transcription_punctuated.json",
            progress_callback=lambda p: self.update_progress(
                job_id, 70 + int(p * 0.1), "punctuation"
            )
        )
        
        # STAGE 6: Pós-processamento (80-95%) - Opcional
        final_text = punctuation_result["text"]
        
        if config.get("enable_post_processing", True):
            self.update_progress(job_id, 80, "post_processing")
            logger.info(f"[{job_id}] Executando pós-processamento com IA")
            
            post_processor = PostProcessor()
            post_result = post_processor.process(
                input_path=temp_dir / "transcription_punctuated.json",
                output_path=temp_dir / "transcription_final.json",
                progress_callback=lambda p: self.update_progress(
                    job_id, 80 + int(p * 0.15), "post_processing"
                )
            )
            
            final_text = post_result["text"]
            
            # Salvar capítulos se detectados
            # [código para salvar chapters no banco]
        
        # STAGE 7: Finalização (95-100%)
        self.update_progress(job_id, 95, "finalization")
        
        # Salvar texto final
        transcription.transcription_text = final_text
        transcription.word_count = len(final_text.split())
        transcription.status = "completed"
        transcription.progress = 100
        db.commit()
        
        logger.info(f"[{job_id}] Transcrição concluída com sucesso")
        
        return {
            "success": True,
            "job_id": job_id,
            "word_count": transcription.word_count,
            "duration": transcription.duration
        }
        
    except Exception as e:
        logger.error(f"[{job_id}] Erro no processamento: {e}", exc_info=True)
        
        # Atualizar status de erro
        transcription.status = "failed"
        transcription.error_message = str(e)
        db.commit()
        
        # Retry se não excedeu max_retries
        raise self.retry(exc=e)
        
    finally:
        db.close()
        # Cleanup de arquivos temporários
        # [código para limpar temp_dir]
ARQUIVOS 22-29: Services e API Routes
Seguir padrões FastAPI modernos:

Dependency injection
Async quando possível
Validação com Pydantic
Error handling consistente
Documentação OpenAPI completa

ARQUIVO 30: backend/app/main.py
python"""
FastAPI Application - Entry Point
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.api.routes import health, upload, transcription

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events"""
    # Startup
    logger.info("Iniciando TranscritorAI Pro...")
    Base.metadata.create_all(bind=engine)
    logger.info("Banco de dados inicializado")
    
    yield
    
    # Shutdown
    logger.info("Encerrando aplicação...")


# App
app = FastAPI(
    title="TranscritorAI Pro",
    description="Sistema avançado de transcrição de áudio/vídeo com IA",
    version="1.0.0",
    lifespan=lifespan
)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routes
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(upload.router, prefix="/api/v1", tags=["Upload"])
app.include_router(transcription.router, prefix="/api/v1", tags=["Transcription"])


@app.get("/")
async def root():
    return {
        "service": "TranscritorAI Pro",
        "version": "1.0.0",
        "status": "running"
    }

12. CHECKLIST FINAL PARA CLAUDE CODE
✅ Antes de Iniciar

 Ler TODO o PRD completamente
 Entender a arquitetura geral
 Verificar ordem de criação de arquivos
 Confirmar dependências entre componentes

✅ Durante Desenvolvimento

 Seguir EXATAMENTE a ordem de criação
 Implementar TODOS os campos dos schemas
 Adicionar type hints em TUDO
 Logging detalhado em cada módulo
 Error handling robusto
 Docstrings completas
 Cleanup de recursos temporários

✅ Componentes Críticos

 Audio Extractor: FFmpeg funcional
 Transcriber: Faster-Whisper integrado
 Diarizer: pyannote.audio configurado
 Post Processor: OpenAI API integrada
 Celery Tasks: Pipeline completo orquestrado
 API Routes: Todos os endpoints implementados
 Database: Todos os modelos e relações

✅ Testes Essenciais

 Upload de arquivo funciona
 Job é criado no Redis
 Worker processa arquivo
 Status é atualizado corretamente
 Download funciona nos formatos: TXT, SRT, VTT, JSON
 Error handling funciona

✅ Antes de Entregar

 README.md completo com instruções
 docker-compose.yml testado
 .env.example atualizado
 Todos os requirements instaláveis
 Script setup.sh funcional


13. PRÓXIMOS PASSOS APÓS CRIAÇÃO
Fase 1: Setup e Teste Básico
bash1. cd transcritor-ai-pro
2. python -m venv venv
3. source venv/bin/activate
4. pip install -r backend/requirements.txt
5. cp backend/.env.example backend/.env
6. # Editar .env com configurações reais
7. docker-compose up -d postgres redis minio
8. cd backend && uvicorn app.main:app --reload
Fase 2: Download de Modelos
bashpython scripts/download_models.py
Fase 3: Teste End-to-End
bash# Terminal 1: API
uvicorn app.main:app --reload

# Terminal 2: Worker
celery -A app.workers.celery_app worker --loglevel=info

# Terminal 3: Teste
curl -X POST http://localhost:8000/api/v1/transcriptions/upload \
  -F "file=@test.mp4" \
  -F "language=pt" \
  -F "enable_diarization=true"
Fase 4: Otimizações

Fine-tune parâmetros do Whisper
Ajustar chunking para melhor qualidade
Criar dicionário customizado PT-BR
Implementar cache de modelos
Adicionar métricas de performance


14. RECURSOS ADICIONAIS
Links Importantes

Whisper: https://github.com/openai/whisper
Faster-Whisper: https://github.com/guillaumekln/faster-whisper
pyannote.audio: https://github.com/pyannote/pyannote-audio
FastAPI: https://fastapi.tiangolo.com/
Celery: https://docs.celeryq.dev/

Datasets para Treino/Fine-tuning

Common Voice PT-BR: https://commonvoice.mozilla.org/
VoxPopuli: https://github.com/facebookresearch/voxpopuli
CORAA: https://github.com/nilc-nlp/CORAA


FIM DO DOCUMENTO
Este PRD está completo e pronto para o Claude Code criar o projeto inteiro no VSCode seguindo exatamente esta especificação.