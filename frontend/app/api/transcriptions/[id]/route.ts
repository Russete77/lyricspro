/**
 * API Route: Get transcription status
 * GET /api/transcriptions/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transcription = await prisma.transcription.findUnique({
      where: { id },
      include: {
        segments: {
          orderBy: { segmentIndex: 'asc' },
        },
        chapters: {
          orderBy: { chapterIndex: 'asc' },
        },
      },
    });

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcrição não encontrada' },
        { status: 404 }
      );
    }

    // Converter BigInt para number para JSON
    const response = {
      id: transcription.id,
      status: transcription.status,
      progress: transcription.progress,
      current_stage: transcription.currentStage,
      original_filename: transcription.originalFilename,
      file_type: transcription.fileType,
      file_size: Number(transcription.fileSize),
      storage_path: transcription.storagePath,
      duration: transcription.duration,
      language: transcription.language,
      detected_language: transcription.detectedLanguage,
      model_size: transcription.modelSize,
      enable_diarization: transcription.enableDiarization,
      enable_post_processing: transcription.enablePostProcessing,
      transcription_text: transcription.transcriptionText,
      word_count: transcription.wordCount,
      speaker_count: transcription.speakerCount,
      average_confidence: transcription.averageConfidence
        ? Number(transcription.averageConfidence)
        : null,
      processing_time_seconds: transcription.processingTimeSeconds,
      error_message: transcription.errorMessage,
      created_at: transcription.createdAt.toISOString(),
      started_at: transcription.startedAt?.toISOString() || null,
      completed_at: transcription.completedAt?.toISOString() || null,
      exports: transcription.status === 'completed' ? [
        { format: 'txt', size: 0 },
        { format: 'json', size: 0 },
        { format: 'srt', size: 0 },
        { format: 'vtt', size: 0 },
      ] : [],
      segments: transcription.segments.map((seg) => ({
        id: seg.id,
        segment_index: seg.segmentIndex,
        start_time: Number(seg.startTime),
        end_time: Number(seg.endTime),
        text: seg.text,
        speaker_label: seg.speakerLabel,
        confidence: seg.confidence ? Number(seg.confidence) : null,
      })),
      chapters: transcription.chapters.map((ch) => ({
        id: ch.id,
        chapter_index: ch.chapterIndex,
        start_time: Number(ch.startTime),
        end_time: Number(ch.endTime),
        title: ch.title,
        summary: ch.summary,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Status] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transcriptions/[id]
 * Deleta uma transcrição
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Deletar transcrição (cascade delete vai remover segments e chapters)
    await prisma.transcription.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Delete] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar transcrição' },
      { status: 500 }
    );
  }
}
