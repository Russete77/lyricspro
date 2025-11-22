/**
 * Electron Local Storage
 * Gerencia arquivos localmente no sistema de arquivos
 * Substitui o R2 quando rodando no Electron
 */

import fs from 'fs';
import path from 'path';

/**
 * Obtém o diretório base de armazenamento do app
 */
export function getStorageBasePath(): string {
  // No Electron, usar o diretório userData
  // Este arquivo só roda no processo principal do Electron
  const userDataPath = process.env.ELECTRON_USER_DATA || process.cwd();
  const storagePath = path.join(userDataPath, 'storage');

  // Criar diretório se não existir
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return storagePath;
}

/**
 * Obtém o caminho para armazenar uploads de um usuário
 */
export function getUserStoragePath(userId: string): string {
  const basePath = getStorageBasePath();
  const userPath = path.join(basePath, 'uploads', userId);

  if (!fs.existsSync(userPath)) {
    fs.mkdirSync(userPath, { recursive: true });
  }

  return userPath;
}

/**
 * Salva um arquivo de upload local
 */
export async function saveUploadedFile(
  userId: string,
  filename: string,
  buffer: Buffer
): Promise<{ storagePath: string; fileSize: number }> {
  const userPath = getUserStoragePath(userId);
  const timestamp = Date.now();
  const safeFilename = `${timestamp}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const fullPath = path.join(userPath, safeFilename);

  // Salvar arquivo
  fs.writeFileSync(fullPath, buffer);

  return {
    storagePath: fullPath,
    fileSize: buffer.length,
  };
}

/**
 * Lê um arquivo de áudio local
 */
export async function readAudioFile(storagePath: string): Promise<Buffer> {
  if (!fs.existsSync(storagePath)) {
    throw new Error('Arquivo não encontrado');
  }

  return fs.readFileSync(storagePath);
}

/**
 * Deleta um arquivo local
 */
export async function deleteFile(storagePath: string): Promise<void> {
  if (fs.existsSync(storagePath)) {
    fs.unlinkSync(storagePath);
  }
}

/**
 * Obtém informações de um arquivo
 */
export async function getFileInfo(storagePath: string): Promise<{
  exists: boolean;
  size: number;
  createdAt: Date;
}> {
  if (!fs.existsSync(storagePath)) {
    return { exists: false, size: 0, createdAt: new Date() };
  }

  const stats = fs.statSync(storagePath);

  return {
    exists: true,
    size: stats.size,
    createdAt: stats.birthtime,
  };
}

/**
 * Copia arquivo temporário para storage permanente
 */
export async function moveToStorage(
  tempPath: string,
  userId: string,
  filename: string
): Promise<{ storagePath: string; fileSize: number }> {
  const buffer = fs.readFileSync(tempPath);
  const result = await saveUploadedFile(userId, filename, buffer);

  // Deletar arquivo temporário
  fs.unlinkSync(tempPath);

  return result;
}

/**
 * Limpa arquivos antigos (opcional - manutenção)
 */
export async function cleanupOldFiles(daysOld: number = 30): Promise<number> {
  const basePath = getStorageBasePath();
  const uploadsPath = path.join(basePath, 'uploads');

  if (!fs.existsSync(uploadsPath)) {
    return 0;
  }

  let deletedCount = 0;
  const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

  const deleteOldFilesRecursive = (dirPath: string) => {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        deleteOldFilesRecursive(fullPath);
      } else if (stats.birthtimeMs < cutoffDate) {
        fs.unlinkSync(fullPath);
        deletedCount++;
      }
    }
  };

  deleteOldFilesRecursive(uploadsPath);

  return deletedCount;
}

/**
 * Obtém tamanho total do storage
 */
export async function getStorageSize(): Promise<{ totalBytes: number; fileCount: number }> {
  const basePath = getStorageBasePath();
  const uploadsPath = path.join(basePath, 'uploads');

  if (!fs.existsSync(uploadsPath)) {
    return { totalBytes: 0, fileCount: 0 };
  }

  let totalBytes = 0;
  let fileCount = 0;

  const calculateSizeRecursive = (dirPath: string) => {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        calculateSizeRecursive(fullPath);
      } else {
        totalBytes += stats.size;
        fileCount++;
      }
    }
  };

  calculateSizeRecursive(uploadsPath);

  return { totalBytes, fileCount };
}
