"""
Storage Service - MinIO/S3 or Local Filesystem
"""

import logging
import shutil
from pathlib import Path
from typing import Optional, BinaryIO
from app.config import get_settings

logger = logging.getLogger(__name__)


class StorageService:
    """
    Serviço de armazenamento (MinIO/S3 ou Filesystem Local)

    Funcionalidades:
    - Upload de arquivos
    - Download de arquivos
    - Geração de URLs presignadas (apenas S3/MinIO)
    - Gerenciamento de buckets/diretórios
    """

    def __init__(self):
        """Inicializa storage (MinIO ou Local)"""
        self.settings = get_settings()
        self.storage_type = self.settings.storage_type.lower()

        if self.storage_type == "local":
            # Usar filesystem local
            self.base_path = Path("./storage")
            self.base_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"StorageService inicializado (LOCAL): {self.base_path.absolute()}")
        else:
            # Usar MinIO/S3
            try:
                from minio import Minio
                from minio.error import S3Error
                self.S3Error = S3Error

                self.client = Minio(
                    self.settings.storage_endpoint,
                    access_key=self.settings.storage_access_key,
                    secret_key=self.settings.storage_secret_key,
                    secure=self.settings.storage_secure
                )
                self.bucket = self.settings.storage_bucket
                self._ensure_bucket_exists()
                logger.info(f"StorageService inicializado (MINIO): {self.settings.storage_endpoint}/{self.bucket}")
            except ImportError:
                logger.warning("minio não instalado, usando storage local")
                self.storage_type = "local"
                self.base_path = Path("./storage")
                self.base_path.mkdir(parents=True, exist_ok=True)

    def _ensure_bucket_exists(self):
        """Garante que o bucket existe (apenas MinIO/S3)"""
        if self.storage_type != "local":
            try:
                if not self.client.bucket_exists(self.bucket):
                    self.client.make_bucket(self.bucket)
                    logger.info(f"Bucket criado: {self.bucket}")
                else:
                    logger.info(f"Bucket já existe: {self.bucket}")
            except self.S3Error as e:
                logger.error(f"Erro ao verificar/criar bucket: {e}")
                raise

    def upload_file(
        self,
        file_path: Path,
        object_name: str,
        content_type: Optional[str] = None
    ) -> str:
        """
        Faz upload de um arquivo

        Args:
            file_path: Caminho do arquivo local
            object_name: Nome do objeto no storage
            content_type: MIME type do arquivo

        Returns:
            URL do objeto
        """
        if self.storage_type == "local":
            # Local filesystem
            dest_path = self.base_path / object_name
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, dest_path)
            logger.info(f"Arquivo copiado (LOCAL): {object_name}")
            return str(dest_path.absolute())
        else:
            # MinIO/S3
            try:
                self.client.fput_object(
                    self.bucket,
                    object_name,
                    str(file_path),
                    content_type=content_type
                )
                logger.info(f"Arquivo enviado (MINIO): {object_name}")
                return f"{self.settings.storage_endpoint}/{self.bucket}/{object_name}"
            except self.S3Error as e:
                logger.error(f"Erro ao fazer upload: {e}")
                raise

    def upload_fileobj(
        self,
        file_obj: BinaryIO,
        object_name: str,
        length: int,
        content_type: Optional[str] = None
    ) -> str:
        """
        Faz upload de um file object

        Args:
            file_obj: Objeto de arquivo
            object_name: Nome do objeto no storage
            length: Tamanho do arquivo em bytes
            content_type: MIME type do arquivo

        Returns:
            URL do objeto
        """
        if self.storage_type == "local":
            # Local filesystem
            dest_path = self.base_path / object_name
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            with open(dest_path, 'wb') as f:
                f.write(file_obj.read())
            logger.info(f"Arquivo salvo (LOCAL): {object_name}")
            return str(dest_path.absolute())
        else:
            # MinIO/S3
            try:
                self.client.put_object(
                    self.bucket,
                    object_name,
                    file_obj,
                    length,
                    content_type=content_type
                )
                logger.info(f"Arquivo enviado (MINIO): {object_name}")
                return f"{self.settings.storage_endpoint}/{self.bucket}/{object_name}"
            except self.S3Error as e:
                logger.error(f"Erro ao fazer upload: {e}")
                raise

    def download_file(self, object_name: str, file_path: Path) -> Path:
        """
        Faz download de um arquivo

        Args:
            object_name: Nome do objeto no storage
            file_path: Caminho de destino local

        Returns:
            Path do arquivo baixado
        """
        if self.storage_type == "local":
            # Local filesystem
            source_path = self.base_path / object_name
            shutil.copy2(source_path, file_path)
            logger.info(f"Arquivo copiado (LOCAL): {object_name} -> {file_path}")
            return file_path
        else:
            # MinIO/S3
            try:
                self.client.fget_object(
                    self.bucket,
                    object_name,
                    str(file_path)
                )
                logger.info(f"Arquivo baixado (MINIO): {object_name} -> {file_path}")
                return file_path
            except self.S3Error as e:
                logger.error(f"Erro ao fazer download: {e}")
                raise

    def get_presigned_url(
        self,
        object_name: str,
        expires_seconds: int = 3600
    ) -> str:
        """
        Gera URL presignada para download

        Args:
            object_name: Nome do objeto
            expires_seconds: Tempo de expiração em segundos (padrão: 1 hora)

        Returns:
            URL presignada
        """
        if self.storage_type == "local":
            # Local filesystem - retornar path absoluto
            file_path = self.base_path / object_name
            logger.info(f"Path local retornado: {object_name}")
            return str(file_path.absolute())
        else:
            # MinIO/S3
            try:
                from datetime import timedelta

                url = self.client.presigned_get_object(
                    self.bucket,
                    object_name,
                    expires=timedelta(seconds=expires_seconds)
                )
                logger.info(f"URL presignada gerada (MINIO): {object_name}")
                return url
            except self.S3Error as e:
                logger.error(f"Erro ao gerar URL presignada: {e}")
                raise

    def delete_file(self, object_name: str):
        """
        Remove um arquivo do storage

        Args:
            object_name: Nome do objeto
        """
        if self.storage_type == "local":
            # Local filesystem
            file_path = self.base_path / object_name
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Arquivo removido (LOCAL): {object_name}")
        else:
            # MinIO/S3
            try:
                self.client.remove_object(self.bucket, object_name)
                logger.info(f"Arquivo removido (MINIO): {object_name}")
            except self.S3Error as e:
                logger.error(f"Erro ao remover arquivo: {e}")
                raise

    def file_exists(self, object_name: str) -> bool:
        """
        Verifica se arquivo existe

        Args:
            object_name: Nome do objeto

        Returns:
            True se existe, False caso contrário
        """
        if self.storage_type == "local":
            # Local filesystem
            file_path = self.base_path / object_name
            return file_path.exists()
        else:
            # MinIO/S3
            try:
                self.client.stat_object(self.bucket, object_name)
                return True
            except self.S3Error:
                return False


# Singleton
_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """Retorna instância singleton do StorageService"""
    global _storage_service

    if _storage_service is None:
        _storage_service = StorageService()

    return _storage_service
