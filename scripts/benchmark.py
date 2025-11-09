#!/usr/bin/env python3
"""
Script de benchmark de performance

Testa a performance do sistema de transcrição com diferentes configurações:
- CPU vs GPU
- Diferentes tamanhos de modelo
- Com e sem diarização
- Com e sem pós-processamento
"""

import sys
import time
import json
from pathlib import Path
from typing import Dict, Any, List

# Adicionar backend ao path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

print("=" * 70)
print("TranscritorAI Pro - Benchmark de Performance")
print("=" * 70)
print()


def format_time(seconds: float) -> str:
    """Formata segundos em formato legível"""
    if seconds < 60:
        return f"{seconds:.2f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        secs = seconds % 60
        return f"{minutes}m {secs:.2f}s"
    else:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h {minutes}m"


def benchmark_transcriber(
    audio_path: Path,
    model_size: str,
    device: str
) -> Dict[str, Any]:
    """Benchmark do transcriber"""
    from app.workers.processors.transcriber import Transcriber

    print(f"  Testando: {model_size} ({device})...")

    transcriber = Transcriber(
        model_size=model_size,
        language="pt",
        device=device
    )

    output_path = Path(f"/tmp/benchmark_{model_size}_{device}.json")

    start_time = time.time()

    try:
        result = transcriber.process(
            input_path=audio_path,
            output_path=output_path
        )

        elapsed = time.time() - start_time

        return {
            "model": model_size,
            "device": device,
            "success": True,
            "time": elapsed,
            "segments": result.get("segment_count", 0),
            "confidence": result.get("avg_confidence", 0.0),
            "speed_factor": result.get("duration", 0) / elapsed if elapsed > 0 else 0
        }

    except Exception as e:
        elapsed = time.time() - start_time

        return {
            "model": model_size,
            "device": device,
            "success": False,
            "time": elapsed,
            "error": str(e)
        }


def benchmark_full_pipeline(
    audio_path: Path,
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """Benchmark do pipeline completo"""
    from app.workers.processors.audio_extractor import AudioExtractor
    from app.workers.processors.noise_reducer import NoiseReducer
    from app.workers.processors.transcriber import Transcriber
    from app.workers.processors.punctuator import Punctuator

    print(f"  Testando pipeline completo...")
    print(f"    Config: {config}")

    temp_dir = Path("/tmp/benchmark_pipeline")
    temp_dir.mkdir(parents=True, exist_ok=True)

    stages_time = {}
    start_time = time.time()

    try:
        # Stage 1: Audio Extraction
        stage_start = time.time()
        extractor = AudioExtractor()
        audio_result = extractor.process(
            input_path=audio_path,
            output_path=temp_dir / "audio.wav"
        )
        stages_time["extraction"] = time.time() - stage_start

        # Stage 2: Noise Reduction
        stage_start = time.time()
        reducer = NoiseReducer()
        reducer.process(
            input_path=temp_dir / "audio.wav",
            output_path=temp_dir / "audio_clean.wav"
        )
        stages_time["noise_reduction"] = time.time() - stage_start

        # Stage 3: Transcription
        stage_start = time.time()
        transcriber = Transcriber(
            model_size=config["model_size"],
            language=config["language"],
            device=config["device"]
        )
        trans_result = transcriber.process(
            input_path=temp_dir / "audio_clean.wav",
            output_path=temp_dir / "transcription.json"
        )
        stages_time["transcription"] = time.time() - stage_start

        # Stage 4: Punctuation
        stage_start = time.time()
        punctuator = Punctuator()
        punctuator.process(
            input_path=temp_dir / "transcription.json",
            output_path=temp_dir / "punctuated.json"
        )
        stages_time["punctuation"] = time.time() - stage_start

        total_time = time.time() - start_time

        return {
            "success": True,
            "total_time": total_time,
            "stages": stages_time,
            "duration": audio_result["duration"],
            "speed_factor": audio_result["duration"] / total_time if total_time > 0 else 0
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "total_time": time.time() - start_time
        }


def print_results(results: List[Dict[str, Any]]):
    """Imprime resultados formatados"""
    print("\n" + "=" * 70)
    print("RESULTADOS")
    print("=" * 70)
    print()

    for result in results:
        if result["success"]:
            print(f"✓ {result['model']} ({result['device']}):")
            print(f"    Tempo: {format_time(result['time'])}")
            print(f"    Segmentos: {result['segments']}")
            print(f"    Confiança: {result['confidence']:.2%}")
            print(f"    Fator de velocidade: {result['speed_factor']:.2f}x")
            print()
        else:
            print(f"❌ {result['model']} ({result['device']}):")
            print(f"    Erro: {result['error']}")
            print()


def main():
    """Função principal"""
    # Verificar se arquivo de teste foi fornecido
    if len(sys.argv) < 2:
        print("❌ Uso: python benchmark.py <audio_file.wav>")
        print()
        print("Exemplo:")
        print("  python benchmark.py sample.wav")
        print()
        sys.exit(1)

    audio_path = Path(sys.argv[1])

    if not audio_path.exists():
        print(f"❌ Arquivo não encontrado: {audio_path}")
        sys.exit(1)

    print(f"📊 Arquivo de teste: {audio_path}")
    print(f"📦 Tamanho: {audio_path.stat().st_size / 1024 / 1024:.2f} MB")
    print()

    # Configurações para testar
    configs = [
        {"model_size": "base", "device": "cpu"},
        {"model_size": "small", "device": "cpu"},
        {"model_size": "medium", "device": "cpu"},
    ]

    # Adicionar configs GPU se disponível
    try:
        import torch
        if torch.cuda.is_available():
            print("✓ GPU CUDA detectada!")
            configs.extend([
                {"model_size": "large-v3", "device": "cuda"},
            ])
        else:
            print("⚠ GPU CUDA não disponível, testando apenas CPU")
    except ImportError:
        print("⚠ PyTorch não instalado, testando apenas CPU")

    print()
    print("Executando benchmarks...\n")

    results = []

    for config in configs:
        result = benchmark_transcriber(
            audio_path,
            config["model_size"],
            config["device"]
        )
        results.append(result)

    # Imprimir resultados
    print_results(results)

    # Salvar resultados
    output_file = Path("benchmark_results.json")
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"📄 Resultados salvos em: {output_file}")
    print()


if __name__ == "__main__":
    main()
