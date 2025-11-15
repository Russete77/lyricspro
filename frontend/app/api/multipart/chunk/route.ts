/**
 * API Route: Gerar Presigned URL para Chunk
 * POST /api/multipart/chunk
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMultipartUploadUrl } from '@/lib/r2-storage';

export const dynamic = 'force-dynamic';

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

    // Parse body
    const body = await request.json();
    const { key, uploadId, partNumber } = body;

    if (!key || !uploadId || !partNumber) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: key, uploadId, partNumber' },
        { status: 400 }
      );
    }

    // Validar que a key pertence ao usuário
    if (!key.startsWith(`transcriptions/${userId}/`)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Gerar presigned URL para upload da parte
    const uploadUrl = await getMultipartUploadUrl(key, uploadId, partNumber, 3600);

    console.log('[Multipart Chunk] URL gerada:', {
      userId,
      key,
      partNumber,
    });

    return NextResponse.json({
      uploadUrl,
      partNumber,
    });
  } catch (error) {
    console.error('[Multipart Chunk] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar URL de upload' },
      { status: 500 }
    );
  }
}
