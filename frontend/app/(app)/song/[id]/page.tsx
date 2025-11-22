'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { LyricViewer } from '@/components/ui/LyricViewer';
import { SyncedLyrics } from '@/components/ui/SyncedLyrics';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { ProcessingStatus } from '@/components/ui/ProcessingStatus';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePolling } from '@/hooks/usePolling';
import { useToast } from '@/components/ui/Toast';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import {
  getTranscriptionStatus,
  downloadTranscriptionTXT,
  downloadTranscriptionJSON,
  downloadTranscriptionSRT,
  downloadTranscriptionVTT
} from '@/lib/api';
import type { TranscriptionStatusResponse } from '@/lib/types';

export default function SongDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success } = useToast();

  const jobId = params.id as string;
  const isProcessing = searchParams.get('processing') === 'true';

  const [transcription, setTranscription] = useState<TranscriptionStatusResponse | null>(null);
  const [viewMode, setViewMode] = useState<'synced' | 'edit'>('synced');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Polling se estiver processando
  const { data, isLoading } = usePolling({
    jobId: isProcessing ? jobId : null,
    enabled: isProcessing,
    onComplete: (completedData) => {
      setTranscription(completedData);
      success('Transcrição concluída com sucesso!');
      // Remover query param de processing
      router.replace(`/song/${jobId}`);
    },
  });

  useEffect(() => {
    if (data) {
      setTranscription(data);
    }
  }, [data]);

  // Buscar dados reais da API quando não está processando
  useEffect(() => {
    if (!isProcessing && !transcription) {
      const fetchTranscription = async () => {
        try {
          const data = await getTranscriptionStatus(jobId);
          setTranscription(data);
        } catch (error) {
          console.error('Erro ao buscar transcrição:', error);
        }
      };
      fetchTranscription();
    }
  }, [isProcessing, transcription, jobId]);

  const handleDownload = async (format: string) => {
    try {
      let data: any;
      let content = '';
      let mimeType = '';
      let extension = '';

      // Buscar dados usando as funções da API
      switch (format) {
        case 'txt':
          data = await downloadTranscriptionTXT(jobId);
          content = data.text;
          mimeType = 'text/plain';
          extension = 'txt';
          break;
        case 'json':
          data = await downloadTranscriptionJSON(jobId);
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'srt':
          data = await downloadTranscriptionSRT(jobId);
          content = data.srt;
          mimeType = 'text/plain';
          extension = 'srt';
          break;
        case 'vtt':
          data = await downloadTranscriptionVTT(jobId);
          content = data.vtt;
          mimeType = 'text/vtt';
          extension = 'vtt';
          break;
        default:
          throw new Error('Formato não suportado');
      }

      // Criar blob e fazer download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transcricao-${jobId.slice(0, 8)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success(`Download do formato ${format.toUpperCase()} concluído!`);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      success('Erro ao fazer download. Tente novamente.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Link copiado para a área de transferência!');
  };

  // Só mostra skeleton se está carregando E não tem dados ainda
  if ((isLoading && !transcription) || !transcription) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
        <div className="h-12 w-3/4 bg-white/10 rounded-xl animate-pulse"></div>
        <div className="h-64 w-full bg-white/10 rounded-2xl animate-pulse"></div>
        <div className="h-96 w-full bg-white/10 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  // Se está processando
  if (transcription.status === 'processing' || transcription.status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-0">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Processando Transcrição
          </h1>
          <p className="text-white/60">
            Aguarde enquanto processamos sua música...
          </p>
        </div>

        <Card>
          <CardContent className="py-8">
            <ProcessingStatus
              progress={transcription.progress}
              currentStage={transcription.current_stage || undefined}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se teve erro
  if (transcription.status === 'failed') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-0">
        <Card variant="outline" className="border-error/30 bg-error/5">
          <CardHeader>
            <CardTitle className="text-error">Erro na Transcrição</CardTitle>
            <CardDescription>{transcription.error_message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="gradient" onClick={() => router.push('/upload')}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se está concluído
  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/library')}
            className="flex items-center gap-2 bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Voltar
          </Button>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Transcrição Concluída
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
            <Badge variant="success">Concluído</Badge>
            <span>{formatRelativeTime(transcription.created_at)}</span>
            {transcription.duration && (
              <>
                <span>•</span>
                <span>{formatDuration(transcription.duration)}</span>
              </>
            )}
            {transcription.word_count && (
              <>
                <span>•</span>
                <span>{transcription.word_count} palavras</span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Downloads */}
      {transcription.exports && transcription.exports.length > 0 && (
        <Card id="downloads">
          <CardHeader>
            <CardTitle>Baixar Transcrição</CardTitle>
            <CardDescription>Escolha o formato de exportação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {transcription.exports.map((exp) => (
                <Button
                  key={exp.format}
                  variant="outline"
                  onClick={() => handleDownload(exp.format)}
                  className="bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-brand-primary/10 hover:border-brand-primary/30"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {exp.format.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio Player */}
      {transcription.storage_path && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Áudio Original</CardTitle>
                <CardDescription>Reproduza o áudio original para conferir a transcrição</CardDescription>
              </div>

              {/* Toggle View Mode */}
              {transcription.segments && transcription.segments.length > 0 && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant={viewMode === 'synced' ? 'gradient' : 'outline'}
                    onClick={() => setViewMode('synced')}
                    className={viewMode !== 'synced' ? 'bg-white/5 border-white/10 text-white/80' : ''}
                  >
                    <svg className="w-4 h-4 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="hidden sm:inline">Sincronizado</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'edit' ? 'gradient' : 'outline'}
                    onClick={() => setViewMode('edit')}
                    className={viewMode !== 'edit' ? 'bg-white/5 border-white/10 text-white/80' : ''}
                  >
                    <svg className="w-4 h-4 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Custom Audio Player */}
            <AudioPlayer
              src={`/api/transcriptions/${jobId}/audio`}
              audioRef={audioRef}
            />

            {/* Synced Lyrics View */}
            {viewMode === 'synced' && transcription.segments && transcription.segments.length > 0 && (
              <div className="mt-6">
                <SyncedLyrics
                  segments={transcription.segments}
                  audioRef={audioRef}
                  onSegmentClick={(startTime) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = startTime;
                      audioRef.current.play();
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lyrics - Mostrar apenas no modo Edit */}
      {viewMode === 'edit' && (
        <Card>
          <CardHeader>
            <CardTitle>Letra Transcrita</CardTitle>
            <CardDescription>Clique para editar o texto da transcrição</CardDescription>
          </CardHeader>
          <CardContent>
            <LyricViewer
              lyrics={
                // Usar SEMPRE transcription_text que contém a letra pós-processada com estrutura
                transcription.transcription_text ||
                // Fallback: segments caso não tenha pós-processamento
                (transcription.segments && transcription.segments.length > 0
                  ? transcription.segments.map(seg => seg.text).join(' ')
                  : '')
              }
              editable={true}
              onEdit={(newLyrics) => {
                // Atualizar o estado local imediatamente
                setTranscription({
                  ...transcription,
                  transcription_text: newLyrics,
                });

                // TODO: Implementar chamada API para salvar no backend
                // await updateTranscription(jobId, { transcription_text: newLyrics });

                console.log('Salvando edições:', newLyrics);
                success('Alterações salvas localmente! (Backend API pendente)');
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
