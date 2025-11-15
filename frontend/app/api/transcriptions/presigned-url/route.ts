/**
 * API Route: Gerar URL assinada para upload direto ao R2
 * POST /api/transcriptions/presigned-url
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSignedUploadUrl } from '@/lib/r2-storage';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar rate limit
    const rateLimit = checkRateLimit(userId, RATE_LIMITS.upload);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Parse body
    const body = await request.json();
    const { filename, contentType, fileSize } = body;

    if (!filename || !contentType || !fileSize) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: filename, contentType, fileSize' },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Validar formato
    const allowedFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/webm', 'audio/ogg', 'video/mp4'];
    const hasValidMimeType = allowedFormats.includes(contentType);
    const hasValidExtension = /\.(mp3|wav|m4a|webm|ogg|mp4)$/i.test(filename);

    if (!hasValidMimeType && !hasValidExtension) {
      return NextResponse.json(
        { error: 'Formato de arquivo não suportado' },
        { status: 400 }
      );
    }

    // Gerar chave única para o R2
    const timestamp = Date.now();
    const ext = filename.split('.').pop();
    const r2Key = `transcriptions/${userId}/${timestamp}.${ext}`;

    // Gerar URL assinada (válida por 1 hora)
    const uploadUrl = await getSignedUploadUrl(r2Key, contentType, 3600);

    console.log('[Presigned URL] Gerada para:', {
      userId,
      filename,
      r2Key,
      fileSize,
    });

    return NextResponse.json({
      uploadUrl,
      r2Key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('[Presigned URL] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar URL de upload' },
      { status: 500 }
    );
  }
}
