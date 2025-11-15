'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Segment {
  start?: number;
  end?: number;
  start_time?: number;
  end_time?: number;
  text: string;
  speaker?: string | null;
  speaker_label?: string;
}

interface SyncedLyricsProps {
  segments: Segment[];
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onSegmentClick?: (startTime: number) => void;
}

export function SyncedLyrics({ segments, audioRef, onSegmentClick }: SyncedLyricsProps) {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Atualizar índice do segmento atual baseado no tempo do áudio
  const updateCurrentSegment = useCallback(() => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;

    // Encontrar o índice do segmento atual
    const index = segments.findIndex(
      (seg) => {
        const start = seg.start ?? seg.start_time ?? 0;
        const end = seg.end ?? seg.end_time ?? 0;
        return currentTime >= start && currentTime < end;
      }
    );

    if (index !== currentSegmentIndex) {
      setCurrentSegmentIndex(index);

      // Auto-scroll para o segmento ativo
      if (index >= 0 && segmentRefs.current[index] && containerRef.current) {
        segmentRefs.current[index]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [segments, currentSegmentIndex, audioRef]);

  // Event listener para timeupdate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', updateCurrentSegment);

    return () => {
      audio.removeEventListener('timeupdate', updateCurrentSegment);
    };
  }, [audioRef, updateCurrentSegment]);

  // Click em um segmento para pular para aquele tempo
  const handleSegmentClick = (index: number) => {
    const segment = segments[index];
    if (audioRef.current && onSegmentClick) {
      const startTime = segment.start ?? segment.start_time ?? 0;
      onSegmentClick(startTime);
    }
  };

  // Formatar tempo para exibição (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (segments.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        Nenhum segmento disponível para sincronização.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="space-y-1 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
    >
      {segments.map((segment, index) => {
        const isActive = index === currentSegmentIndex;
        const isPast = currentSegmentIndex > index;

        return (
          <div
            key={index}
            ref={(el) => { segmentRefs.current[index] = el; }}
            onClick={() => handleSegmentClick(index)}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer',
              isActive && 'bg-brand-primary/20 border border-brand-primary/50 scale-105',
              !isActive && 'bg-white/5 hover:bg-white/10',
              isPast && 'opacity-50'
            )}
          >
            {/* Timestamp */}
            <div className="flex-shrink-0 w-14 text-xs text-white/60 font-mono pt-0.5">
              {formatTime(segment.start ?? segment.start_time ?? 0)}
            </div>

            {/* Speaker (se houver) */}
            {segment.speaker_label && (
              <div
                className={cn(
                  'flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium',
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'bg-white/10 text-white/70'
                )}
              >
                {segment.speaker_label}
              </div>
            )}

            {/* Text */}
            <div
              className={cn(
                'flex-1 text-sm leading-relaxed transition-all duration-300',
                isActive
                  ? 'text-white font-medium text-base'
                  : 'text-white/80'
              )}
            >
              {segment.text}
            </div>

            {/* Play icon (quando ativo) */}
            {isActive && (
              <div className="flex-shrink-0 animate-pulse">
                <svg
                  className="w-4 h-4 text-brand-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.5 3.5A1.5 1.5 0 004 5v10a1.5 1.5 0 002.5 1.5l8-5a1.5 1.5 0 000-3l-8-5z" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
