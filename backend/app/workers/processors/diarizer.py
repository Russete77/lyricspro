"""
Diarizer - Identifica e separa diferentes speakers
"""

import logging
import json
from pathlib import Path
from typing import Dict, Any, Optional, Callable, List
from app.config import get_settings

logger = logging.getLogger(__name__)


class Diarizer:
    """
    Identifica e separa diferentes speakers

    Funcionalidades:
    - Detecção automática de número de speakers (1-10)
    - Segmentação por speaker
    - Timestamps precisos de cada fala
    - Clustering de vozes similares
    - Labels: SPEAKER_00, SPEAKER_01, etc

    Tecnologias:
    - pyannote.audio (modelo pre-trained)

    Output:
    - segments.json: [{start, end, speaker, confidence}]
    - speaker_count: int
    """

    def __init__(self, **kwargs):
        """Inicialização"""
        self.config = kwargs
        self.settings = get_settings()
        self.auth_token = kwargs.get("auth_token") or self.settings.pyannote_auth_token
        logger.info(f"{self.__class__.__name__} inicializado")

    def process(
        self,
        input_path: Path,
        output_path: Path,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> Dict[str, Any]:
        """
        Processa o arquivo de áudio para diarização

        Args:
            input_path: Caminho do arquivo de entrada
            output_path: Caminho do arquivo JSON de saída
            progress_callback: Função para reportar progresso (0-100)

        Returns:
            Dict com resultados e metadata

        Raises:
            ProcessingError: Se algo der errado
        """
        try:
            logger.info(f"Executando diarização em {input_path}")

            if progress_callback:
                progress_callback(10)

            # Import pyannote apenas quando necessário
            try:
                from pyannote.audio import Pipeline
            except ImportError:
                raise ProcessingError(
                    "pyannote.audio não instalado. "
                    "Instale com: pip install pyannote.audio"
                )

            if not self.auth_token:
                raise ProcessingError(
                    "Token HuggingFace não configurado. "
                    "Configure PYANNOTE_AUTH_TOKEN no .env"
                )

            if progress_callback:
                progress_callback(20)

            # Carregar pipeline de diarização
            logger.info("Carregando modelo de diarização...")
            pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=self.auth_token
            )

            if progress_callback:
                progress_callback(40)

            # Executar diarização
            logger.info("Processando diarização...")
            diarization = pipeline(str(input_path))

            if progress_callback:
                progress_callback(80)

            # Processar resultados
            segments: List[Dict[str, Any]] = []
            speakers = set()

            for turn, _, speaker in diarization.itertracks(yield_label=True):
                segments.append({
                    "start": float(turn.start),
                    "end": float(turn.end),
                    "speaker": speaker,
                    "confidence": 0.95  # pyannote não retorna confidence diretamente
                })
                speakers.add(speaker)

            # Salvar resultados
            result_data = {
                "segments": segments,
                "speaker_count": len(speakers),
                "speakers": sorted(list(speakers))
            }

            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result_data, f, indent=2, ensure_ascii=False)

            if progress_callback:
                progress_callback(100)

            logger.info(f"Diarização concluída: {len(speakers)} speaker(s) detectado(s)")
            logger.info(f"Total de segmentos: {len(segments)}")

            return {
                "success": True,
                "output_path": str(output_path),
                "segments": segments,
                "speaker_count": len(speakers),
                "speakers": sorted(list(speakers))
            }

        except Exception as e:
            logger.error(f"Erro na diarização: {e}", exc_info=True)
            raise ProcessingError(f"Falha em {self.__class__.__name__}: {e}")

    def cleanup(self):
        """Limpa recursos temporários"""
        pass


class ProcessingError(Exception):
    """Exceção customizada para erros de processamento"""
    pass
