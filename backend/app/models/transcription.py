"""
SQLAlchemy Models para Transcrições
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text,
    TIMESTAMP, Index, ForeignKey, BigInteger, DECIMAL, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base


class Transcription(Base):
    """Modelo principal de transcrições"""
    __tablename__ = "transcriptions"

    # Primary Key (String para compatibilidade SQLite)
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, default=lambda: str(uuid.uuid4()))

    # Arquivo original
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False)  # 'video' ou 'audio'
    file_size = Column(BigInteger, nullable=False)
    duration = Column(Float)  # em segundos
    storage_path = Column(Text, nullable=False)

    # Status do processamento
    status = Column(String(20), nullable=False, default="pending")
    # pending, processing, completed, failed
    progress = Column(Integer, default=0)  # 0-100
    current_stage = Column(String(50))
    error_message = Column(Text)

    # Configurações
    language = Column(String(10), default="pt")
    model_size = Column(String(20), default="large-v3")
    enable_diarization = Column(Boolean, default=False)
    enable_post_processing = Column(Boolean, default=True)

    # Resultados
    transcription_text = Column(Text)
    word_count = Column(Integer)
    average_confidence = Column(Float)
    detected_language = Column(String(10))
    speaker_count = Column(Integer)

    # Metadados
    processing_time_seconds = Column(Float)
    gpu_used = Column(Boolean)
    cost_credits = Column(DECIMAL(10, 2))

    # Timestamps
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    started_at = Column(TIMESTAMP)
    completed_at = Column(TIMESTAMP)

    # Relationships
    segments = relationship(
        "TranscriptionSegment",
        back_populates="transcription",
        cascade="all, delete-orphan"
    )
    chapters = relationship(
        "TranscriptionChapter",
        back_populates="transcription",
        cascade="all, delete-orphan"
    )
    exports = relationship(
        "TranscriptionExport",
        back_populates="transcription",
        cascade="all, delete-orphan"
    )

    # Indexes
    __table_args__ = (
        Index('idx_user_id', 'user_id'),
        Index('idx_status', 'status'),
        Index('idx_created_at', 'created_at'),
    )


class TranscriptionSegment(Base):
    """Segmentos de transcrição (para navegação)"""
    __tablename__ = "transcription_segments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transcription_id = Column(
        String(36),
        ForeignKey('transcriptions.id', ondelete='CASCADE'),
        nullable=False
    )

    segment_index = Column(Integer, nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    confidence = Column(Float)
    speaker_label = Column(String(50))

    # Word-level timestamps (JSON para compatibilidade SQLite/PostgreSQL)
    words = Column(JSON)

    # Relationship
    transcription = relationship("Transcription", back_populates="segments")

    # Indexes
    __table_args__ = (
        Index('idx_segments_transcription_id', 'transcription_id'),
    )


class TranscriptionChapter(Base):
    """Capítulos detectados"""
    __tablename__ = "transcription_chapters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transcription_id = Column(
        String(36),
        ForeignKey('transcriptions.id', ondelete='CASCADE'),
        nullable=False
    )

    chapter_index = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    summary = Column(Text)

    # Relationship
    transcription = relationship("Transcription", back_populates="chapters")

    # Indexes
    __table_args__ = (
        Index('idx_chapters_transcription_id', 'transcription_id'),
    )


class TranscriptionExport(Base):
    """Arquivos exportados"""
    __tablename__ = "transcription_exports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transcription_id = Column(
        String(36),
        ForeignKey('transcriptions.id', ondelete='CASCADE'),
        nullable=False
    )

    format = Column(String(10), nullable=False)  # 'txt', 'srt', 'vtt', 'json'
    file_path = Column(Text, nullable=False)
    file_size = Column(BigInteger, nullable=False)

    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationship
    transcription = relationship("Transcription", back_populates="exports")

    # Indexes
    __table_args__ = (
        Index('idx_exports_transcription_id', 'transcription_id'),
    )
