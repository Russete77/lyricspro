/**
 * Cloudflare R2 Storage Client
 * Compatível com API S3
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
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
      // CRITICAL: Disable automatic checksums for browser compatibility
      requestChecksumCalculation: 'WHEN_REQUIRED',
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
 * Gerar URL assinada para UPLOAD direto do browser (presigned PUT)
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    // Explicitly disable checksums
    ChecksumAlgorithm: undefined,
  });

  // Generate presigned URL with minimal signed headers
  return await getSignedUrl(client, command, {
    expiresIn,
    // Don't sign checksum headers
    signableHeaders: new Set(['host', 'content-type']),
  });
}

/**
 * Baixar arquivo do R2 para caminho local temporário
 */
export async function downloadFromR2(key: string, localPath: string): Promise<void> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error('Empty response body from R2');
  }

  // Converter stream para buffer e salvar
  const chunks: Uint8Array[] = [];
  const stream = response.Body as any;

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  fs.writeFileSync(localPath, buffer);

  console.log(`[R2] Arquivo baixado: ${key} -> ${localPath}`);
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

// ============================================================================
// Multipart Upload Functions
// ============================================================================

/**
 * Inicia um multipart upload no R2
 */
export async function createMultipartUpload(
  key: string,
  contentType: string
): Promise<{ uploadId: string; key: string }> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  const command = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const response = await client.send(command);

  if (!response.UploadId) {
    throw new Error('Failed to create multipart upload');
  }

  console.log(`[R2 Multipart] Upload iniciado: ${key}, UploadId: ${response.UploadId}`);

  return {
    uploadId: response.UploadId,
    key,
  };
}

/**
 * Gera presigned URL para upload de uma parte específica
 */
export async function getMultipartUploadUrl(
  key: string,
  uploadId: string,
  partNumber: number,
  expiresIn: number = 3600
): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(client, command, { expiresIn });

  console.log(`[R2 Multipart] Presigned URL gerada para parte ${partNumber}`);

  return url;
}

/**
 * Completa o multipart upload
 */
export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: Array<{ PartNumber: number; ETag: string }>
): Promise<void> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  const command = new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts,
    },
  });

  await client.send(command);

  console.log(`[R2 Multipart] Upload completo: ${key}`);
}

/**
 * Aborta um multipart upload (em caso de erro)
 */
export async function abortMultipartUpload(
  key: string,
  uploadId: string
): Promise<void> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  const command = new AbortMultipartUploadCommand({
    Bucket: bucketName,
    Key: key,
    UploadId: uploadId,
  });

  await client.send(command);

  console.log(`[R2 Multipart] Upload abortado: ${key}`);
}
