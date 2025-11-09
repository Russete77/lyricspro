# TranscritorAI Pro 🎤

Sistema avançado de transcrição de áudio/vídeo com IA, otimizado para português brasileiro.

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **🎯 Transcrição de Alta Qualidade** - Usando faster-whisper (otimizado)
- **👥 Diarização** - Identificação automática de múltiplos speakers
- **🤖 Pós-processamento com IA** - Refinamento usando GPT-4o
- **📝 Pontuação Automática** - Detecção inteligente de pontuação
- **🎬 Detecção de Capítulos** - Segmentação automática de conteúdo
- **📊 Múltiplos Formatos** - Exportação em TXT, SRT, VTT, JSON
- **⚡ Processamento Assíncrono** - Celery + Redis para jobs paralelos
- **🐳 Docker Ready** - Containerização completa
- **📈 Escalável** - Arquitetura de microserviços

## 📋 Casos de Uso

- Transcrição de vídeos para cursos online
- Geração automática de legendas
- Atas de reuniões e conferências
- Podcasts e entrevistas
- Conteúdo educacional
- Acessibilidade (legendas para surdos)

## 🏗️ Arquitetura

```
┌─────────────┐
│   CLIENT    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   FastAPI   │ ← API Gateway
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Redis Queue │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│     Celery Workers              │
│  ┌──────────────────────────┐   │
│  │ 1. Audio Extraction      │   │
│  │ 2. Noise Reduction       │   │
│  │ 3. Diarization           │   │
│  │ 4. Transcription         │   │
│  │ 5. Punctuation           │   │
│  │ 6. Post-processing       │   │
│  │ 7. Export                │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
       │
       ▼
┌─────────────┐
│  Storage    │
│  + Database │
└─────────────┘
```

## 🛠️ Stack Tecnológica

### Backend
- **Python 3.11+**
- **FastAPI** - API REST moderna e rápida
- **Celery** - Processamento assíncrono
- **Redis** - Fila de jobs
- **PostgreSQL** - Banco de dados relacional
- **SQLAlchemy** - ORM

### Processamento
- **faster-whisper** - Transcrição otimizada
- **pyannote.audio** - Diarização
- **FFmpeg** - Conversão de mídia
- **noisereduce** - Redução de ruído
- **librosa** - Análise de áudio

### IA e NLP
- **OpenAI GPT-4o** - Pós-processamento
- **deepmultilingualpunctuation** - Pontuação
- **spaCy** - NLP para PT-BR

### Storage
- **MinIO/S3** - Object storage
- **Local filesystem** - Cache temporário

## 📦 Instalação

### Opção 1: Instalação Local

#### Requisitos

- Python 3.11+
- FFmpeg
- PostgreSQL 14+
- Redis 7+

#### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/transcritor-ai-pro.git
cd transcritor-ai-pro

# 2. Execute o script de setup
cd scripts
chmod +x setup.sh
./setup.sh

# 3. Configure as variáveis de ambiente
cd ../backend
cp .env.example .env
# Edite .env com suas configurações

# 4. Download dos modelos de IA
cd ..
python scripts/download_models.py

# 5. Inicie os serviços (em terminais separados)

# Terminal 1: API
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Worker
celery -A app.workers.celery_app worker --loglevel=info

# Terminal 3: Flower (monitoramento, opcional)
celery -A app.workers.celery_app flower
```

### Opção 2: Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/transcritor-ai-pro.git
cd transcritor-ai-pro

# 2. Configure .env
cp backend/.env.example backend/.env
# Edite backend/.env

# 3. Inicie com Docker Compose
docker-compose up -d

# 4. Verifique os logs
docker-compose logs -f

# 5. Acesse a documentação
# http://localhost:8000/docs
```

## 🚀 Uso Rápido

### 1. Upload de Arquivo

```bash
curl -X POST "http://localhost:8000/api/v1/transcriptions/upload" \
  -F "file=@video.mp4" \
  -F "language=pt" \
  -F "enable_diarization=true" \
  -F "enable_post_processing=true"
```

Resposta:
```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "pending",
  "estimated_time_minutes": 5.2,
  "message": "Transcrição iniciada com sucesso"
}
```

### 2. Verificar Status

```bash
curl "http://localhost:8000/api/v1/transcriptions/{job_id}"
```

### 3. Download do Resultado

```bash
# Texto puro
curl "http://localhost:8000/api/v1/transcriptions/{job_id}/download?format=txt"

# Legendas SRT
curl "http://localhost:8000/api/v1/transcriptions/{job_id}/download?format=srt"

# JSON completo
curl "http://localhost:8000/api/v1/transcriptions/{job_id}/download?format=json"
```

## 📚 Documentação

- **[API Documentation](docs/API.md)** - Referência completa da API
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Guia de deploy em produção
- **[Interactive Docs](http://localhost:8000/docs)** - Swagger UI (quando rodando)

## ⚙️ Configuração

### Variáveis de Ambiente Principais

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/transcritor_ai

# Redis
REDIS_URL=redis://localhost:6379/0

# Whisper
WHISPER_MODEL_SIZE=large-v3
WHISPER_DEVICE=cuda  # ou 'cpu'

# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# Pyannote (opcional, para diarização)
PYANNOTE_AUTH_TOKEN=hf_...
```

Ver [.env.example](backend/.env.example) para lista completa.

## 🎯 Modelos Disponíveis

### Whisper Models

| Modelo | Tamanho | Qualidade | Velocidade | GPU Recomendada |
|--------|---------|-----------|------------|-----------------|
| tiny   | 39 MB   | ⭐⭐       | ⚡⚡⚡        | Não necessária  |
| base   | 74 MB   | ⭐⭐⭐      | ⚡⚡⚡        | Não necessária  |
| small  | 244 MB  | ⭐⭐⭐⭐     | ⚡⚡         | Opcional        |
| medium | 769 MB  | ⭐⭐⭐⭐⭐    | ⚡          | Recomendada     |
| large-v3 | 1.5 GB | ⭐⭐⭐⭐⭐⭐   | ⚡          | Necessária      |

**Recomendação**: `large-v3` para melhor qualidade (requer GPU)

## 📊 Performance

Benchmarks em arquivo de áudio de 5 minutos:

| Configuração | Tempo | Precisão | GPU |
|--------------|-------|----------|-----|
| tiny (CPU)   | 45s   | 85%      | ❌  |
| base (CPU)   | 2m    | 90%      | ❌  |
| large-v3 (GPU) | 30s | 98%      | ✅  |

## 🧪 Testes

```bash
# Instalar dependências de teste
pip install pytest pytest-asyncio pytest-cov

# Rodar testes
pytest

# Com coverage
pytest --cov=app tests/

# Benchmark
python scripts/benchmark.py sample.wav
```

## 🐛 Troubleshooting

### Erro: "CUDA not available"
- Instale PyTorch com suporte CUDA
- Configure `WHISPER_DEVICE=cpu` no .env

### Erro: "pyannote.audio token required"
- Obtenha token em: https://huggingface.co/settings/tokens
- Configure `PYANNOTE_AUTH_TOKEN` no .env

### Workers não processam jobs
- Verifique se Redis está rodando
- Verifique logs: `docker-compose logs worker-cpu`

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Ver [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Erick** - *Desenvolvedor Principal* - [@erick](https://github.com/erick)

## 🙏 Agradecimentos

- [OpenAI Whisper](https://github.com/openai/whisper)
- [faster-whisper](https://github.com/guillaumekln/faster-whisper)
- [pyannote.audio](https://github.com/pyannote/pyannote-audio)
- [FastAPI](https://fastapi.tiangolo.com/)

## 📞 Suporte

- 📧 Email: support@transcritorai.com
- 💬 Discord: [Join our community](https://discord.gg/transcritorai)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/transcritor-ai-pro/issues)

---

Feito com ❤️ para a comunidade brasileira de desenvolvedores
