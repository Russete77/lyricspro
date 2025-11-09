'use client';

import { Progress } from './Progress';
import { cn } from '@/lib/utils';

const STAGES = [
  { id: 'upload', label: 'Upload', range: [0, 5] },
  { id: 'audio_extraction', label: 'Extração de Áudio', range: [5, 15] },
  { id: 'noise_reduction', label: 'Redução de Ruído', range: [15, 25] },
  { id: 'vocal_separation', label: 'Separação Vocal', range: [25, 35] },
  { id: 'transcription', label: 'Transcrição', range: [35, 75] },
  { id: 'punctuation', label: 'Pontuação', range: [75, 85] },
  { id: 'post_processing', label: 'Pós-processamento', range: [85, 95] },
  { id: 'finalization', label: 'Finalização', range: [95, 100] },
];

interface ProcessingStatusProps {
  progress: number; // 0-100
  currentStage?: string;
  estimatedTimeRemaining?: number; // segundos
}

export function ProcessingStatus({
  progress,
  currentStage,
  estimatedTimeRemaining,
}: ProcessingStatusProps) {
  const getCurrentStageIndex = () => {
    if (currentStage) {
      const idx = STAGES.findIndex((s) => s.id === currentStage);
      if (idx !== -1) return idx;
    }

    // Inferir do progresso
    for (let i = 0; i < STAGES.length; i++) {
      const [min, max] = STAGES[i].range;
      if (progress >= min && progress <= max) {
        return i;
      }
    }
    return 0;
  };

  const activeIndex = getCurrentStageIndex();

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">
            Processando...
          </span>
          {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
            <span className="text-sm text-white/60">
              ~{formatTime(estimatedTimeRemaining)} restantes
            </span>
          )}
        </div>
        <Progress value={progress} showPercentage gradient />
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {STAGES.map((stage, idx) => {
          const isActive = idx === activeIndex;
          const isCompleted = idx < activeIndex || progress >= stage.range[1];

          return (
            <div
              key={stage.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all',
                isActive && 'bg-brand-primary/10 border border-brand-primary/30',
                isCompleted && 'opacity-60'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                  isCompleted
                    ? 'bg-success text-white'
                    : isActive
                    ? 'bg-brand-primary text-white'
                    : 'bg-white/10 text-white/40'
                )}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isActive
                      ? 'text-brand-light'
                      : 'text-white'
                  )}
                >
                  {stage.label}
                </p>
                {isActive && (
                  <p className="text-xs text-white/60 mt-0.5">
                    Em andamento...
                  </p>
                )}
              </div>

              {/* Spinner (se ativo) */}
              {isActive && (
                <div className="animate-spin h-4 w-4 border-2 border-brand-light border-t-transparent rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
