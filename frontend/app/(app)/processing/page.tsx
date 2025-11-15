'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SongCard } from '@/components/ui/SongCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { listTranscriptions } from '@/lib/api';
import type { Song, TranscriptionStatus } from '@/lib/types';

export default function ProcessingPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar transcrições em processamento
  const loadProcessingSongs = async () => {
    try {
      const response = await listTranscriptions({
        limit: 50,
        status: 'processing',
      });

      const processingSongs: Song[] = response.items
        .filter((t: any) => t.status === 'processing' || t.status === 'pending')
        .map((t: any) => ({
          id: t.id,
          title: t.title || `Transcrição ${t.id.slice(0, 8)}`,
          status: t.status as TranscriptionStatus,
          progress: t.progress || 0,
          duration: t.duration || null,
          created_at: t.created_at || new Date().toISOString(),
          completed_at: t.completed_at || null,
          preview: t.preview,
          chapters: [],
        }));

      setSongs(processingSongs);
    } catch (error) {
      console.error('Erro ao carregar músicas em processamento:', error);
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar inicialmente
  useEffect(() => {
    loadProcessingSongs();
  }, []);

  // Atualizar a cada 3 segundos (polling para tempo real)
  useEffect(() => {
    const interval = setInterval(() => {
      loadProcessingSongs();
    }, 3000); // Atualiza a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 px-4 sm:px-0">
        <div>
          <div className="h-10 w-3/4 bg-white/10 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-1/2 bg-white/10 rounded animate-pulse"></div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 space-y-4 border border-white/10 animate-pulse">
              <div className="h-6 w-3/4 bg-white/10 rounded"></div>
              <div className="h-4 w-1/2 bg-white/10 rounded"></div>
              <div className="h-2 w-full bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Músicas em Processamento
          </h1>
          <p className="text-white/60">
            {songs.length} {songs.length === 1 ? 'música sendo processada' : 'músicas sendo processadas'}
          </p>
        </div>

        {/* Indicador de atualização automática */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <div className="relative">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-brand-primary rounded-full animate-ping"></div>
          </div>
          <span>Atualizando em tempo real</span>
        </div>
      </div>

      {/* Songs List */}
      {songs.length === 0 ? (
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-24 h-24 text-white/40"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="Nenhuma música processando"
          description="Todas as suas músicas já foram processadas"
          action={null}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onView={() => router.push(`/song/${song.id}?processing=true`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
