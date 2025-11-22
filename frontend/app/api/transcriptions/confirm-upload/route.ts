/**
 * API Route: Confirmar upload e iniciar processamento
 * POST /api/transcriptions/confirm-upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { processTranscriptionTask } from '@/trigger/transcription';
import { startLocalProcessing } from '@/lib/local-transcription';

export const dynamic = 'force-dynamic';

// Detectar se deve usar Trigger.dev ou processamento local
// Usa Trigger.dev APENAS se a secret key estiver configurada (independente do ambiente)
const USE_TRIGGER = Boolean(process.env.TRIGGER_SECRET_KEY);

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
    const {
      r2Key,
      originalFilename,
      fileType,
      fileSize,
      language = 'pt',
      enableDiarization = false,
      enablePostProcessing = true,
    } = body;

    if (!r2Key || !originalFilename || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: r2Key, originalFilename, fileType, fileSize' },
        { status: 400 }
      );
    }

    console.log('[Confirm Upload] Criando registro no banco:', {
      userId,
      r2Key,
      originalFilename,
      fileSize,
    });

    // Criar registro no banco
    const transcription = await prisma.transcription.create({
      data: {
        userId,
        originalFilename,
        fileType: fileType.startsWith('video') ? 'video' : 'audio',
        fileSize: BigInt(fileSize),
        storagePath: r2Key, // Agora é o caminho no R2, não local
        language,
        modelSize: enableDiarization ? 'gpt-4o-transcribe-diarize' : 'whisper-1',
        enableDiarization,
        enablePostProcessing,
        status: 'pending',
        progress: 0,
      },
    });

    console.log('[Confirm Upload] Registro criado:', transcription.id);

    // Decidir processamento: Trigger.dev (produção) ou Local (desenvolvimento)
    if (USE_TRIGGER) {
      console.log('[Confirm Upload] Modo: Trigger.dev (produção)');

      // Preparar payload para o Trigger.dev
      const payload = {
        transcriptionId: transcription.id,
        filePath: r2Key,
        language,
        enableDiarization,
        enablePostProcessing,
      };

      try {
        const handle = await processTranscriptionTask.trigger(payload);
        console.log('[Confirm Upload] Job Trigger.dev disparado:', handle.id);
      } catch (triggerError) {
        console.error('[Confirm Upload] Erro ao disparar Trigger.dev:', triggerError);

        await prisma.transcription.update({
          where: { id: transcription.id },
          data: {
            status: 'failed',
            errorMessage: 'Erro ao iniciar processamento',
          },
        });

        throw triggerError;
      }
    } else {
      console.log('[Confirm Upload] Modo: Processamento local (desenvolvimento)');

      // Processar localmente em background
      startLocalProcessing(
        transcription.id,
        r2Key,
        language,
        enableDiarization,
        enablePostProcessing
      );

      console.log('[Confirm Upload] Processamento local iniciado em background');
    }

    return NextResponse.json({
      id: transcription.id,
      status: 'pending',
      progress: 0,
      created_at: transcription.createdAt.toISOString(),
      message: 'Upload confirmado. Transcrição iniciada em background.',
    });
  } catch (error) {
    console.error('[Confirm Upload] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar upload' },
      { status: 500 }
    );
  }
}
