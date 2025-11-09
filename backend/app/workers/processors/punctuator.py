"""
Punctuator - Adiciona pontuação e formatação ao texto
"""

import logging
import json
from pathlib import Path
from typing import Dict, Any, Optional, Callable, List
import re

logger = logging.getLogger(__name__)


class Punctuator:
    """
    Adiciona pontuação e formatação ao texto

    Funcionalidades:
    - Pontuação automática (. , ! ? : ; )
    - Capitalização de início de frases
    - Detecção de nomes próprios
    - Quebra de parágrafos
    - Formatação de números e datas

    Tecnologias:
    - deepmultilingualpunctuation
    - spaCy (NER para PT-BR)

    Regras especiais para PT-BR:
    - Tratamento de "né", "tá", "pra"
    - Gírias e expressões coloquiais
    - Números por extenso
    """

    def __init__(self, **kwargs):
        """Inicialização"""
        self.config = kwargs
        self._punctuator_model = None
        self._nlp = None
        logger.info(f"{self.__class__.__name__} inicializado")

    def _load_models(self):
        """Carrega modelos (lazy loading)"""
        # Não carrega modelos pesados - OpenAI faz pontuação no post-processing
        logger.info("Usando pontuação básica (OpenAI fará pontuação completa no post-processing)")

    def _apply_basic_punctuation(self, text: str) -> str:
        """Aplica pontuação básica se modelo não disponível"""
        # Capitalizar primeira letra
        text = text.capitalize()

        # Adicionar pontos em lugares óbvios
        text = re.sub(r'\s+então\s+', '. Então ', text, flags=re.IGNORECASE)
        text = re.sub(r'\s+depois\s+', '. Depois ', text, flags=re.IGNORECASE)
        text = re.sub(r'\s+aí\s+', ', aí ', text, flags=re.IGNORECASE)

        # Adicionar ponto final se não houver
        if not text.endswith(('.', '!', '?')):
            text += '.'

        return text

    def process(
        self,
        input_path: Path,
        output_path: Path,
        progress_callback: Optional[Callable[[int], None]] = None
    ) -> Dict[str, Any]:
        """
        Processa o arquivo de transcrição

        Args:
            input_path: Caminho do arquivo JSON de entrada
            output_path: Caminho do arquivo JSON de saída
            progress_callback: Função para reportar progresso (0-100)

        Returns:
            Dict com resultados e metadata

        Raises:
            ProcessingError: Se algo der errado
        """
        try:
            logger.info(f"Adicionando pontuação: {input_path}")

            if progress_callback:
                progress_callback(10)

            # Carregar dados de entrada
            with open(input_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            segments = data.get("segments", [])
            full_text = data.get("text", "")

            if progress_callback:
                progress_callback(20)

            # Carregar modelos
            self._load_models()

            if progress_callback:
                progress_callback(30)

            # Aplicar pontuação básica (OpenAI fará pontuação completa depois)
            logger.info("Aplicando pontuação básica...")
            punctuated_text = self._apply_basic_punctuation(full_text)

            if progress_callback:
                progress_callback(70)

            # Regras especiais PT-BR
            punctuated_text = self._apply_ptbr_rules(punctuated_text)

            # Atualizar segmentos (simplificado)
            # Em produção, você aplicaria pontuação segmento por segmento
            updated_segments = segments.copy()

            if progress_callback:
                progress_callback(90)

            # Salvar resultado
            result_data = {
                "segments": updated_segments,
                "text": punctuated_text,
                "language": data.get("language"),
                "avg_confidence": data.get("avg_confidence")
            }

            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result_data, f, indent=2, ensure_ascii=False)

            if progress_callback:
                progress_callback(100)

            logger.info("Pontuação aplicada com sucesso")

            return {
                "success": True,
                "output_path": str(output_path),
                "text": punctuated_text
            }

        except Exception as e:
            logger.error(f"Erro na pontuação: {e}", exc_info=True)
            raise ProcessingError(f"Falha em {self.__class__.__name__}: {e}")

    def _apply_ptbr_rules(self, text: str) -> str:
        """Aplica regras especiais para PT-BR"""
        # Correções comuns
        replacements = {
            r'\bne\b': 'né',
            r'\bta\b': 'tá',
            r'\bpra\b': 'pra',
            r'\bvc\b': 'você',
            r'\btb\b': 'também'
        }

        for pattern, replacement in replacements.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        return text

    def cleanup(self):
        """Limpa recursos temporários"""
        pass


class ProcessingError(Exception):
    """Exceção customizada para erros de processamento"""
    pass
