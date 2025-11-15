/**
 * Cloudflare R2 Storage Client
 * Compatível com API S3
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

// Singleton
let r2Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!r2Client) {
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error('R2 credentials not configured');
    }

    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return r2Client;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

/**
 * Upload de arquivo para R2
 */
export async function uploadToR2(
  localPath: string,
  key: string,
  options: UploadOptions = {}
): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  // Ler arquivo
  const fileBuffer = fs.readFileSync(localPath);

  // Upload
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: options.contentType || 'application/octet-stream',
      Metadata: options.metadata,
    })
  );

  // Retornar URL pública
  const publicUrl = process.env.R2_PUBLIC_URL || `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`;
  return `${publicUrl}/${key}`;
}

/**
 * Gerar URL assinada temporária (download privado)
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn });
}

/**
 * Deletar arquivo do R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

/**
 * Upload com limpeza automática do arquivo local
 */
export async function uploadAndCleanup(
  localPath: string,
  key: string,
  options: UploadOptions = {}
): Promise<string> {
  try {
    const url = await uploadToR2(localPath, key, options);

    // Remover arquivo local após upload bem-sucedido
    fs.unlinkSync(localPath);
    console.log(`[R2] Arquivo local removido: ${localPath}`);

    return url;
  } catch (error) {
    console.error('[R2] Erro no upload:', error);
    throw error;
  }
}
