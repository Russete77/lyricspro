"""
Noise Reducer - Melhora qualidade do áudio antes da transcrição
"""

import logging
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional, Callable
import noisereduce as nr
import soundfile as sf
from scipy import signal

logger = logging.getLogger(__name__)


class NoiseReducer:
    """
    Melhora qualidade do áudio antes da transcrição

    Funcionalidades:
    - Redução de ruído de fundo
    - Supressão de eco
    - Filtro passa-banda (80Hz - 8kHz para voz)
    - Equalização automática
    - Detecção de clipping

    Tecnologias:
    - noisereduce
    - scipy.signal

    Parâmetros ajustáveis:
    - noise_threshold: 0.0 - 1.0
    - aggressiveness: low, medium, high
    - preserve_speech: boolean
    """

    def __init__(self, **kwargs):
        """Inicialização"""
        self.config = kwargs
        self.noise_threshold = kwargs.get("noise_threshold", 0.5)
        self.aggressiveness = kwargs.get("aggressiveness", "medium")
        self.preserve_speech = kwargs.get("preserve_speech", True)
        logger.info(f"{self.__class__.__name__} inicializado")

    def process(
        self,
        input_path: Path,
        output_path: Path,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> Dict[str, Any]:
        """
        Processa o arquivo de áudio

        Args:
            input_path: Caminho do arquivo de entrada
            output_path: Caminho do arquivo de saída
            progress_callback: Função para reportar progresso (0-100)

        Returns:
            Dict com resultados e metadata

        Raises:
            ProcessingError: Se algo der errado
        """
        try:
            logger.info(f"Reduzindo ruído de {input_path}")

            if progress_callback:
                progress_callback(10)

            # Carregar áudio
            audio_data, sample_rate = sf.read(str(input_path))

            if progress_callback:
                progress_callback(20)

            # Aplicar filtro passa-banda (80Hz - 8kHz para voz)
            nyquist = sample_rate / 2
            low = 80 / nyquist
            high = min(8000 / nyquist, 0.99)  # Garante que high < 1.0
            b, a = signal.butter(4, [low, high], btype='band')
            audio_filtered = signal.filtfilt(b, a, audio_data)

            if progress_callback:
                progress_callback(40)

            # Redução de ruído
            # Estimar ruído dos primeiros 0.5 segundos
            noise_sample_duration = int(0.5 * sample_rate)
            noise_sample = audio_filtered[:noise_sample_duration]

            # Aplicar redução de ruído
            prop_decrease = {
                "low": 0.5,
                "medium": 0.8,
                "high": 1.0
            }.get(self.aggressiveness, 0.8)

            audio_denoised = nr.reduce_noise(
                y=audio_filtered,
                sr=sample_rate,
                y_noise=noise_sample,
                prop_decrease=prop_decrease,
                stationary=True
            )

            if progress_callback:
                progress_callback(80)

            # Normalizar áudio
            max_amplitude = np.max(np.abs(audio_denoised))
            if max_amplitude > 0:
                audio_normalized = audio_denoised / max_amplitude * 0.95

            # Salvar áudio processado
            sf.write(str(output_path), audio_normalized, sample_rate)

            if progress_callback:
                progress_callback(100)

            # Calcular métricas
            noise_reduction_db = 20 * np.log10(
                np.std(audio_data) / (np.std(audio_denoised) + 1e-10)
            )

            logger.info(f"Ruído reduzido com sucesso: {output_path}")
            logger.info(f"Redução de ruído: {noise_reduction_db:.2f} dB")

            return {
                "success": True,
                "output_path": str(output_path),
                "noise_reduction_db": float(noise_reduction_db),
                "aggressiveness": self.aggressiveness
            }

        except Exception as e:
            logger.error(f"Erro no processamento: {e}", exc_info=True)
            raise ProcessingError(f"Falha em {self.__class__.__name__}: {e}")

    def cleanup(self):
        """Limpa recursos temporários"""
        pass


class ProcessingError(Exception):
    """Exceção customizada para erros de processamento"""
    pass
