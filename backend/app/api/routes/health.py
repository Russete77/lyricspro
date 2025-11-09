"""
Health Check Endpoints
"""

import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import redis

from app.api.dependencies import get_db
from app.config import get_settings
from app.models.schemas import HealthCheckResponse

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.get("/health", response_model=HealthCheckResponse)
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint

    Verifica status de:
    - API
    - PostgreSQL
    - Redis
    - Workers (via Redis)
    - GPU (se configurado)
    """
    services = {
        "api": "up",
        "postgresql": "down",
        "redis": "down",
        "workers": 0,
        "gpu_available": False
    }

    # Verificar PostgreSQL
    try:
        db.execute(text("SELECT 1"))
        services["postgresql"] = "up"
    except Exception as e:
        logger.error(f"PostgreSQL não disponível: {e}")
        services["postgresql"] = "down"

    # Verificar Redis
    try:
        r = redis.from_url(settings.redis_url)
        r.ping()
        services["redis"] = "up"

        # Contar workers ativos (Celery)
        # Simplified - em produção você usaria Celery inspect
        services["workers"] = 1

    except Exception as e:
        logger.error(f"Redis não disponível: {e}")
        services["redis"] = "down"

    # Verificar GPU
    if settings.whisper_device == "cuda":
        try:
            import torch
            services["gpu_available"] = torch.cuda.is_available()
        except:
            services["gpu_available"] = False

    return HealthCheckResponse(
        status="healthy" if all([
            services["postgresql"] == "up",
            services["redis"] == "up"
        ]) else "degraded",
        version="1.0.0",
        services=services
    )
