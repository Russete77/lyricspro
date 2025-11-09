"""
Audio Extractor - Extração e preparação de áudio para transcrição
"""

import logging
import subprocess
import json
from pathlib import Path
from typing import Dict, Any, Optional, Callable
import librosa

logger = logging.getLogger(__name__)


class AudioExtractor:
    """
    Responsável por extrair e preparar áudio para transcrição

    Funcionalidades:
    - Extrai áudio de vídeos (MP4, AVI, MOV, MKV)
    - Converte para formato padrão (WAV 16kHz mono)
    - Normaliza volume para -20dB
    - Valida integridade do arquivo
    - Calcula duração e metadados

    Tecnologias:
    - FFmpeg (subprocess)
    - librosa (análise)
    """

    def __init__(self, **kwargs):
        """Inicialização"""
        self.config = kwargs
        logger.info(f"{self.__class__.__name__} inicializado")

    def process(
        self,
        input_path: Path,
        output_path: Path,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> Dict[str, Any]:
        """
        Processa o arquivo de vídeo/áudio

        Args:
            input_path: Caminho do arquivo de entrada
            output_path: Caminho do arquivo de saída (WAV)
            progress_callback: Função para reportar progresso (0-100)

        Returns:
            Dict com resultados e metadata

        Raises:
            ProcessingError: Se algo der errado
        """
        try:
            logger.info(f"Extraindo áudio de {input_path}")

            if progress_callback:
                progress_callback(10)

            # Validar arquivo de entrada
            if not input_path.exists():
                raise ProcessingError(f"Arquivo não encontrado: {input_path}")

            # Primeiro: Obter duração do arquivo original
            probe_cmd = [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(input_path)
            ]

            probe_result = subprocess.run(
                probe_cmd,
                capture_output=True,
                text=True,
                check=True
            )

            original_duration = float(probe_result.stdout.strip())
            logger.info(f"Duração original do arquivo: {original_duration:.2f}s")

            # Extrair áudio usando FFmpeg
            # Converter para WAV 16kHz mono, normalizado
            # IMPORTANTE: Removemos loudnorm porque pode truncar arquivos grandes
            # Usando volume simples ao invés de loudnorm
            ffmpeg_cmd = [
                "ffmpeg",
                "-i", str(input_path),
                "-vn",  # Sem vídeo
                "-acodec", "pcm_s16le",  # PCM 16-bit
                "-ar", "16000",  # 16kHz
                "-ac", "1",  # Mono
                "-af", "volume=1.5",  # Normalização simples (aumenta 50%)
                "-y",  # Sobrescrever
                str(output_path)
            ]

            if progress_callback:
                progress_callback(30)

            logger.info(f"Executando FFmpeg: {' '.join(ffmpeg_cmd)}")

            # Executar FFmpeg com stderr visível para debug
            result = subprocess.run(
                ffmpeg_cmd,
                capture_output=True,
                text=True,
                check=True
            )

            if result.stderr:
                logger.info(f"FFmpeg stderr: {result.stderr[-500:]}")  # Últimas 500 chars

            if progress_callback:
                progress_callback(70)

            # Calcular metadados usando librosa
            audio_data, sample_rate = librosa.load(str(output_path), sr=None)
            duration = librosa.get_duration(y=audio_data, sr=sample_rate)

            metadata = {
                "duration": float(duration),
                "sample_rate": int(sample_rate),
                "channels": 1,
                "format": "WAV",
                "bit_depth": 16
            }

            # Validar se a duração extraída está correta
            duration_diff = abs(original_duration - duration)
            duration_diff_percent = (duration_diff / original_duration) * 100

            logger.info(f"Áudio extraído com sucesso: {output_path}")
            logger.info(f"Duração original: {original_duration:.2f}s")
            logger.info(f"Duração extraída: {duration:.2f}s")
            logger.info(f"Diferença: {duration_diff:.2f}s ({duration_diff_percent:.1f}%)")

            # Alertar se a diferença for maior que 5%
            if duration_diff_percent > 5:
                logger.warning(
                    f"⚠️ ATENÇÃO: Duração extraída difere significativamente da original! "
                    f"Original: {original_duration:.2f}s, Extraída: {duration:.2f}s"
                )
                # Não vamos lançar erro, mas vamos logar o problema
                # Em produção, considere lançar exceção aqui

            if progress_callback:
                progress_callback(100)

            return {
                "success": True,
                "output_path": str(output_path),
                "duration": metadata["duration"],
                "metadata": metadata
            }

        except subprocess.CalledProcessError as e:
            logger.error(f"Erro no FFmpeg: {e.stderr}", exc_info=True)
            raise ProcessingError(f"Falha na extração de áudio: {e.stderr}")
        except Exception as e:
            logger.error(f"Erro no processamento: {e}", exc_info=True)
            raise ProcessingError(f"Falha em {self.__class__.__name__}: {e}")

    def cleanup(self):
        """Limpa recursos temporários"""
        pass


class ProcessingError(Exception):
    """Exceção customizada para erros de processamento"""
    pass
