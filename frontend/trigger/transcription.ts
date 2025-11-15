/**
 * Trigger.dev Task: Transcrição de Áudio
 * Processa transcrições em background sem timeout
 */

import { schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { mkdir } from "fs/promises";
import prisma from "@/lib/prisma";
import { transcribeAudio, postProcessText } from "@/lib/openai-server";
import { downloadFromR2 } from "@/lib/r2-storage";

// Schema de validação do payload
const TranscriptionPayloadSchema = z.object({
  transcriptionId: z.string(),
  filePath: z.string(),
  language: z.string(),
  enableDiarization: z.boolean(),
  enablePostProcessing: z.boolean(),
});

export const processTranscriptionTask = schemaTask({
  id: "process-transcription",
  schema: TranscriptionPayloadSchema,
  maxDuration: 3600, // 1 hora (sem timeout!)
  run: async (payload) => {
    console.log('[Trigger] Payload recebido:', JSON.stringify(payload, null, 2));

    const { transcriptionId, filePath, language, enableDiarization, enablePostProcessing } = payload;

    console.log(`[Trigger] Iniciando transcrição ${transcriptionId}`);

    let localFilePath: string | null = null;

    try {
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
      const tempDir = path.join('/tmp', 'transcriptions');
      await mkdir(tempDir, { recursive: true });

      const ext = path.extname(filePath) || '.mp3';
      localFilePath = path.join(tempDir, `${transcriptionId}${ext}`);

      console.log(`[Trigger] Baixando arquivo do R2: ${filePath} -> ${localFilePath}`);
      await downloadFromR2(filePath, localFilePath);

      // 3. Progresso: 25%
      await prisma.transcription.update({
        where: { id: transcriptionId },
        data: {
          progress: 25,
          currentStage: 'transcription',
        },
      });

      console.log(`[Trigger] Transcrevendo áudio...`);

      // 4. Transcrever com OpenAI
      const transcriptionResult = await transcribeAudio(localFilePath, {
        language,
        enableDiarization,
      });

      // 4. Progresso: 50%
      await prisma.transcription.update({
        where: { id: transcriptionId },
        data: {
          progress: 50,
          detectedLanguage: transcriptionResult.language,
          speakerCount: transcriptionResult.speakerCount,
        },
      });

      // 5. Salvar segmentos
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

      // 6. Pós-processar se habilitado
      if (enablePostProcessing) {
        console.log(`[Trigger] Pós-processando...`);

        await prisma.transcription.update({
          where: { id: transcriptionId },
          data: {
            progress: 75,
            currentStage: 'post_processing',
          },
        });

        const postProcessed = await postProcessText(transcriptionResult.text);
        finalText = postProcessed.text;
      }

      // 7. Finalizar
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

      console.log(`[Trigger] Transcrição ${transcriptionId} concluída!`);

      return {
        success: true,
        transcriptionId,
        wordCount,
        segments: transcriptionResult.segments.length,
      };
    } catch (error) {
      console.error(`[Trigger] Erro na transcrição ${transcriptionId}:`, error);

      // Marcar como failed
      await prisma.transcription.update({
        where: { id: transcriptionId },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
          completedAt: new Date(),
        },
      });

      throw error;
    } finally {
      // Limpar arquivo local temporário
      if (localFilePath && fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
          console.log(`[Trigger] Arquivo local removido: ${localFilePath}`);
        } catch (cleanupError) {
          console.error(`[Trigger] Erro ao remover arquivo local:`, cleanupError);
        }
      }
    }
  },
});
