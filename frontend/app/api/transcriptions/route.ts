/**
 * API Route: List all transcriptions
 * GET /api/transcriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status');

    // Construir filtro - sempre filtrar por userId
    const where: any = {
      userId, // Filtrar apenas transcrições do usuário logado
    };

    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
      where.status = status;
    }

    // Buscar transcrições
    const [items, total] = await Promise.all([
      prisma.transcription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          originalFilename: true,
          fileType: true,
          fileSize: true,
          duration: true,
          language: true,
          detectedLanguage: true,
          status: true,
          progress: true,
          currentStage: true,
          transcriptionText: true,
          wordCount: true,
          speakerCount: true,
          enableDiarization: true,
          enablePostProcessing: true,
          errorMessage: true,
          createdAt: true,
          startedAt: true,
          completedAt: true,
          processingTimeSeconds: true,
        },
      }),
      prisma.transcription.count({ where }),
    ]);

    // Converter BigInt para number
    const formattedItems = items.map((item) => ({
      id: item.id,
      title: item.originalFilename, // Usar nome original como título
      original_filename: item.originalFilename,
      file_type: item.fileType,
      file_size: Number(item.fileSize),
      duration: item.duration,
      language: item.language,
      detected_language: item.detectedLanguage,
      status: item.status,
      progress: item.progress,
      current_stage: item.currentStage,
      preview: item.transcriptionText, // Preview do texto
      word_count: item.wordCount,
      speaker_count: item.speakerCount,
      enable_diarization: item.enableDiarization,
      enable_post_processing: item.enablePostProcessing,
      error_message: item.errorMessage,
      created_at: item.createdAt.toISOString(),
      started_at: item.startedAt?.toISOString() || null,
      completed_at: item.completedAt?.toISOString() || null,
      processing_time_seconds: item.processingTimeSeconds,
    }));

    return NextResponse.json({
      items: formattedItems,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[List] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao listar transcrições' },
      { status: 500 }
    );
  }
}
