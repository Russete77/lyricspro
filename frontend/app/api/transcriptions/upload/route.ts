/**
 * API Route: Upload de arquivo para transcrição
 * POST /api/transcriptions/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { tasks } from '@trigger.dev/sdk';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { processTranscriptionTask } from '@/trigger/transcription';
import { uploadToR2 } from '@/lib/r2-storage';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

// Configuração para aceitar arquivos grandes
export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

// NOTA: O limite de body size é controlado pelo next.config.ts
// experimental.proxyClientMaxBodySize: '500mb'
// Vercel Free tem limite de 4.5MB, vai funcionar para arquivos pequenos
// Para arquivos maiores, será necessário Vercel Pro ou implementar multipart upload

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
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.upload.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          },
        }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = (formData.get('language') as string) || 'pt';
    const enableDiarization = formData.get('enable_diarization') === 'true';
    const enablePostProcessing = formData.get('enable_post_processing') !== 'false';

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Validar formato
    const allowedFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/webm', 'audio/ogg', 'video/mp4'];
    if (!allowedFormats.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|webm|ogg|mp4)$/i)) {
      return NextResponse.json(
        { error: 'Formato de arquivo não suportado' },
        { status: 400 }
      );
    }

    console.log('[Upload] Arquivo recebido:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Criar diretório de uploads se não existir
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${timestamp}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Salvar arquivo temporariamente
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log('[Upload] Arquivo salvo temporariamente:', filepath);

    // Upload para R2 Storage (produção) ou manter local (desenvolvimento)
    let storagePath = filepath;
    let r2Url: string | null = null;

    if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
      try {
        console.log('[Upload] Enviando arquivo para R2...');
        const r2Key = `transcriptions/${timestamp}/${filename}`;
        r2Url = await uploadToR2(filepath, r2Key, {
          contentType: file.type,
          metadata: {
            originalFilename: file.name,
            userId,
          },
        });

        // Manter caminho local para processamento, mas registrar URL do R2
        console.log('[Upload] Arquivo enviado para R2:', r2Url);
      } catch (r2Error) {
        console.error('[Upload] Erro ao enviar para R2, usando armazenamento local:', r2Error);
      }
    } else {
      console.log('[Upload] R2 não configurado, usando armazenamento local');
    }

    // Criar registro no banco
    const transcription = await prisma.transcription.create({
      data: {
        userId, // Clerk userId
        originalFilename: file.name,
        fileType: file.type.startsWith('video') ? 'video' : 'audio',
        fileSize: BigInt(file.size),
        storagePath: filepath, // Caminho local para processamento
        language,
        modelSize: enableDiarization ? 'gpt-4o-transcribe-diarize' : 'whisper-1',
        enableDiarization,
        enablePostProcessing,
        status: 'pending',
        progress: 0,
      },
    });

    console.log('[Upload] Registro criado:', transcription.id);

    // Preparar payload
    const payload = {
      transcriptionId: transcription.id,
      filePath: filepath,
      language,
      enableDiarization,
      enablePostProcessing,
    };

    console.log('[Upload] Payload a ser enviado:', JSON.stringify(payload, null, 2));

    // Disparar job do Trigger.dev (processamento em background SEM TIMEOUT!)
    try {
      const handle = await processTranscriptionTask.trigger(payload);
      console.log('[Upload] Job do Trigger.dev disparado:', handle.id);
    } catch (triggerError) {
      console.error('[Upload] Erro ao disparar Trigger.dev:', triggerError);
      throw triggerError;
    }

    return NextResponse.json({
      id: transcription.id,
      status: 'pending',
      progress: 0,
      created_at: transcription.createdAt.toISOString(),
      message: 'Upload concluído. Transcrição iniciada em background.',
    });
  } catch (error) {
    console.error('[Upload] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao processar upload' },
      { status: 500 }
    );
  }
}
