"""
Transcription Status and Download Endpoints
"""

import logging
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.dependencies import get_db
from app.models.transcription import Transcription, TranscriptionSegment, TranscriptionChapter
from app.models.schemas import (
    TranscriptionStatusResponse,
    TranscriptionSegmentsResponse,
    TranscriptionChaptersResponse,
    TranscriptionListResponse,
    TranscriptionListItem,
    ExportFormat
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/transcriptions", response_model=TranscriptionListResponse)
async def list_transcriptions(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None, regex="^(pending|processing|completed|failed)$"),
):
    """
    Lista todas as transcrições

    Args:
        limit: Número máximo de resultados (1-100)
        offset: Número de resultados para pular
        status: Filtrar por status (opcional)
    """
    query = db.query(Transcription).order_by(desc(Transcription.created_at))

    # Filtrar por status se fornecido
    if status:
        query = query.filter(Transcription.status == status)

    # Contar total
    total = query.count()

    # Aplicar paginação
    transcriptions = query.offset(offset).limit(limit).all()

    # Converter para response
    items = []
    for t in transcriptions:
        items.append(TranscriptionListItem(
            id=t.id,
            title=t.original_filename.rsplit('.', 1)[0] if t.original_filename else f"Transcrição {t.id[:8]}",
            status=t.status,
            progress=t.progress,
            duration=t.duration,
            created_at=t.created_at.isoformat() if t.created_at else None,
            completed_at=t.completed_at.isoformat() if t.completed_at else None,
            preview=t.transcription_text[:200] if t.transcription_text else None,
        ))

    return TranscriptionListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/transcriptions/{job_id}", response_model=TranscriptionStatusResponse)
async def get_transcription_status(
    job_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Obtém status da transcrição

    - **job_id**: ID único do job
    """
    transcription = db.query(Transcription).filter(
        Transcription.id == str(job_id)
    ).first()

    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")

    # Preparar lista de exports disponíveis
    exports = []
    if transcription.status == "completed":
        # Exports fictícios - em produção você geraria os arquivos
        for fmt in ["txt", "srt", "vtt", "json"]:
            exports.append(ExportFormat(
                format=fmt,
                download_url=f"/api/v1/transcriptions/{job_id}/download?format={fmt}",
                file_size=len(transcription.transcription_text or "") if fmt == "txt" else 0
            ))

    return TranscriptionStatusResponse(
        job_id=UUID(transcription.id),
        status=transcription.status,
        progress=transcription.progress,
        current_stage=transcription.current_stage,
        error_message=transcription.error_message,
        transcription_text=transcription.transcription_text,
        word_count=transcription.word_count,
        duration=transcription.duration,
        speaker_count=transcription.speaker_count,
        exports=exports,
        created_at=transcription.created_at,
        completed_at=transcription.completed_at
    )


@router.get("/transcriptions/{job_id}/segments", response_model=TranscriptionSegmentsResponse)
async def get_transcription_segments(
    job_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Obtém segmentos detalhados da transcrição

    - **job_id**: ID único do job
    """
    transcription = db.query(Transcription).filter(
        Transcription.id == str(job_id)
    ).first()

    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")

    if transcription.status != "completed":
        raise HTTPException(status_code=422, detail="Transcrição ainda em processamento")

    # Buscar segmentos
    segments = db.query(TranscriptionSegment).filter(
        TranscriptionSegment.transcription_id == str(job_id)
    ).order_by(TranscriptionSegment.segment_index).all()

    return TranscriptionSegmentsResponse(
        segments=segments,
        total_segments=len(segments)
    )


@router.get("/transcriptions/{job_id}/chapters", response_model=TranscriptionChaptersResponse)
async def get_transcription_chapters(
    job_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Obtém capítulos detectados na transcrição

    - **job_id**: ID único do job
    """
    transcription = db.query(Transcription).filter(
        Transcription.id == str(job_id)
    ).first()

    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")

    if transcription.status != "completed":
        raise HTTPException(status_code=422, detail="Transcrição ainda em processamento")

    # Buscar capítulos
    chapters = db.query(TranscriptionChapter).filter(
        TranscriptionChapter.transcription_id == str(job_id)
    ).order_by(TranscriptionChapter.chapter_index).all()

    return TranscriptionChaptersResponse(
        chapters=chapters
    )


@router.get("/transcriptions/{job_id}/download")
async def download_transcription(
    job_id: UUID,
    format: str = Query("txt", regex="^(txt|srt|vtt|json)$"),
    db: Session = Depends(get_db)
):
    """
    Download da transcrição em formato específico

    - **job_id**: ID único do job
    - **format**: Formato de saída (txt, srt, vtt, json)
    """
    transcription = db.query(Transcription).filter(
        Transcription.id == str(job_id)
    ).first()

    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")

    if transcription.status != "completed":
        raise HTTPException(status_code=422, detail="Transcrição ainda em processamento")

    if format == "txt":
        # Retornar texto puro
        return JSONResponse(
            content={"text": transcription.transcription_text},
            media_type="application/json"
        )

    elif format == "json":
        # Retornar JSON completo
        segments = db.query(TranscriptionSegment).filter(
            TranscriptionSegment.transcription_id == str(job_id)
        ).order_by(TranscriptionSegment.segment_index).all()

        data = {
            "job_id": str(job_id),
            "text": transcription.transcription_text,
            "word_count": transcription.word_count,
            "duration": transcription.duration,
            "language": transcription.detected_language,
            "speaker_count": transcription.speaker_count,
            "segments": [
                {
                    "start": seg.start_time,
                    "end": seg.end_time,
                    "text": seg.text,
                    "confidence": seg.confidence,
                    "speaker": seg.speaker_label,
                    "words": seg.words
                }
                for seg in segments
            ]
        }

        return JSONResponse(content=data, media_type="application/json")

    elif format == "srt":
        # Gerar formato SRT (legendas)
        segments = db.query(TranscriptionSegment).filter(
            TranscriptionSegment.transcription_id == str(job_id)
        ).order_by(TranscriptionSegment.segment_index).all()

        srt_content = _generate_srt(segments)

        return JSONResponse(
            content={"srt": srt_content},
            media_type="application/json"
        )

    elif format == "vtt":
        # Gerar formato VTT (WebVTT)
        segments = db.query(TranscriptionSegment).filter(
            TranscriptionSegment.transcription_id == str(job_id)
        ).order_by(TranscriptionSegment.segment_index).all()

        vtt_content = _generate_vtt(segments)

        return JSONResponse(
            content={"vtt": vtt_content},
            media_type="application/json"
        )


def _generate_srt(segments) -> str:
    """Gera conteúdo SRT"""
    srt_lines = []

    for idx, seg in enumerate(segments, 1):
        start_time = _format_srt_time(seg.start_time)
        end_time = _format_srt_time(seg.end_time)

        srt_lines.append(f"{idx}")
        srt_lines.append(f"{start_time} --> {end_time}")
        srt_lines.append(seg.text)
        srt_lines.append("")  # Linha em branco

    return "\n".join(srt_lines)


def _generate_vtt(segments) -> str:
    """Gera conteúdo VTT"""
    vtt_lines = ["WEBVTT", ""]

    for seg in segments:
        start_time = _format_vtt_time(seg.start_time)
        end_time = _format_vtt_time(seg.end_time)

        vtt_lines.append(f"{start_time} --> {end_time}")
        vtt_lines.append(seg.text)
        vtt_lines.append("")

    return "\n".join(vtt_lines)


def _format_srt_time(seconds: float) -> str:
    """Formata tempo para SRT (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)

    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def _format_vtt_time(seconds: float) -> str:
    """Formata tempo para VTT (HH:MM:SS.mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)

    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


@router.delete("/transcriptions/{job_id}")
async def delete_transcription(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Deleta uma transcrição
    """
    transcription = db.query(Transcription).filter(Transcription.id == job_id).first()

    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")

    # Deletar do banco (cascade vai deletar segments, chapters, exports)
    db.delete(transcription)
    db.commit()

    return {"message": "Transcrição deletada com sucesso"}
