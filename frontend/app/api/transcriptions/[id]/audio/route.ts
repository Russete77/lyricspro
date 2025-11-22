/**
 * API Route: Servir áudio da transcrição
 * GET /api/transcriptions/[id]/audio
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import prisma from '@/lib/prisma';
import { getSignedDownloadUrl } from '@/lib/r2-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Await params para Next.js 15+
    const { id } = await params;
    const transcriptionId = id;

    // Buscar transcrição no banco
    const transcription = await prisma.transcription.findUnique({
      where: { id: transcriptionId },
      select: {
        userId: true,
        storagePath: true,
        fileType: true,
      },
    });

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcrição não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono
    if (transcription.userId !== userId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    console.log('[Audio] Storage path:', transcription.storagePath);

    // Verificar se o arquivo está no R2 (path começa com 'transcriptions/')
    const isR2File = transcription.storagePath.startsWith('transcriptions/');
    console.log('[Audio] Is R2 file:', isR2File);

    if (isR2File) {
      // Arquivo está no R2 - redirecionar para URL assinada
      const signedUrl = await getSignedDownloadUrl(transcription.storagePath, 3600);
      return NextResponse.redirect(signedUrl);
    }

    // Arquivo está local - ler do disco
    if (!existsSync(transcription.storagePath)) {
      return NextResponse.json(
        { error: 'Arquivo de áudio não encontrado' },
        { status: 404 }
      );
    }

    // Ler arquivo
    const fileBuffer = await readFile(transcription.storagePath);

    // Determinar Content-Type baseado na extensão
    const ext = transcription.storagePath.split('.').pop()?.toLowerCase();
    let contentType = 'audio/mpeg'; // default

    switch (ext) {
      case 'mp3':
        contentType = 'audio/mpeg';
        break;
      case 'wav':
        contentType = 'audio/wav';
        break;
      case 'm4a':
        contentType = 'audio/mp4';
        break;
      case 'webm':
        contentType = 'audio/webm';
        break;
      case 'ogg':
        contentType = 'audio/ogg';
        break;
      case 'mp4':
        contentType = 'video/mp4';
        break;
    }

    // Retornar arquivo de áudio
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[Audio] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar áudio' },
      { status: 500 }
    );
  }
}
