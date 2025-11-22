/**
 * Processamento Local de Transcrição
 * Usado quando rodando em desenvolvimento (sem Trigger.dev)
 */

import prisma from '@/lib/prisma';
import { transcribeAudio, postProcessText } from '@/lib/openai-server';
import { downloadFromR2 } from '@/lib/r2-storage';
import path from 'path';
import fs from 'fs';
import { mkdir } from 'fs/promises';

/**
 * Processa transcrição localmente (sem Trigger.dev)
 * Roda em background via setImmediate para não bloquear a resposta da API
 */
export async function processTranscriptionLocally(
  transcriptionId: string,
  filePath: string, // Caminho no R2
  language: string,
  enableDiarization: boolean,
  enablePostProcessing: boolean
): Promise<void> {
  let localFilePath: string | null = null;

  try {
    console.log(`[Local] Iniciando transcrição ${transcriptionId}`);

    // Importar dinamicamente para evitar erros no cliente
    const { validateOpenAIKey } = await import('@/lib/openai-server');

    // Validar API key antes de começar
    const validation = await validateOpenAIKey();
    if (!validation.valid) {
      throw new Error(`OpenAI API: ${validation.error}`);
    }

    // 1. Atualizar status para processing
    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        status: 'processing',
        progress: 0,
        currentStage: 'downloading',
        startedAt: new Date(),
      },
    });

    // 2. Baixar arquivo do R2 para processamento local
    const tempDir = path.join(process.cwd(), '.tmp', 'transcriptions');
    await mkdir(tempDir, { recursive: true });

    const ext = path.extname(filePath) || '.mp3';
    localFilePath = path.join(tempDir, `${transcriptionId}${ext}`);

    console.log(`[Local] Baixando arquivo do R2: ${filePath} -> ${localFilePath}`);
    await downloadFromR2(filePath, localFilePath);

    // 3. Progresso: 25%
    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        progress: 25,
        currentStage: 'transcription',
      },
    });

    console.log(`[Local] Transcrevendo áudio...`);

    // 4. Transcrever com OpenAI
    const transcriptionResult = await transcribeAudio(localFilePath, {
      language,
      enableDiarization,
    });

    // 5. Progresso: 50%
    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        progress: 50,
        detectedLanguage: transcriptionResult.language,
        speakerCount: transcriptionResult.speakerCount,
      },
    });

    // 6. Salvar segmentos
    if (transcriptionResult.segments.length > 0) {
      await prisma.transcriptionSegment.createMany({
        data: transcriptionResult.segments.map((seg, idx) => ({
          transcriptionId,
          segmentIndex: idx,
          startTime: seg.start,
          endTime: seg.end,
          text: seg.text,
          speakerLabel: seg.speaker,
          confidence: 0.95,
        })),
      });
    }

    let finalText = transcriptionResult.text;

    // 7. Pós-processar se habilitado
    if (enablePostProcessing) {
      console.log(`[Local] Pós-processando...`);

      await prisma.transcription.update({
        where: { id: transcriptionId },
        data: {
          progress: 75,
          currentStage: 'post_processing',
        },
      });

      const postProcessed = await postProcessText(
        transcriptionResult.text,
        transcriptionResult.language
      );
      finalText = postProcessed.text;
    }

    // 8. Finalizar
    const wordCount = finalText.split(/\s+/).length;

    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        status: 'completed',
        progress: 100,
        transcriptionText: finalText,
        wordCount,
        averageConfidence: 0.95,
        completedAt: new Date(),
        processingTimeSeconds: 0,
      },
    });

    console.log(`[Local] Transcrição ${transcriptionId} concluída!`);
  } catch (error) {
    console.error(`[Local] Erro na transcrição ${transcriptionId}:`, error);

    // Marcar como failed
    await prisma.transcription.update({
      where: { id: transcriptionId },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        completedAt: new Date(),
      },
    });
  } finally {
    // Limpar arquivo local temporário
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log(`[Local] Arquivo local removido: ${localFilePath}`);
      } catch (cleanupError) {
        console.error(`[Local] Erro ao remover arquivo local:`, cleanupError);
      }
    }
  }
}

/**
 * Inicia processamento local em background
 * Não espera a conclusão para retornar
 */
export function startLocalProcessing(
  transcriptionId: string,
  filePath: string,
  language: string,
  enableDiarization: boolean,
  enablePostProcessing: boolean
): void {
  // Executar em background sem bloquear a resposta
  setImmediate(() => {
    processTranscriptionLocally(
      transcriptionId,
      filePath,
      language,
      enableDiarization,
      enablePostProcessing
    ).catch((error) => {
      console.error('[Local] Erro fatal no processamento:', error);
    });
  });
}
