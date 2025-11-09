"""
Pydantic Schemas para Request/Response
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# Upload Request/Response
class TranscriptionCreateRequest(BaseModel):
    """Request para criar transcrição"""
    language: Optional[str] = "pt"  # ou "auto"
    model_size: str = "large-v3"
    enable_diarization: bool = False
    enable_post_processing: bool = True
    webhook_url: Optional[str] = None


class TranscriptionCreateResponse(BaseModel):
    """Response após upload"""
    job_id: UUID
    status: str = "pending"
    estimated_time_minutes: float
    message: str


# Word Timestamp
class WordTimestamp(BaseModel):
    """Timestamp de palavra individual"""
    word: str
    start: float
    end: float
    confidence: float


# Segment Detail
class TranscriptionSegment(BaseModel):
    """Segmento de transcrição"""
    start: float
    end: float
    text: str
    confidence: float
    speaker: Optional[str] = None
    words: List[WordTimestamp] = []

    class Config:
        from_attributes = True


# Chapter Detail
class TranscriptionChapter(BaseModel):
    """Capítulo detectado"""
    title: str
    start: float
    end: float
    summary: Optional[str] = None

    class Config:
        from_attributes = True


# Export Format
class ExportFormat(BaseModel):
    """Formato de exportação disponível"""
    format: str  # txt, srt, vtt, json
    download_url: str
    file_size: int


# Status Response
class TranscriptionStatusResponse(BaseModel):
    """Response de status da transcrição"""
    job_id: UUID
    status: str
    progress: int = Field(ge=0, le=100)  # 0-100
    current_stage: Optional[str] = None
    error_message: Optional[str] = None

    # Quando completado:
    transcription_text: Optional[str] = None
    word_count: Optional[int] = None
    duration: Optional[float] = None
    speaker_count: Optional[int] = None

    # Downloads disponíveis
    exports: List[ExportFormat] = []

    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Segments Response
class TranscriptionSegmentsResponse(BaseModel):
    """Response com lista de segmentos"""
    segments: List[TranscriptionSegment]
    total_segments: int


# Chapters Response
class TranscriptionChaptersResponse(BaseModel):
    """Response com lista de capítulos"""
    chapters: List[TranscriptionChapter]


# Health Check
class HealthCheckResponse(BaseModel):
    """Response do health check"""
    status: str
    version: str
    services: dict


# Library/List Response
class TranscriptionListItem(BaseModel):
    """Item da lista de transcrições"""
    id: str
    title: str
    status: str
    progress: int
    duration: Optional[float] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    preview: Optional[str] = None  # Primeiras linhas da transcrição


class TranscriptionListResponse(BaseModel):
    """Response com lista de transcrições"""
    items: List[TranscriptionListItem]
    total: int
    limit: int
    offset: int


# Error Response
class ErrorResponse(BaseModel):
    """Response de erro"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
