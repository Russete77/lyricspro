'use client';

import type { Song } from '@/lib/types';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Progress } from './Progress';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  onView?: () => void;
  onDelete?: () => void;
}

export function SongCard({ song, onView, onDelete }: SongCardProps) {
  const statusVariants = {
    completed: { variant: 'success' as const, label: 'Concluído' },
    processing: { variant: 'warning' as const, label: 'Processando' },
    failed: { variant: 'error' as const, label: 'Erro' },
    pending: { variant: 'info' as const, label: 'Pendente' },
  };

  const statusConfig = statusVariants[song.status];

  return (
    <Card
      className={cn(
        'group relative transition-all duration-300 hover:border-brand-primary/30 cursor-pointer hover:scale-[1.02]',
        song.status === 'processing' && 'border-warning/30 animate-pulse-slow'
      )}
      padding="lg"
      onClick={onView}
    >
      <CardContent className="space-y-4">
        {/* Quick Actions - Sempre visível em mobile, hover em desktop */}
        <div className="absolute top-4 right-4 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10">
          {song.status === 'completed' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.();
                }}
                className="p-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 hover:bg-brand-primary/20 hover:border-brand-primary/40 transition-all hover:scale-110"
                title="Ver transcrição"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <a
                href={`/song/${song.id}#downloads`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 hover:bg-brand-primary/20 hover:border-brand-primary/40 transition-all hover:scale-110"
                title="Ver opções de download"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 bg-error/20 backdrop-blur-xl rounded-lg border border-error/30 hover:bg-error/30 transition-all hover:scale-110"
              title="Deletar"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 pr-20 sm:pr-0">
          <div className="flex-1 min-w-0 max-w-full">
            <h3 className="text-base sm:text-lg font-semibold text-white truncate mb-1 group-hover:text-brand-light transition-colors break-all">
              {song.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>{formatRelativeTime(song.created_at)}</span>
              {song.duration && (
                <>
                  <span>•</span>
                  <span>{formatDuration(song.duration)}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant={statusConfig.variant} size="sm" className="self-start">
            {statusConfig.label}
          </Badge>
        </div>

        {/* Progress bar (se processando) */}
        {song.status === 'processing' && (
          <Progress value={song.progress} showPercentage gradient />
        )}

        {/* Preview da letra */}
        {song.preview && song.status === 'completed' && (
          <div className="relative">
            <p className="text-sm text-white/70 line-clamp-3 leading-relaxed italic">
              "{song.preview}"
            </p>
            <div className="absolute bottom-0 right-0 h-6 w-16 bg-gradient-to-l from-brand-dark to-transparent"></div>
          </div>
        )}

        {/* Estrutura musical detectada */}
        {song.chapters.length > 0 && song.status === 'completed' && (
          <div className="flex flex-wrap gap-2">
            {song.chapters.slice(0, 5).map((chapter, idx) => (
              <Badge key={idx} variant="default" size="sm" className="text-xs">
                {chapter.title}
              </Badge>
            ))}
            {song.chapters.length > 5 && (
              <Badge variant="default" size="sm" className="text-xs font-bold">
                +{song.chapters.length - 5} mais
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
