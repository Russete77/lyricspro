"""
Upload Endpoints
"""

import logging
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.config import get_settings
from app.models.transcription import Transcription
from app.models.schemas import TranscriptionCreateResponse
from app.workers.tasks import process_transcription

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.post("/transcriptions/upload", response_model=TranscriptionCreateResponse, status_code=201)
async def upload_transcription(
    file: UploadFile = File(...),
    language: str = Form("pt"),
    model_size: str = Form(None),
    enable_diarization: bool = Form(False),
    enable_post_processing: bool = Form(True),
    webhook_url: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload de arquivo para transcrição

    - **file**: Arquivo de vídeo ou áudio
    - **language**: Idioma (pt, en, auto)
    - **model_size**: Tamanho do modelo Whisper
    - **enable_diarization**: Habilitar diarização (separação de speakers)
    - **enable_post_processing**: Habilitar pós-processamento com IA
    - **webhook_url**: URL para callback quando concluído
    """

    # Usar modelo do .env se não especificado
    if model_size is None:
        model_size = settings.whisper_model_size

    # Validar tamanho do arquivo
    file.file.seek(0, 2)  # Ir para o final
    file_size = file.file.tell()
    file.file.seek(0)  # Voltar ao início

    if file_size > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Arquivo muito grande. Máximo: {settings.max_file_size_mb}MB"
        )

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="Arquivo vazio"
        )

    # Validar formato
    file_ext = Path(file.filename).suffix.lower().replace(".", "")
    if file_ext not in settings.allowed_formats_list:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado. Formatos aceitos: {settings.allowed_formats}"
        )

    # Determinar tipo do arquivo
    video_formats = ["mp4", "avi", "mov", "mkv"]
    file_type = "video" if file_ext in video_formats else "audio"

    # Gerar ID único
    job_id = str(uuid.uuid4())

    # Salvar arquivo temporariamente
    upload_dir = Path("/tmp/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / f"{job_id}.{file_ext}"

    try:
        # Salvar arquivo
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        logger.info(f"Arquivo salvo: {file_path} ({file_size} bytes)")

    except Exception as e:
        logger.error(f"Erro ao salvar arquivo: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar upload")

    # Criar registro no banco
    transcription = Transcription(
        id=job_id,
        user_id=str(uuid.uuid4()),  # TODO: Implementar autenticação
        original_filename=file.filename,
        file_type=file_type,
        file_size=file_size,
        storage_path=str(file_path),
        language=language,
        model_size=model_size,
        enable_diarization=enable_diarization,
        enable_post_processing=enable_post_processing,
        status="pending",
        progress=0
    )

    db.add(transcription)
    db.commit()
    db.refresh(transcription)

    logger.info(f"Transcrição criada: {job_id}")

    # Enviar para fila de processamento
    config = {
        "language": language,
        "model_size": model_size,
        "device": settings.whisper_device,
        "enable_diarization": enable_diarization,
        "enable_post_processing": enable_post_processing,
        "webhook_url": webhook_url
    }

    try:
        process_transcription.delay(job_id, str(file_path), config)
        logger.info(f"Job enviado para processamento: {job_id}")
    except Exception as e:
        logger.error(f"Erro ao enviar job para fila: {e}")
        transcription.status = "failed"
        transcription.error_message = f"Erro ao iniciar processamento: {e}"
        db.commit()
        raise HTTPException(status_code=500, detail="Erro ao iniciar processamento")

    # Estimar tempo de processamento (aproximado)
    # ~1 minuto de processamento para cada 5 minutos de áudio
    estimated_time = 2.0  # Tempo padrão

    return TranscriptionCreateResponse(
        job_id=uuid.UUID(job_id),
        status="pending",
        estimated_time_minutes=estimated_time,
        message="Transcrição iniciada com sucesso"
    )
