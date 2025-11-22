/**
 * Electron Local Transcription Service
 * Processa transcrições localmente usando OpenAI API
 * Substitui o Trigger.dev quando rodando no Electron
 */

import OpenAI from 'openai';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Cliente Prisma para Electron (SQLite)
let electronPrisma: PrismaClient | null = null;

export function getElectronPrisma(): PrismaClient {
  if (!electronPrisma) {
    electronPrisma = new PrismaClient();
  }
  return electronPrisma;
}

/**
 * Processa uma transcrição usando OpenAI API
 */
export async function processTranscriptionLocal(
  transcriptionId: string,
  apiKey: string
): Promise<void> {
  const prisma = getElectronPrisma();

  try {
    console.log(`[Electron Transcription] Iniciando: ${transcriptionId}`);

    // Buscar transcrição
    const transcription = await prisma.transcription.findUnique({
      where: { id: transcriptionId },
    });

    if (!transcription) {
      throw new Error('Transcrição não encontrada');
    }

    // Atualizar status
    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        status: 'processing',
        startedAt: new Date(),
        currentStage: 'Enviando para OpenAI...',
        progress: 10,
      },
    });

    // Inicializar cliente OpenAI
    const openai = new OpenAI({ apiKey });

    // Verificar se arquivo existe
    if (!fs.existsSync(transcription.storagePath)) {
      throw new Error('Arquivo de áudio não encontrado');
    }

    console.log(`[Electron Transcription] Enviando arquivo: ${transcription.storagePath}`);

    // Criar stream do arquivo
    const fileStream = fs.createReadStream(transcription.storagePath);

    // Atualizar progresso
    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        currentStage: 'Processando com OpenAI Whisper...',
        progress: 30,
      },
    });

    const startTime = Date.now();

    // Chamar API de transcrição da OpenAI
    const response = await openai.audio.transcriptions.create({
      file: fileStream as any,
      model: 'whisper-1',
      language: transcription.language || 'pt',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment', 'word'],
    });

    const processingTime = (Date.now() - startTime) / 1000;

    console.log(`[Electron Transcription] Transcrição recebida em ${processingTime}s`);

    // Atualizar progresso
    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        currentStage: 'Salvando resultados...',
        progress: 80,
      },
    });

    // Extrair texto completo
    const fullText = (response as any).text || '';
    const segments = (response as any).segments || [];
    const words = (response as any).words || [];

    // Calcular estatísticas
    const wordCount = fullText.split(/\s+/).filter((w: string) => w.length > 0).length;
    const detectedLanguage = (response as any).language || transcription.language;

    // Salvar segmentos
    if (segments.length > 0) {
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        await prisma.transcriptionSegment.create({
          data: {
            transcriptionId,
            segmentIndex: i,
            startTime: segment.start,
            endTime: segment.end,
            text: segment.text.trim(),
            confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : null,
            speakerLabel: null, // Whisper API não retorna speaker labels diretamente
            words: segment.words ? JSON.stringify(segment.words) : undefined,
          },
        });
      }
    }

    // Atualizar transcrição como completa
    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        status: 'completed',
        progress: 100,
        currentStage: 'Concluído',
        transcriptionText: fullText,
        wordCount,
        detectedLanguage,
        processingTimeSeconds: processingTime,
        completedAt: new Date(),
      },
    });

    console.log(`[Electron Transcription] Concluída: ${transcriptionId}`);

  } catch (error) {
    console.error(`[Electron Transcription] Erro:`, error);

    // Salvar erro no banco
    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        currentStage: 'Falhou',
      },
    });

    throw error;
  }
}

/**
 * Processa transcrição com diarização (separação de speakers)
 * Nota: A API do Whisper não tem diarização nativa, então usamos pyannote ou similar
 * Por enquanto, vamos apenas processar sem diarização
 */
export async function processWithDiarization(
  transcriptionId: string,
  apiKey: string
): Promise<void> {
  // TODO: Implementar diarização usando pyannote.audio ou similar
  // Por enquanto, apenas processa normalmente
  console.log('[Electron Transcription] Diarização não implementada ainda, processando sem speakers');
  await processTranscriptionLocal(transcriptionId, apiKey);
}

/**
 * Cancela uma transcrição em andamento
 */
export async function cancelTranscription(transcriptionId: string): Promise<void> {
  const prisma = getElectronPrisma();

  await prisma.transcription.update({
    where: { id: transcriptionId },
    data: {
      status: 'failed',
      errorMessage: 'Cancelado pelo usuário',
      currentStage: 'Cancelado',
    },
  });
}

/**
 * Obtém estatísticas de uso
 */
export async function getUsageStats(userId: string): Promise<{
  totalTranscriptions: number;
  totalProcessingTime: number;
  totalWordCount: number;
}> {
  const prisma = getElectronPrisma();

  const transcriptions = await prisma.transcription.findMany({
    where: {
      userId,
      status: 'completed',
    },
    select: {
      processingTimeSeconds: true,
      wordCount: true,
    },
  });

  return {
    totalTranscriptions: transcriptions.length,
    totalProcessingTime: transcriptions.reduce((sum, t) => sum + (t.processingTimeSeconds || 0), 0),
    totalWordCount: transcriptions.reduce((sum, t) => sum + (t.wordCount || 0), 0),
  };
}
