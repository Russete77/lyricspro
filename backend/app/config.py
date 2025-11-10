"""
Configurações centralizadas do sistema
"""

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações da aplicação"""

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"  # Ignorar campos extras do .env
    )

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_workers: int = 4
    debug: bool = False

    # Database
    database_url: str
    database_pool_size: int = 20

    # Redis (opcional - se não tiver, não usa Celery)
    redis_url: Optional[str] = None
    celery_broker_url: Optional[str] = None
    celery_result_backend: Optional[str] = None

    # Storage
    storage_type: str = "local"
    storage_endpoint: Optional[str] = None
    storage_access_key: Optional[str] = None
    storage_secret_key: Optional[str] = None
    storage_bucket: str = "transcriptions"
    storage_secure: bool = False

    # File Limits
    max_file_size_mb: int = 2048
    max_duration_minutes: int = 180
    allowed_formats: str = "mp4,avi,mov,mkv,mp3,wav,m4a,flac,webm,ogg"

    # Whisper
    whisper_model_size: str = "large-v3"
    whisper_device: str = "cuda"
    whisper_compute_type: str = "int8"
    whisper_batch_size: int = 16

    # Vocal Separation
    enable_vocal_separation: bool = False

    # HuggingFace
    huggingface_token: Optional[str] = None

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
