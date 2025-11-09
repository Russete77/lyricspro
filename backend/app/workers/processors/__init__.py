"""
Processadores de áudio/vídeo
"""

from app.workers.processors.audio_extractor import AudioExtractor
from app.workers.processors.noise_reducer import NoiseReducer
from app.workers.processors.diarizer import Diarizer
from app.workers.processors.transcriber import Transcriber
from app.workers.processors.punctuator import Punctuator
from app.workers.processors.post_processor import PostProcessor

__all__ = [
    "AudioExtractor",
    "NoiseReducer",
    "Diarizer",
    "Transcriber",
    "Punctuator",
    "PostProcessor"
]
