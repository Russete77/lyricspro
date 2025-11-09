#!/usr/bin/env python3
"""
Script para download de modelos de IA

Este script faz o download prévio de todos os modelos necessários:
- Whisper models (faster-whisper)
- pyannote.audio models
- deepmultilingualpunctuation models
- spaCy models
"""

import sys
import os
from pathlib import Path

# Adicionar backend ao path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

print("=" * 60)
print("TranscritorAI Pro - Download de Modelos")
print("=" * 60)
print()


def download_whisper_models():
    """Download modelos Whisper"""
    print("📥 Baixando modelos Whisper...")

    try:
        from faster_whisper import WhisperModel

        models = ["base", "small", "medium", "large-v3"]

        for model_name in models:
            print(f"  → Baixando {model_name}...")
            try:
                model = WhisperModel(
                    model_name,
                    device="cpu",
                    compute_type="int8",
                    download_root=None  # Usa cache padrão
                )
                print(f"  ✓ {model_name} baixado com sucesso")
                del model  # Liberar memória

            except Exception as e:
                print(f"  ❌ Erro ao baixar {model_name}: {e}")

    except ImportError:
        print("  ❌ faster-whisper não instalado")
        print("     Instale com: pip install faster-whisper")


def download_pyannote_models():
    """Download modelos pyannote.audio"""
    print("\n📥 Baixando modelos pyannote.audio...")

    try:
        from pyannote.audio import Pipeline

        # Verificar se tem token configurado
        token = os.getenv("PYANNOTE_AUTH_TOKEN")

        if not token:
            print("  ⚠ PYANNOTE_AUTH_TOKEN não configurado")
            print("    Configure no .env para baixar modelos de diarização")
            print("    Obtenha em: https://huggingface.co/settings/tokens")
            return

        print("  → Baixando modelo de diarização...")
        try:
            pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=token
            )
            print("  ✓ Modelo de diarização baixado com sucesso")
            del pipeline

        except Exception as e:
            print(f"  ❌ Erro ao baixar modelo: {e}")

    except ImportError:
        print("  ❌ pyannote.audio não instalado")
        print("     Instale com: pip install pyannote.audio")


def download_punctuation_models():
    """Download modelos de pontuação"""
    print("\n📥 Baixando modelos de pontuação...")

    try:
        from deepmultilingualpunctuation import PunctuationModel

        print("  → Baixando modelo de pontuação...")
        try:
            model = PunctuationModel()
            print("  ✓ Modelo de pontuação baixado com sucesso")
            del model

        except Exception as e:
            print(f"  ❌ Erro ao baixar modelo: {e}")

    except ImportError:
        print("  ❌ deepmultilingualpunctuation não instalado")
        print("     Instale com: pip install deepmultilingualpunctuation")


def download_spacy_models():
    """Download modelos spaCy"""
    print("\n📥 Verificando modelos spaCy...")

    try:
        import spacy

        # Verificar se modelo PT-BR está instalado
        try:
            nlp = spacy.load("pt_core_news_sm")
            print("  ✓ Modelo PT-BR já instalado")
            del nlp

        except OSError:
            print("  → Baixando modelo PT-BR...")
            import subprocess

            result = subprocess.run(
                [sys.executable, "-m", "spacy", "download", "pt_core_news_sm"],
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                print("  ✓ Modelo PT-BR baixado com sucesso")
            else:
                print(f"  ❌ Erro ao baixar modelo: {result.stderr}")

    except ImportError:
        print("  ❌ spaCy não instalado")
        print("     Instale com: pip install spacy")


def main():
    """Função principal"""
    print("Iniciando download de modelos...\n")

    # Download dos modelos
    download_whisper_models()
    download_pyannote_models()
    download_punctuation_models()
    download_spacy_models()

    # Resumo final
    print("\n" + "=" * 60)
    print("✓ Download de modelos concluído!")
    print("=" * 60)
    print()
    print("Modelos baixados para o cache local:")
    print("  → Whisper: ~/.cache/huggingface/hub/")
    print("  → pyannote: ~/.cache/torch/hub/")
    print("  → spaCy: site-packages/pt_core_news_sm/")
    print()
    print("Espaço em disco aproximado: 5-10 GB")
    print()
    print("Dica: Monte um volume Docker para /root/.cache/")
    print("      para compartilhar os modelos entre containers")
    print()


if __name__ == "__main__":
    main()
