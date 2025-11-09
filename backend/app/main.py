"""
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
    logger.info("=" * 60)
    logger.info("Iniciando TranscritorAI Pro...")
    logger.info("=" * 60)

    # Criar tabelas do banco
    logger.info("Inicializando banco de dados...")
    Base.metadata.create_all(bind=engine)
    logger.info("✓ Banco de dados inicializado")

    # Log de configurações
    logger.info(f"✓ Ambiente: {'DEBUG' if settings.debug else 'PRODUCTION'}")
    logger.info(f"✓ Whisper Device: {settings.whisper_device}")
    logger.info(f"✓ Whisper Model: {settings.whisper_model_size}")
    logger.info(f"✓ Diarização: {'Habilitada' if settings.diarization_enabled else 'Desabilitada'}")
    logger.info(f"✓ OpenAI API: {'Configurada' if settings.openai_api_key else 'Não configurada'}")

    logger.info("=" * 60)
    logger.info("✓ Aplicação iniciada com sucesso!")
    logger.info("=" * 60)

    yield

    # Shutdown
    logger.info("Encerrando aplicação...")


# App
app = FastAPI(
    title="TranscritorAI Pro",
    description="""
    ## Sistema Avançado de Transcrição de Áudio/Vídeo com IA

    ### Features principais:
    - 🎤 Transcrição de alta qualidade usando Whisper
    - 👥 Diarização (identificação de speakers)
    - 🤖 Pós-processamento com GPT-4o
    - 📝 Pontuação automática
    - 📊 Detecção de capítulos e tópicos
    - 📥 Exportação em múltiplos formatos (TXT, SRT, VTT, JSON)

    ### Pipeline de Processamento:
    1. **Extração de Áudio** - FFmpeg
    2. **Redução de Ruído** - noisereduce
    3. **Diarização** - pyannote.audio (opcional)
    4. **Transcrição** - faster-whisper
    5. **Pontuação** - deepmultilingualpunctuation
    6. **Pós-processamento** - GPT-4o (opcional)
    7. **Exportação** - Múltiplos formatos

    ### Casos de Uso:
    - Transcrição de vídeos para cursos online
    - Geração de legendas automáticas
    - Atas de reuniões
    - Podcasts e entrevistas
    - Conteúdo educacional
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middlewares
# CORS - ler do .env ou permitir tudo em desenvolvimento
import os
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
cors_origins = [origin.strip() for origin in cors_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
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
    """
    Endpoint raiz - Informações da API
    """
    return {
        "service": "TranscritorAI Pro",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
        "description": "Sistema avançado de transcrição de áudio/vídeo com IA"
    }


@app.get("/api/info")
async def api_info():
    """
    Informações da API e configurações
    """
    return {
        "version": "1.0.0",
        "whisper_model": settings.whisper_model_size,
        "whisper_device": settings.whisper_device,
        "diarization_enabled": settings.diarization_enabled,
        "post_processing_enabled": bool(settings.openai_api_key),
        "max_file_size_mb": settings.max_file_size_mb,
        "max_duration_minutes": settings.max_duration_minutes,
        "allowed_formats": settings.allowed_formats_list
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        workers=1 if settings.debug else settings.api_workers
    )
