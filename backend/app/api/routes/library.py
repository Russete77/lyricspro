"""
API Routes - Library (Lista de transcrições)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.transcription import Transcription
from app.models.schemas import TranscriptionListResponse, TranscriptionListItem

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
            title=t.original_filename.rsplit('.', 1)[0],  # Remove extensão
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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")

    # Deletar do banco (cascade vai deletar segments, chapters, exports)
    db.delete(transcription)
    db.commit()

    return {"message": "Transcrição deletada com sucesso"}
