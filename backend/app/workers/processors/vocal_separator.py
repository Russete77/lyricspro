"""
VocalSeparator - Separação de voz e instrumentos usando Demucs
"""

import logging
import torch
from pathlib import Path
from typing import Dict, Any, Optional, Callable

logger = logging.getLogger(__name__)


class VocalSeparator:
    """
    Separa voz de instrumentos em músicas usando Demucs

    Funcionalidades:
    - Isola vocals de música com banda
    - Remove instrumentos, mantendo apenas voz
    - Melhora drasticamente transcrição de músicas
    - Usa modelo htdemucs (melhor qualidade)

    Tecnologias:
    - Demucs (Meta AI)
    - PyTorch
    """

    def __init__(self, **kwargs):
        """Inicialização"""
        self.config = kwargs
        self.model = None
        logger.info(f"{self.__class__.__name__} inicializado")

    def _load_model(self):
        """Carrega modelo Demucs (lazy loading)"""
        if self.model is not None:
            return self.model

        try:
            from demucs.pretrained import get_model
            from demucs.apply import apply_model
        except ImportError:
            raise ProcessingError(
                "demucs não instalado. "
                "Instale com: pip install demucs"
            )

        logger.info("Carregando modelo Demucs (htdemucs)...")

        # Usar htdemucs (melhor qualidade)
        # Detectar automaticamente GPU se disponível
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Dispositivo detectado: {device}")

        try:
            self.model = get_model("htdemucs")
            self.model.to(device)
            self.model.eval()
            logger.info(f"Modelo Demucs carregado em {device}")
            if device == "cuda":
                logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
            return self.model
        except Exception as e:
            logger.error(f"Erro ao carregar Demucs: {e}")
            raise ProcessingError(f"Falha ao carregar modelo Demucs: {e}")

    def process(
        self,
        input_path: Path,
        output_path: Path,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> Dict[str, Any]:
        """
        Separa vocals da música

        Args:
            input_path: Caminho do arquivo de entrada (áudio com banda)
            output_path: Caminho do arquivo de saída (só vocals)
            progress_callback: Função para reportar progresso (0-100)

        Returns:
            Dict com resultados e metadata

        Raises:
            ProcessingError: Se algo der errado
        """
        try:
            logger.info(f"Separando vocals de {input_path}")

            if progress_callback:
                progress_callback(10)

            # Validar arquivo de entrada
            if not input_path.exists():
                raise ProcessingError(f"Arquivo não encontrado: {input_path}")

            # Carregar modelo
            model = self._load_model()

            if progress_callback:
                progress_callback(20)

            # Carregar áudio usando soundfile (evita problemas com libtorchcodec)
            try:
                import soundfile as sf
                import numpy as np

                # Ler arquivo com soundfile
                audio_data, sr = sf.read(str(input_path), dtype='float32')

                # Converter para tensor PyTorch
                wav = torch.from_numpy(audio_data.T)  # Transpose para (channels, samples)

                # Se mono, garantir que tem dimensão de canal
                if wav.dim() == 1:
                    wav = wav.unsqueeze(0)

                logger.info(f"Áudio carregado: {wav.shape}, sample_rate={sr}")

            except ImportError:
                logger.warning("soundfile não disponível, tentando torchaudio...")
                import torchaudio
                wav, sr = torchaudio.load(str(input_path))
                logger.info(f"Áudio carregado com torchaudio: {wav.shape}, sample_rate={sr}")

            if progress_callback:
                progress_callback(30)

            # Resample para 44.1kHz se necessário (Demucs espera isso)
            if sr != 44100:
                logger.info(f"Resampling de {sr}Hz para 44100Hz")
                import torchaudio.transforms
                resampler = torchaudio.transforms.Resample(sr, 44100)
                wav = resampler(wav)
                sr = 44100

            if progress_callback:
                progress_callback(40)

            # Garantir stereo (Demucs espera 2 canais)
            if wav.shape[0] == 1:
                wav = wav.repeat(2, 1)

            # Normalizar
            wav = wav / wav.abs().max()

            if progress_callback:
                progress_callback(50)

            # Aplicar modelo Demucs
            logger.info("Aplicando separação de fontes...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            with torch.no_grad():
                from demucs.apply import apply_model
                sources = apply_model(
                    model,
                    wav.unsqueeze(0),  # Add batch dimension
                    device=device,
                    split=True,  # Processa em chunks para economizar memória
                    overlap=0.25
                )

            if progress_callback:
                progress_callback(80)

            # Extrair vocals (índice 3 no htdemucs)
            # htdemucs retorna: [drums, bass, other, vocals]
            vocals = sources[0, 3]  # Batch 0, canal vocals

            logger.info(f"Vocals extraídos: {vocals.shape}")

            # Salvar vocals usando soundfile (evita problemas com codec)
            try:
                import soundfile as sf
                # Converter de (channels, samples) para (samples, channels)
                vocals_numpy = vocals.cpu().numpy().T
                sf.write(str(output_path), vocals_numpy, sr, format='WAV')
                logger.info(f"Vocals salvos com soundfile")
            except ImportError:
                # Fallback para torchaudio se soundfile não disponível
                import torchaudio
                torchaudio.save(str(output_path), vocals.cpu(), sr, format="wav")
                logger.info(f"Vocals salvos com torchaudio")

            if progress_callback:
                progress_callback(100)

            logger.info(f"Vocals salvos em: {output_path}")

            return {
                "success": True,
                "output_path": str(output_path),
                "sample_rate": sr,
                "channels": vocals.shape[0]
            }

        except Exception as e:
            logger.error(f"Erro na separação vocal: {e}", exc_info=True)
            raise ProcessingError(f"Falha em {self.__class__.__name__}: {e}")

    def cleanup(self):
        """Limpa recursos temporários"""
        if self.model is not None:
            del self.model
            self.model = None

            # Limpar cache GPU se disponível
            if torch.cuda.is_available():
                torch.cuda.empty_cache()


class ProcessingError(Exception):
    """Exceção customizada para erros de processamento"""
    pass
