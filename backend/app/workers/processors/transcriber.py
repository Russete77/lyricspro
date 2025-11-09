"""
Transcriber - Core da transcrição usando faster-whisper
"""

import logging
import json
from pathlib import Path
from typing import Dict, Any, Optional, Callable, List
from app.config import get_settings

logger = logging.getLogger(__name__)


class Transcriber:
    """
    Core da transcrição usando faster-whisper

    Funcionalidades:
    - Transcrição multi-idioma (foco PT-BR)
    - Word-level timestamps
    - Confiança por palavra/segmento
    - Detecção automática de idioma
    - Suporte a modelos: tiny, base, small, medium, large-v3
    - Beam search otimizado
    - Quantização INT8 para economia de memória

    Parâmetros:
    - model_size: "large-v3" (padrão)
    - language: "pt" ou "auto"
    - beam_size: 5 (padrão)
    - temperature: 0.0 - 1.0

    Otimizações:
    - GPU obrigatória (CUDA)
    - Batch processing de chunks
    - Cache de modelo em memória
    - Processamento paralelo quando possível
    """

    def __init__(self, **kwargs):
        """Inicialização"""
        self.settings = get_settings()
        self.model_size = kwargs.get("model_size", self.settings.whisper_model_size)
        self.language = kwargs.get("language", "pt")
        self.device = kwargs.get("device", self.settings.whisper_device)
        self.compute_type = kwargs.get("compute_type", self.settings.whisper_compute_type)

        # Parâmetros de transcrição
        self.beam_size = kwargs.get("beam_size", 5)
        self.best_of = kwargs.get("best_of", 5)
        self.temperature = kwargs.get("temperature", 0.0)

        self._model = None
        logger.info(f"{self.__class__.__name__} inicializado")
        logger.info(f"Modelo: {self.model_size}, Device: {self.device}")

    def _load_model(self):
        """Carrega modelo faster-whisper (lazy loading)"""
        if self._model is not None:
            return self._model

        try:
            from faster_whisper import WhisperModel
        except ImportError:
            raise ProcessingError(
                "faster-whisper não instalado. "
                "Instale com: pip install faster-whisper"
            )

        logger.info(f"Carregando modelo Whisper: {self.model_size}...")

        # Preparar kwargs para WhisperModel
        model_kwargs = {
            "model_size_or_path": self.model_size,
            "device": self.device,
            "compute_type": self.compute_type,
            "download_root": None,  # Usa cache padrão
            "local_files_only": False  # Permite baixar se necessário
        }

        # Adicionar token se disponível
        if self.settings.huggingface_token:
            model_kwargs["use_auth_token"] = self.settings.huggingface_token
            logger.info("Usando token HuggingFace para autenticação")

        try:
            self._model = WhisperModel(**model_kwargs)
            logger.info("Modelo carregado com sucesso")
            return self._model
        except Exception as e:
            # Fallback para CPU se GPU falhar
            if self.device == "cuda":
                logger.warning(f"GPU falhou, tentando CPU: {e}")
                self.device = "cpu"
                model_kwargs["device"] = "cpu"
                model_kwargs["compute_type"] = "int8"
                self._model = WhisperModel(**model_kwargs)
                return self._model
            raise

    def process(
        self,
        input_path: Path,
        output_path: Path,
        speaker_segments: Optional[List[Dict]] = None,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> Dict[str, Any]:
        """
        Processa o arquivo de áudio

        Args:
            input_path: Caminho do arquivo de entrada
            output_path: Caminho do arquivo JSON de saída
            speaker_segments: Segmentos de diarização (opcional)
            progress_callback: Função para reportar progresso (0-100)

        Returns:
            Dict com resultados e metadata

        Raises:
            ProcessingError: Se algo der errado
        """
        try:
            logger.info(f"Transcrevendo {input_path}")

            if progress_callback:
                progress_callback(5)

            # Carregar modelo
            model = self._load_model()

            if progress_callback:
                progress_callback(10)

            # Executar transcrição
            logger.info("Iniciando transcrição...")
            segments_list = []
            total_confidence = 0.0
            segment_count = 0

            # Determinar idioma
            language = None if self.language == "auto" else self.language

            # Transcrever com configuração padrão otimizada
            segments, info = model.transcribe(
                str(input_path),
                language=language,
                beam_size=self.beam_size,
                best_of=self.best_of,
                temperature=self.temperature,
                word_timestamps=True,
                vad_filter=True,
                vad_parameters=dict(
                    min_silence_duration_ms=500,
                    threshold=0.5,
                    min_speech_duration_ms=250,
                    speech_pad_ms=400
                )
            )

            detected_language = info.language
            logger.info(f"Idioma detectado: {detected_language}")

            # Processar segmentos
            for idx, segment in enumerate(segments):
                # Processar words
                words = []
                if hasattr(segment, 'words') and segment.words:
                    for word in segment.words:
                        words.append({
                            "word": word.word,
                            "start": float(word.start),
                            "end": float(word.end),
                            "confidence": float(word.probability)
                        })

                # Associar speaker se disponível
                speaker = None
                if speaker_segments:
                    segment_middle = (segment.start + segment.end) / 2
                    for spk_seg in speaker_segments:
                        if spk_seg["start"] <= segment_middle <= spk_seg["end"]:
                            speaker = spk_seg["speaker"]
                            break

                seg_data = {
                    "start": float(segment.start),
                    "end": float(segment.end),
                    "text": segment.text.strip(),
                    "confidence": float(segment.avg_logprob),
                    "speaker": speaker,
                    "words": words
                }

                segments_list.append(seg_data)
                total_confidence += seg_data["confidence"]
                segment_count += 1

                # Atualizar progresso
                if progress_callback and segment_count % 10 == 0:
                    # Progresso de 10% a 90%
                    progress = min(90, 10 + int((segment_count / max(1, segment_count)) * 80))
                    progress_callback(progress)

            # Calcular confiança média
            avg_confidence = total_confidence / max(1, segment_count)

            # Combinar texto completo
            full_text = " ".join([seg["text"] for seg in segments_list])

            # Salvar resultado
            result_data = {
                "segments": segments_list,
                "text": full_text,
                "language": detected_language,
                "avg_confidence": avg_confidence,
                "segment_count": segment_count
            }

            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result_data, f, indent=2, ensure_ascii=False)

            if progress_callback:
                progress_callback(100)

            logger.info(f"Transcrição concluída: {segment_count} segmentos")
            logger.info(f"Confiança média: {avg_confidence:.2f}")

            return {
                "success": True,
                "output_path": str(output_path),
                "segments": segments_list,
                "text": full_text,
                "language": detected_language,
                "avg_confidence": avg_confidence
            }

        except Exception as e:
            logger.error(f"Erro na transcrição: {e}", exc_info=True)
            raise ProcessingError(f"Falha em {self.__class__.__name__}: {e}")

    def cleanup(self):
        """Limpa recursos temporários"""
        # Modelo fica em cache para próximas transcrições
        pass


class ProcessingError(Exception):
    """Exceção customizada para erros de processamento"""
    pass
