"""
Notification Service - Webhooks and notifications
"""

import logging
from typing import Optional, Dict, Any
import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Serviço de notificações

    Funcionalidades:
    - Envio de webhooks
    - Retry logic
    - Timeout handling
    """

    def __init__(self):
        """Inicializa serviço de notificações"""
        self.settings = get_settings()
        self.timeout = self.settings.webhook_timeout_seconds
        self.max_retries = self.settings.webhook_retry_attempts

        logger.info("NotificationService inicializado")

    async def send_webhook(
        self,
        url: str,
        payload: Dict[str, Any],
        event_type: str = "transcription.completed"
    ) -> bool:
        """
        Envia webhook para URL especificada

        Args:
            url: URL do webhook
            payload: Dados a enviar
            event_type: Tipo do evento

        Returns:
            True se sucesso, False se falha
        """
        if not url:
            logger.warning("URL de webhook não fornecida")
            return False

        headers = {
            "Content-Type": "application/json",
            "X-Event-Type": event_type,
            "User-Agent": "TranscritorAI-Pro/1.0"
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for attempt in range(self.max_retries):
                try:
                    logger.info(f"Enviando webhook para {url} (tentativa {attempt + 1}/{self.max_retries})")

                    response = await client.post(
                        url,
                        json=payload,
                        headers=headers
                    )

                    if response.status_code in (200, 201, 202, 204):
                        logger.info(f"Webhook enviado com sucesso: {url}")
                        return True
                    else:
                        logger.warning(
                            f"Webhook retornou status {response.status_code}: {url}"
                        )

                except httpx.TimeoutException:
                    logger.warning(f"Timeout ao enviar webhook (tentativa {attempt + 1}): {url}")

                except httpx.RequestError as e:
                    logger.error(f"Erro ao enviar webhook (tentativa {attempt + 1}): {e}")

                except Exception as e:
                    logger.error(f"Erro inesperado ao enviar webhook: {e}", exc_info=True)

                # Esperar antes de retry (backoff exponencial)
                if attempt < self.max_retries - 1:
                    import asyncio
                    wait_time = 2 ** attempt  # 1s, 2s, 4s, ...
                    logger.info(f"Aguardando {wait_time}s antes de retry...")
                    await asyncio.sleep(wait_time)

        logger.error(f"Falha ao enviar webhook após {self.max_retries} tentativas: {url}")
        return False

    async def notify_transcription_completed(
        self,
        webhook_url: str,
        job_id: str,
        status: str,
        data: Dict[str, Any]
    ):
        """
        Notifica conclusão de transcrição

        Args:
            webhook_url: URL do webhook
            job_id: ID do job
            status: Status final (completed/failed)
            data: Dados adicionais
        """
        payload = {
            "event": "transcription.completed",
            "job_id": job_id,
            "status": status,
            "timestamp": data.get("completed_at"),
            "data": data
        }

        await self.send_webhook(
            webhook_url,
            payload,
            event_type="transcription.completed"
        )

    async def notify_transcription_failed(
        self,
        webhook_url: str,
        job_id: str,
        error_message: str
    ):
        """
        Notifica falha de transcrição

        Args:
            webhook_url: URL do webhook
            job_id: ID do job
            error_message: Mensagem de erro
        """
        payload = {
            "event": "transcription.failed",
            "job_id": job_id,
            "status": "failed",
            "error": error_message
        }

        await self.send_webhook(
            webhook_url,
            payload,
            event_type="transcription.failed"
        )


# Singleton
_notification_service: Optional[NotificationService] = None


def get_notification_service() -> NotificationService:
    """Retorna instância singleton do NotificationService"""
    global _notification_service

    if _notification_service is None:
        _notification_service = NotificationService()

    return _notification_service
