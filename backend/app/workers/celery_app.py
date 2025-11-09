"""
Celery Application Configuration
"""

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
    "app.workers.tasks.process_transcription": {
        "queue": "gpu-tasks" if settings.whisper_device == "cuda" else "cpu-tasks"
    },
}
