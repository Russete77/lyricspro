/**
 * API Route: Completar Multipart Upload
 * POST /api/multipart/complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { completeMultipartUpload } from '@/lib/r2-storage';
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
      key,
      uploadId,
      parts,
      originalFilename,
      fileType,
      fileSize,
      language = 'pt',
      enableDiarization = false,
      enablePostProcessing = true,
    } = body;

    if (!key || !uploadId || !parts || !originalFilename || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
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

    console.log('[Multipart Complete] Finalizando upload:', {
      userId,
      key,
      uploadId,
      partsCount: parts.length,
    });

    // Completar multipart upload no R2
    await completeMultipartUpload(key, uploadId, parts);

    console.log('[Multipart Complete] Upload no R2 completo, criando registro no banco');

    // Criar registro no banco
    const transcription = await prisma.transcription.create({
      data: {
        userId,
        originalFilename,
        fileType: fileType.startsWith('video') ? 'video' : 'audio',
        fileSize: BigInt(fileSize),
        storagePath: key, // Caminho no R2
        language,
        modelSize: enableDiarization ? 'gpt-4o-transcribe-diarize' : 'whisper-1',
        enableDiarization,
        enablePostProcessing,
        status: 'pending',
        progress: 0,
      },
    });

    console.log('[Multipart Complete] Registro criado:', transcription.id);

    // Decidir processamento: Trigger.dev (produção) ou Local (desenvolvimento)
    if (USE_TRIGGER) {
      console.log('[Multipart Complete] Modo: Trigger.dev (produção)');

      // Preparar payload para o Trigger.dev
      const payload = {
        transcriptionId: transcription.id,
        filePath: key,
        language,
        enableDiarization,
        enablePostProcessing,
      };

      try {
        const handle = await processTranscriptionTask.trigger(payload);
        console.log('[Multipart Complete] Job Trigger.dev disparado:', handle.id);
      } catch (triggerError) {
        console.error('[Multipart Complete] Erro ao disparar Trigger.dev:', triggerError);

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
      console.log('[Multipart Complete] Modo: Processamento local (desenvolvimento)');

      // Processar localmente em background
      startLocalProcessing(
        transcription.id,
        key,
        language,
        enableDiarization,
        enablePostProcessing
      );

      console.log('[Multipart Complete] Processamento local iniciado em background');
    }

    return NextResponse.json({
      id: transcription.id,
      status: 'pending',
      progress: 0,
      created_at: transcription.createdAt.toISOString(),
      message: 'Upload concluído. Transcrição iniciada em background.',
    });
  } catch (error) {
    console.error('[Multipart Complete] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao completar upload' },
      { status: 500 }
    );
  }
}
