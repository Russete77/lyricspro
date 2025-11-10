"""
Celery tasks para processamento de transcrições
"""

import logging
import shutil
from pathlib import Path
from typing import Dict, Any
from datetime import datetime
from celery import Task
from sqlalchemy.orm import Session

from app.workers.celery_app import celery_app
from app.database import SessionLocal
from app.config import get_settings
from app.models.transcription import (
    Transcription,
    TranscriptionSegment,
    TranscriptionChapter
)
from app.workers.processors.audio_extractor import AudioExtractor
from app.workers.processors.noise_reducer import NoiseReducer
from app.workers.processors.vocal_separator import VocalSeparator
from app.workers.processors.diarizer import Diarizer
from app.workers.processors.transcriber import Transcriber
from app.workers.processors.punctuator import Punctuator
from app.workers.processors.post_processor import PostProcessor
from app.services.storage import get_storage_service

logger = logging.getLogger(__name__)
storage = get_storage_service()


class TranscriptionTask(Task):
    """Base task com tracking de progresso"""

    def update_progress(self, job_id: str, progress: int, stage: str):
        """Atualiza progresso no banco"""
        db = SessionLocal()
        try:
            transcription = db.query(Transcription).filter(
                Transcription.id == job_id
            ).first()

            if transcription:
                transcription.progress = progress
                transcription.current_stage = stage
                db.commit()
                logger.info(f"[{job_id}] Progresso: {progress}% - Stage: {stage}")

        except Exception as e:
            logger.error(f"Erro ao atualizar progresso: {e}")
        finally:
            db.close()


@celery_app.task(
    bind=True,
    base=TranscriptionTask,
    name="app.workers.tasks.process_transcription",
    max_retries=3,
    default_retry_delay=60
)
def process_transcription(
    self,
    job_id: str,
    storage_object_name: str,
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Pipeline completo de transcrição

    Args:
        job_id: UUID da transcrição
        storage_object_name: Nome do objeto no R2 Storage
        config: Configurações de processamento

    Returns:
        Dict com resultados finais
    """

    db = SessionLocal()
    temp_dir = Path(f"/tmp/transcriptions/{job_id}")
    temp_dir.mkdir(parents=True, exist_ok=True)

    start_time = datetime.utcnow()

    try:
        # Atualiza status inicial
        transcription = db.query(Transcription).filter(
            Transcription.id == job_id
        ).first()

        if not transcription:
            raise ValueError(f"Transcrição {job_id} não encontrada")

        transcription.status = "processing"
        transcription.started_at = start_time
        db.commit()

        logger.info(f"[{job_id}] Iniciando pipeline de transcrição")

        # Baixar arquivo do R2
        file_ext = Path(storage_object_name).suffix
        file_path = temp_dir / f"original{file_ext}"

        logger.info(f"[{job_id}] Baixando arquivo do R2: {storage_object_name}")
        storage.download_file(storage_object_name, file_path)
        logger.info(f"[{job_id}] Arquivo baixado: {file_path}")

        # =================================================================
        # STAGE 1: Extração de Áudio (0-15%)
        # =================================================================
        self.update_progress(job_id, 5, "audio_extraction")
        logger.info(f"[{job_id}] STAGE 1: Extração de áudio")

        extractor = AudioExtractor()
        audio_path = temp_dir / "audio.wav"

        audio_result = extractor.process(
            input_path=Path(file_path),
            output_path=audio_path,
            progress_callback=lambda p: self.update_progress(
                job_id, 5 + int(p * 0.1), "audio_extraction"
            )
        )

        transcription.duration = audio_result["duration"]
        db.commit()

        logger.info(f"[{job_id}] Áudio extraído: {audio_result['duration']:.2f}s")

        # =================================================================
        # STAGE 2: Redução de Ruído (15-25%)
        # =================================================================
        self.update_progress(job_id, 15, "noise_reduction")
        logger.info(f"[{job_id}] STAGE 2: Redução de ruído")

        reducer = NoiseReducer()
        audio_clean_path = temp_dir / "audio_clean.wav"

        reducer.process(
            input_path=audio_path,
            output_path=audio_clean_path,
            progress_callback=lambda p: self.update_progress(
                job_id, 15 + int(p * 0.1), "noise_reduction"
            )
        )

        logger.info(f"[{job_id}] Ruído reduzido")

        # =================================================================
        # STAGE 2.5: Separação Vocal (25-35%) - Opcional (para música)
        # =================================================================
        settings = get_settings()
        audio_for_transcription = audio_clean_path  # Por padrão usa áudio limpo

        logger.info(f"[{job_id}] 🔍 DEBUG: enable_vocal_separation = {settings.enable_vocal_separation}")
        logger.info(f"[{job_id}] 🔍 DEBUG: settings object = {settings}")

        if settings.enable_vocal_separation:
            self.update_progress(job_id, 25, "vocal_separation")
            logger.info(f"[{job_id}] STAGE 2.5: Separação Vocal (isolando voz)")

            separator = VocalSeparator()
            vocals_path = temp_dir / "vocals_only.wav"

            try:
                separator.process(
                    input_path=audio_clean_path,
                    output_path=vocals_path,
                    progress_callback=lambda p: self.update_progress(
                        job_id, 25 + int(p * 0.1), "vocal_separation"
                    )
                )

                # Usar vocals isolados para transcrição
                audio_for_transcription = vocals_path
                logger.info(f"[{job_id}] Vocals separados com sucesso - usando para transcrição")
            except Exception as e:
                logger.warning(f"[{job_id}] Separação vocal falhou: {e}")
                logger.warning(f"[{job_id}] Continuando com áudio original")
                # Em caso de erro, continua com áudio limpo normal
                audio_for_transcription = audio_clean_path
        else:
            logger.info(f"[{job_id}] STAGE 2.5: Separação vocal desabilitada")

        # =================================================================
        # STAGE 3: Diarização (35-45%) - Opcional
        # =================================================================
        speaker_segments = None
        if config.get("enable_diarization", False):
            self.update_progress(job_id, 35, "diarization")
            logger.info(f"[{job_id}] STAGE 3: Diarização")

            diarizer = Diarizer()
            diarization_result = diarizer.process(
                input_path=audio_clean_path,
                output_path=temp_dir / "diarization.json",
                progress_callback=lambda p: self.update_progress(
                    job_id, 35 + int(p * 0.1), "diarization"
                )
            )

            speaker_segments = diarization_result["segments"]
            transcription.speaker_count = diarization_result["speaker_count"]
            db.commit()

            logger.info(f"[{job_id}] Diarização: {transcription.speaker_count} speakers")
        else:
            logger.info(f"[{job_id}] STAGE 3: Diarização desabilitada")

        # =================================================================
        # STAGE 4: Transcrição (45-75%)
        # =================================================================
        self.update_progress(job_id, 45, "transcription")
        logger.info(f"[{job_id}] STAGE 4: Transcrição")

        transcriber = Transcriber(
            model_size=config.get("model_size", "large-v3"),
            language=config.get("language", "pt"),
            device=config.get("device", "cpu")
        )

        transcription_result = transcriber.process(
            input_path=audio_for_transcription,  # Usa vocals separados se disponível
            output_path=temp_dir / "transcription_raw.json",
            speaker_segments=speaker_segments,
            progress_callback=lambda p: self.update_progress(
                job_id, 45 + int(p * 0.3), "transcription"
            )
        )

        logger.info(f"[{job_id}] Transcrição concluída: {len(transcription_result['segments'])} segmentos")

        # Salvar segmentos no banco
        for idx, segment in enumerate(transcription_result["segments"]):
            db_segment = TranscriptionSegment(
                transcription_id=job_id,
                segment_index=idx,
                start_time=segment["start"],
                end_time=segment["end"],
                text=segment["text"],
                confidence=segment.get("confidence"),
                speaker_label=segment.get("speaker"),
                words=segment.get("words", [])
            )
            db.add(db_segment)

        transcription.detected_language = transcription_result.get("language")
        transcription.average_confidence = transcription_result.get("avg_confidence")
        db.commit()

        # =================================================================
        # STAGE 5: Pontuação (75-85%)
        # =================================================================
        self.update_progress(job_id, 75, "punctuation")
        logger.info(f"[{job_id}] STAGE 5: Pontuação")

        punctuator = Punctuator()
        punctuation_result = punctuator.process(
            input_path=temp_dir / "transcription_raw.json",
            output_path=temp_dir / "transcription_punctuated.json",
            progress_callback=lambda p: self.update_progress(
                job_id, 75 + int(p * 0.1), "punctuation"
            )
        )

        logger.info(f"[{job_id}] Pontuação aplicada")

        # =================================================================
        # STAGE 6: Pós-processamento (85-95%) - Opcional
        # =================================================================
        final_text = punctuation_result["text"]
        chapters = []

        if config.get("enable_post_processing", True):
            self.update_progress(job_id, 85, "post_processing")
            logger.info(f"[{job_id}] STAGE 6: Pós-processamento com IA")

            post_processor = PostProcessor()
            post_result = post_processor.process(
                input_path=temp_dir / "transcription_punctuated.json",
                output_path=temp_dir / "transcription_final.json",
                progress_callback=lambda p: self.update_progress(
                    job_id, 85 + int(p * 0.1), "post_processing"
                )
            )

            final_text = post_result["text"]
            chapters = post_result.get("chapters", [])

            # Salvar capítulos no banco
            for idx, chapter in enumerate(chapters):
                db_chapter = TranscriptionChapter(
                    transcription_id=job_id,
                    chapter_index=idx,
                    title=chapter.get("title", f"Capítulo {idx + 1}"),
                    start_time=0.0,  # Será calculado se tiver timestamps
                    end_time=transcription.duration or 0.0,
                    summary=chapter.get("summary")
                )
                db.add(db_chapter)

            db.commit()

            logger.info(f"[{job_id}] Pós-processamento concluído: {len(chapters)} capítulos")
        else:
            logger.info(f"[{job_id}] STAGE 6: Pós-processamento desabilitado")

        # =================================================================
        # STAGE 7: Finalização (95-100%)
        # =================================================================
        self.update_progress(job_id, 95, "finalization")
        logger.info(f"[{job_id}] STAGE 7: Finalização")

        # Salvar texto final
        transcription.transcription_text = final_text
        transcription.word_count = len(final_text.split())
        transcription.status = "completed"
        transcription.progress = 100
        transcription.completed_at = datetime.utcnow()

        # Calcular tempo de processamento
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        transcription.processing_time_seconds = processing_time

        db.commit()

        logger.info(f"[{job_id}] ✅ Transcrição concluída com sucesso!")
        logger.info(f"[{job_id}] Tempo de processamento: {processing_time:.2f}s")
        logger.info(f"[{job_id}] Palavras: {transcription.word_count}")

        return {
            "success": True,
            "job_id": job_id,
            "word_count": transcription.word_count,
            "duration": transcription.duration,
            "processing_time": processing_time
        }

    except Exception as e:
        logger.error(f"[{job_id}] ❌ Erro no processamento: {e}", exc_info=True)

        # Atualizar status de erro
        try:
            transcription = db.query(Transcription).filter(
                Transcription.id == job_id
            ).first()
            if transcription:
                transcription.status = "failed"
                transcription.error_message = str(e)
                transcription.completed_at = datetime.utcnow()
                db.commit()
        except Exception as db_error:
            logger.error(f"Erro ao atualizar status de falha: {db_error}")

        # Retry se não excedeu max_retries
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)

        raise

    finally:
        db.close()

        # Cleanup de arquivos temporários
        try:
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
                logger.info(f"[{job_id}] Arquivos temporários removidos")
        except Exception as cleanup_error:
            logger.warning(f"Erro ao limpar arquivos temporários: {cleanup_error}")
