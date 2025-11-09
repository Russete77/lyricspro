'use client';

import { useState } from 'react';
import type { TranscriptionChapter, TranscriptionSegment } from '@/lib/types';
import { StructureBadge } from './StructureBadge';
import { Button } from './Button';
import { Textarea } from './Textarea';

interface LyricViewerProps {
  lyrics: string;
  chapters?: TranscriptionChapter[];
  segments?: TranscriptionSegment[];
  editable?: boolean;
  onEdit?: (newLyrics: string) => void;
}

export function LyricViewer({
  lyrics,
  chapters = [],
  segments = [],
  editable = false,
  onEdit,
}: LyricViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState(lyrics);

  const handleSave = () => {
    onEdit?.(editedLyrics);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedLyrics(lyrics);
    setIsEditing(false);
  };

  const getStructureType = (title: string): 'verso' | 'refrao' | 'ponte' | 'intro' => {
    const normalized = title.toLowerCase();
    if (normalized.includes('verso')) return 'verso';
    if (normalized.includes('refrão') || normalized.includes('refrao')) return 'refrao';
    if (normalized.includes('ponte')) return 'ponte';
    return 'intro';
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <Textarea
          value={editedLyrics}
          onChange={(e) => setEditedLyrics(e.target.value)}
          className="min-h-[400px] font-mono text-lyrics leading-loose text-white"
          placeholder="Digite a letra da música..."
        />
        <div className="flex gap-3">
          <Button onClick={handleSave} variant="primary">
            Salvar Alterações
          </Button>
          <Button onClick={handleCancel} variant="ghost">
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {editable && (
        <div className="flex justify-end">
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            Editar Letra
          </Button>
        </div>
      )}

      {chapters.length > 0 ? (
        // Renderizar com capítulos
        <div className="space-y-8">
          {chapters.map((chapter, idx) => (
            <div key={idx} className="space-y-4">
              <StructureBadge type={getStructureType(chapter.title)}>
                {chapter.title}
              </StructureBadge>

              {chapter.summary && (
                <p className="text-sm text-white/60 italic">
                  {chapter.summary}
                </p>
              )}

              {/* Encontrar segmentos deste capítulo */}
              <div className="text-lyrics leading-loose whitespace-pre-wrap text-white">
                {segments
                  .filter(
                    (seg) => seg.start >= chapter.start && seg.end <= chapter.end
                  )
                  .map((seg, i) => (
                    <p key={i} className="mb-2">
                      {seg.text}
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Renderizar texto simples
        <div className="text-lyrics leading-loose whitespace-pre-wrap text-white">
          {lyrics}
        </div>
      )}
    </div>
  );
}
