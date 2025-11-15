/**
 * API Route: Download transcription in various formats
 * GET /api/transcriptions/[id]/download?format=txt|srt|vtt|json
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const format = request.nextUrl.searchParams.get('format') || 'txt';

    const transcription = await prisma.transcription.findUnique({
      where: { id },
      include: {
        segments: {
          orderBy: { segmentIndex: 'asc' },
        },
      },
    });

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcrição não encontrada' },
        { status: 404 }
      );
    }

    if (transcription.status !== 'completed') {
      return NextResponse.json(
        { error: 'Transcrição ainda não foi concluída' },
        { status: 400 }
      );
    }

    const filename = transcription.originalFilename.replace(/\.[^/.]+$/, '');
    let content: string;
    let contentType: string;
    let fileExtension: string;

    switch (format) {
      case 'srt':
        content = generateSRT(transcription.segments);
        contentType = 'application/x-subrip';
        fileExtension = 'srt';
        break;

      case 'vtt':
        content = generateVTT(transcription.segments);
        contentType = 'text/vtt';
        fileExtension = 'vtt';
        break;

      case 'json':
        content = JSON.stringify(
          {
            id: transcription.id,
            original_filename: transcription.originalFilename,
            language: transcription.detectedLanguage || transcription.language,
            speaker_count: transcription.speakerCount,
            word_count: transcription.wordCount,
            text: transcription.transcriptionText,
            segments: transcription.segments.map((seg) => ({
              start: Number(seg.startTime),
              end: Number(seg.endTime),
              text: seg.text,
              speaker: seg.speakerLabel,
              confidence: seg.confidence ? Number(seg.confidence) : null,
            })),
          },
          null,
          2
        );
        contentType = 'application/json';
        fileExtension = 'json';
        break;

      case 'txt':
      default:
        content = transcription.transcriptionText || '';
        contentType = 'text/plain';
        fileExtension = 'txt';
        break;
    }

    return new Response(content, {
      headers: {
        'Content-Type': `${contentType}; charset=utf-8`,
        'Content-Disposition': `attachment; filename="${filename}.${fileExtension}"`,
      },
    });
  } catch (error) {
    console.error('[Download] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar download' },
      { status: 500 }
    );
  }
}

/**
 * Gera arquivo SRT (SubRip)
 */
function generateSRT(segments: any[]): string {
  return segments
    .map((seg, idx) => {
      const start = formatTime(Number(seg.startTime), 'srt');
      const end = formatTime(Number(seg.endTime), 'srt');
      const speaker = seg.speakerLabel ? `[${seg.speakerLabel}] ` : '';

      return `${idx + 1}\n${start} --> ${end}\n${speaker}${seg.text}\n`;
    })
    .join('\n');
}

/**
 * Gera arquivo VTT (WebVTT)
 */
function generateVTT(segments: any[]): string {
  const header = 'WEBVTT\n\n';
  const body = segments
    .map((seg) => {
      const start = formatTime(Number(seg.startTime), 'vtt');
      const end = formatTime(Number(seg.endTime), 'vtt');
      const speaker = seg.speakerLabel ? `<v ${seg.speakerLabel}>` : '';

      return `${start} --> ${end}\n${speaker}${seg.text}\n`;
    })
    .join('\n');

  return header + body;
}

/**
 * Formata tempo em segundos para HH:MM:SS,mmm ou HH:MM:SS.mmm
 */
function formatTime(seconds: number, format: 'srt' | 'vtt'): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const separator = format === 'srt' ? ',' : '.';

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}${separator}${String(ms).padStart(3, '0')}`;
}
