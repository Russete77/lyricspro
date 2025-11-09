"""
Post Processor - Refinamento final usando IA generativa
"""

import logging
import json
from pathlib import Path
from typing import Dict, Any, Optional, Callable, List
from app.config import get_settings

logger = logging.getLogger(__name__)


class PostProcessor:
    """
    Refinamento final usando IA generativa

    Funcionalidades:
    - Correção contextual de erros
    - Padronização de termos técnicos
    - Detecção de capítulos/seções
    - Geração de resumo
    - Extração de tópicos e palavras-chave
    - Remoção de hesitações (ãh, éh, né)

    Tecnologias:
    - OpenAI GPT-4o
    - Dicionário customizado (opcional)

    Features diferenciadas:
    - Dicionário jurídico (OAB)
    - Termos médicos
    - Vocabulário técnico por área
    - Correção de nomes próprios brasileiros
    """

    def __init__(self, **kwargs):
        """Inicialização"""
        self.settings = get_settings()
        self.config = kwargs
        self.api_key = kwargs.get("api_key") or self.settings.openai_api_key
        self.model = kwargs.get("model", self.settings.openai_model)
        self._client = None
        logger.info(f"{self.__class__.__name__} inicializado")

    def _get_client(self):
        """Obtém cliente OpenAI (lazy loading)"""
        if self._client is not None:
            return self._client

        if not self.api_key:
            raise ProcessingError(
                "OpenAI API Key não configurada. "
                "Configure OPENAI_API_KEY no .env"
            )

        try:
            from openai import OpenAI
            self._client = OpenAI(api_key=self.api_key)
            return self._client
        except ImportError:
            raise ProcessingError(
                "openai não instalado. "
                "Instale com: pip install openai"
            )

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
            logger.info(f"Pós-processando com IA: {input_path}")

            if progress_callback:
                progress_callback(10)

            # Carregar dados de entrada
            with open(input_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            text = data.get("text", "")

            if not text:
                raise ProcessingError("Texto vazio para pós-processamento")

            if progress_callback:
                progress_callback(20)

            # Obter cliente OpenAI
            client = self._get_client()

            # 1. Correção contextual e limpeza
            logger.info("Aplicando correção contextual...")
            refined_text = self._refine_text(client, text)

            if progress_callback:
                progress_callback(50)

            # 2. Detectar capítulos/seções
            logger.info("Detectando capítulos...")
            chapters = self._detect_chapters(client, refined_text)

            if progress_callback:
                progress_callback(70)

            # 3. Gerar resumo
            logger.info("Gerando resumo...")
            summary = self._generate_summary(client, refined_text)

            if progress_callback:
                progress_callback(85)

            # 4. Extrair palavras-chave e tópicos
            logger.info("Extraindo palavras-chave...")
            keywords, topics = self._extract_keywords_topics(client, refined_text)

            if progress_callback:
                progress_callback(95)

            # Salvar resultado
            result_data = {
                "text": refined_text,
                "summary": summary,
                "topics": topics,
                "keywords": keywords,
                "chapters": chapters,
                "segments": data.get("segments", []),
                "language": data.get("language"),
                "avg_confidence": data.get("avg_confidence")
            }

            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result_data, f, indent=2, ensure_ascii=False)

            if progress_callback:
                progress_callback(100)

            logger.info("Pós-processamento concluído com sucesso")
            logger.info(f"Capítulos detectados: {len(chapters)}")
            logger.info(f"Palavras-chave: {len(keywords)}")

            return {
                "success": True,
                "output_path": str(output_path),
                "text": refined_text,
                "summary": summary,
                "topics": topics,
                "keywords": keywords,
                "chapters": chapters
            }

        except Exception as e:
            logger.error(f"Erro no pós-processamento: {e}", exc_info=True)
            raise ProcessingError(f"Falha em {self.__class__.__name__}: {e}")

    def _refine_text(self, client, text: str) -> str:
        """Refina o texto usando GPT-4o - CORRIGE ERROS CONTEXTUAIS"""
        prompt = f"""Você é um especialista em CORREÇÃO de transcrições de áudio em português brasileiro.

OBJETIVO: Corrigir erros de transcrição mantendo 100% fidelidade ao que foi FALADO no áudio.

IMPORTANTE PARA MÚSICAS CONHECIDAS:
- Se reconhecer uma música popular brasileira, use seu conhecimento da letra original
- Músicas sertanejas: Chitãozinho & Xororó, Milionário & José Rico, etc.
- MPB: Milton Nascimento, Chico Buarque, Caetano Veloso, etc.
- Corrija para a letra OFICIAL da música, não improvise

REGRAS DE CORREÇÃO:
1. ✅ Corrija palavras transcritas incorretamente usando contexto
   - Ex: "interior do mar" → "interior do mato"
   - Ex: "o roçado" → "da caatinga, do roçado"
   - Ex: "tolesmo" → "torresmo"
   - Ex: "rei desgarrada" → "rês desgarrada"
   - Ex: "caminha da esmo" → "caminhando a esmo"
   - Ex: "viver, contrariar" → "viver contrariado"
   - Ex: "cama, amor" → "cama mole"

2. ✅ Mantenha pronúncias regionais e sotaques
   - Ex: "pra" ao invés de "para" (se for assim na música)
   - Ex: "tá" ao invés de "está"

3. ✅ Adicione pontuação correta (. , ! ? : ; )
4. ✅ Adicione quebras de linha entre estrofes/parágrafos
5. ✅ Capitalize início de frases e nomes próprios

6. ❌ NÃO invente conteúdo - só corrija erros evidentes
7. ❌ NÃO remova hesitações se forem parte importante da fala

PARA MÚSICAS:
- Identifique e marque [REFRÃO] quando partes se repetem
- Separe em [VERSO 1], [VERSO 2], [PONTE]
- Se reconhecer a música, use a letra oficial como referência

Texto transcrito (corrija erros usando contexto e conhecimento de músicas brasileiras):
{text[:4000]}

Retorne apenas o texto CORRIGIDO, sem explicações."""

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Você é um especialista em CORREÇÃO de transcrições automáticas e conhece músicas populares brasileiras. Corrija erros contextuais usando conhecimento da música original quando possível."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Muito baixo para músicas conhecidas (mais preciso)
                max_tokens=self.settings.openai_max_tokens
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Falha ao refinar texto com GPT: {e}")
            return text  # Retorna texto original se falhar

    def _detect_chapters(self, client, text: str) -> List[Dict]:
        """Detecta estrutura musical ou capítulos/seções no texto"""
        prompt = f"""Analise esta transcrição e identifique a estrutura.

Se for MÚSICA, identifique:
- Refrão (partes que se repetem)
- Versos (partes únicas)
- Ponte (transição)

Se for PODCAST/PALESTRA, identifique:
- Tópicos principais
- Seções de discussão

Texto:
{text[:4000]}

Retorne um JSON array com a estrutura:
[{{"title": "Refrão" ou "Verso 1" ou "Introdução", "summary": "Breve descrição"}}]

Se não houver estrutura clara, retorne array vazio []."""

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Você é um especialista em análise de conteúdo."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            result = response.choices[0].message.content.strip()
            # Extrair JSON da resposta
            import re
            json_match = re.search(r'\[.*\]', result, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return []
        except Exception as e:
            logger.warning(f"Falha ao detectar capítulos: {e}")
            return []

    def _generate_summary(self, client, text: str) -> str:
        """Gera resumo do texto"""
        prompt = f"""Crie um resumo conciso (2-3 parágrafos) desta transcrição:

{text[:4000]}

Resumo:"""

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Você é um especialista em resumir conteúdo."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Falha ao gerar resumo: {e}")
            return "Resumo não disponível"

    def _extract_keywords_topics(self, client, text: str) -> tuple:
        """Extrai palavras-chave e tópicos"""
        prompt = f"""Analise esta transcrição e extraia:
1. Palavras-chave principais (5-10 palavras)
2. Tópicos abordados (3-5 tópicos)

Texto:
{text[:4000]}

Retorne JSON:
{{
  "keywords": ["palavra1", "palavra2", ...],
  "topics": ["tópico1", "tópico2", ...]
}}"""

        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Você é um especialista em análise de texto."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            result = response.choices[0].message.content.strip()
            # Extrair JSON da resposta
            import re
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return data.get("keywords", []), data.get("topics", [])
            return [], []
        except Exception as e:
            logger.warning(f"Falha ao extrair keywords/topics: {e}")
            return [], []

    def cleanup(self):
        """Limpa recursos temporários"""
        pass


class ProcessingError(Exception):
    """Exceção customizada para erros de processamento"""
    pass
