# API Documentation

Documentação completa da API REST do TranscritorAI Pro.

## Base URL

```
http://localhost:8000/api/v1
```

## Autenticação

🚧 Em desenvolvimento - Por enquanto a API é aberta.

Em produção, use:
- API Keys
- JWT Tokens
- OAuth 2.0

## Endpoints

### 1. Upload de Transcrição

Faz upload de arquivo de vídeo/áudio para transcrição.

**Endpoint:** `POST /transcriptions/upload`

**Content-Type:** `multipart/form-data`

**Parâmetros:**

| Campo | Tipo | Required | Default | Descrição |
|-------|------|----------|---------|-----------|
| file | File | ✅ | - | Arquivo de vídeo ou áudio |
| language | string | ❌ | "pt" | Idioma (pt, en, es, auto) |
| model_size | string | ❌ | "large-v3" | Modelo Whisper (tiny, base, small, medium, large-v3) |
| enable_diarization | boolean | ❌ | false | Habilitar diarização de speakers |
| enable_post_processing | boolean | ❌ | true | Habilitar pós-processamento com IA |
| webhook_url | string | ❌ | null | URL para callback ao concluir |

**Formatos Aceitos:**
- Vídeo: mp4, avi, mov, mkv
- Áudio: mp3, wav, m4a, flac

**Limites:**
- Tamanho máximo: 2GB
- Duração máxima: 180 minutos

**Exemplo de Request:**

```bash
curl -X POST "http://localhost:8000/api/v1/transcriptions/upload" \
  -F "file=@meeting.mp4" \
  -F "language=pt" \
  -F "model_size=large-v3" \
  -F "enable_diarization=true" \
  -F "enable_post_processing=true" \
  -F "webhook_url=https://yoursite.com/webhook"
```

**Response (201 Created):**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "estimated_time_minutes": 5.2,
  "message": "Transcrição iniciada com sucesso"
}
```

**Erros:**

- `400 Bad Request` - Arquivo inválido
- `413 Payload Too Large` - Arquivo muito grande
- `429 Too Many Requests` - Rate limit excedido
- `500 Internal Server Error` - Erro no servidor

---

### 2. Status da Transcrição

Obtém o status atual do processamento.

**Endpoint:** `GET /transcriptions/{job_id}`

**Parâmetros de Path:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| job_id | UUID | ID único do job |

**Exemplo de Request:**

```bash
curl "http://localhost:8000/api/v1/transcriptions/550e8400-e29b-41d4-a716-446655440000"
```

**Response (200 OK):**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": 65,
  "current_stage": "transcription",
  "error_message": null,
  "transcription_text": null,
  "word_count": null,
  "duration": null,
  "speaker_count": null,
  "exports": [],
  "created_at": "2025-11-08T10:00:00Z",
  "completed_at": null
}
```

**Status possíveis:**
- `pending` - Na fila
- `processing` - Em processamento
- `completed` - Concluído
- `failed` - Erro

**Stages de processamento:**
1. `audio_extraction` - Extração de áudio
2. `noise_reduction` - Redução de ruído
3. `diarization` - Identificação de speakers
4. `transcription` - Transcrição do áudio
5. `punctuation` - Adição de pontuação
6. `post_processing` - Refinamento com IA
7. `finalization` - Finalização

**Response quando completado:**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "progress": 100,
  "current_stage": "finalization",
  "error_message": null,
  "transcription_text": "Olá, bem-vindo ao nosso curso...",
  "word_count": 1523,
  "duration": 180.5,
  "speaker_count": 2,
  "exports": [
    {
      "format": "txt",
      "download_url": "/api/v1/transcriptions/{job_id}/download?format=txt",
      "file_size": 7850
    },
    {
      "format": "srt",
      "download_url": "/api/v1/transcriptions/{job_id}/download?format=srt",
      "file_size": 12340
    },
    {
      "format": "vtt",
      "download_url": "/api/v1/transcriptions/{job_id}/download?format=vtt",
      "file_size": 12450
    },
    {
      "format": "json",
      "download_url": "/api/v1/transcriptions/{job_id}/download?format=json",
      "file_size": 45230
    }
  ],
  "created_at": "2025-11-08T10:00:00Z",
  "completed_at": "2025-11-08T10:05:30Z"
}
```

**Erros:**

- `404 Not Found` - Job não encontrado

---

### 3. Download de Resultado

Baixa o resultado da transcrição em formato específico.

**Endpoint:** `GET /transcriptions/{job_id}/download`

**Parâmetros:**

| Campo | Tipo | Required | Default | Valores |
|-------|------|----------|---------|---------|
| format | string | ❌ | "txt" | txt, srt, vtt, json |

**Formatos disponíveis:**

#### TXT - Texto Puro
```bash
curl "http://localhost:8000/api/v1/transcriptions/{job_id}/download?format=txt"
```

Response:
```json
{
  "text": "Olá, bem-vindo ao nosso curso de programação..."
}
```

#### SRT - Legendas SubRip
```bash
curl "http://localhost:8000/api/v1/transcriptions/{job_id}/download?format=srt"
```

Response:
```json
{
  "srt": "1\n00:00:00,000 --> 00:00:05,200\nOlá, bem-vindo ao curso.\n\n2\n00:00:05,200 --> 00:00:10,500\nHoje vamos aprender sobre Python.\n\n"
}
```

#### VTT - WebVTT
```bash
curl "http://localhost:8000/api/v1/transcriptions/{job_id}/download?format=vtt"
```

#### JSON - Estruturado Completo
```bash
curl "http://localhost:8000/api/v1/transcriptions/{job_id}/download?format=json"
```

Response:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "Transcrição completa...",
  "word_count": 1523,
  "duration": 180.5,
  "language": "pt",
  "speaker_count": 2,
  "segments": [
    {
      "start": 0.0,
      "end": 5.2,
      "text": "Olá, bem-vindo ao curso.",
      "confidence": 0.95,
      "speaker": "SPEAKER_00",
      "words": [
        {
          "word": "Olá",
          "start": 0.0,
          "end": 0.5,
          "confidence": 0.98
        }
      ]
    }
  ]
}
```

**Erros:**

- `404 Not Found` - Job não encontrado
- `422 Unprocessable Entity` - Job ainda processando

---

### 4. Segmentos Detalhados

Obtém lista detalhada de segmentos com timestamps.

**Endpoint:** `GET /transcriptions/{job_id}/segments`

**Response (200 OK):**

```json
{
  "segments": [
    {
      "start": 0.0,
      "end": 5.2,
      "text": "Olá, bem-vindo ao curso.",
      "confidence": 0.95,
      "speaker": "SPEAKER_00",
      "words": [
        {
          "word": "Olá",
          "start": 0.0,
          "end": 0.5,
          "confidence": 0.98
        },
        {
          "word": "bem-vindo",
          "start": 0.6,
          "end": 1.2,
          "confidence": 0.97
        }
      ]
    }
  ],
  "total_segments": 150
}
```

---

### 5. Capítulos Detectados

Obtém capítulos/seções identificados pela IA.

**Endpoint:** `GET /transcriptions/{job_id}/chapters`

**Response (200 OK):**

```json
{
  "chapters": [
    {
      "title": "Introdução",
      "start": 0.0,
      "end": 120.5,
      "summary": "Apresentação do curso e objetivos principais"
    },
    {
      "title": "Conceitos Básicos",
      "start": 120.5,
      "end": 300.0,
      "summary": "Explicação dos fundamentos de programação"
    }
  ]
}
```

---

### 6. Health Check

Verifica saúde dos serviços.

**Endpoint:** `GET /api/health`

**Response (200 OK):**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "api": "up",
    "postgresql": "up",
    "redis": "up",
    "workers": 3,
    "gpu_available": true
  }
}
```

---

## Webhooks

Quando você fornece um `webhook_url` no upload, o sistema enviará notificações:

### Transcrição Concluída

```http
POST {webhook_url}
Content-Type: application/json
X-Event-Type: transcription.completed

{
  "event": "transcription.completed",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "timestamp": "2025-11-08T10:05:30Z",
  "data": {
    "word_count": 1523,
    "duration": 180.5,
    "speaker_count": 2
  }
}
```

### Transcrição Falhou

```http
POST {webhook_url}
Content-Type: application/json
X-Event-Type: transcription.failed

{
  "event": "transcription.failed",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "error": "Erro ao processar áudio: arquivo corrompido"
}
```

---

## Rate Limiting

- **10 requests/minuto** por IP
- **100 requests/hora** por IP

Headers de resposta:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1699459200
```

---

## Códigos de Erro

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 413 | Payload Too Large |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## SDKs e Exemplos

### Python

```python
import requests

# Upload
files = {'file': open('video.mp4', 'rb')}
data = {
    'language': 'pt',
    'enable_diarization': True
}

response = requests.post(
    'http://localhost:8000/api/v1/transcriptions/upload',
    files=files,
    data=data
)

job_id = response.json()['job_id']

# Status
status = requests.get(
    f'http://localhost:8000/api/v1/transcriptions/{job_id}'
).json()

print(f"Status: {status['status']}")
print(f"Progress: {status['progress']}%")
```

### JavaScript

```javascript
// Upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('language', 'pt');
formData.append('enable_diarization', true);

const response = await fetch('http://localhost:8000/api/v1/transcriptions/upload', {
  method: 'POST',
  body: formData
});

const { job_id } = await response.json();

// Status
const status = await fetch(
  `http://localhost:8000/api/v1/transcriptions/${job_id}`
).then(r => r.json());

console.log(`Status: ${status.status}`);
console.log(`Progress: ${status.progress}%`);
```

---

## Interactive Documentation

Acesse a documentação interativa em:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
