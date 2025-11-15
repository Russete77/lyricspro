'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SongCard } from '@/components/ui/SongCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { listTranscriptions, deleteTranscription } from '@/lib/api';
import type { Song, TranscriptionStatus } from '@/lib/types';

export default function LibraryPage() {
  const router = useRouter();
  const { success } = useToast();

  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'processing'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  // Carregar transcrições do backend
  const loadTranscriptions = async () => {
    try {
      setIsLoading(true);

      // Tentar buscar do backend
      try {
        const response = await listTranscriptions({
          limit: 50,
          status: filter !== 'all' ? filter : undefined,
        });

        // Mapear para formato Song
        const songs: Song[] = response.items.map((t: any) => ({
          id: t.id,
          title: t.title || t.original_filename || `Transcrição ${t.id.slice(0, 8)}`,
          status: t.status as TranscriptionStatus,
          progress: t.progress || 0,
          duration: t.duration || null,
          created_at: t.created_at || new Date().toISOString(),
          completed_at: t.completed_at || null,
          preview: t.preview ? t.preview.slice(0, 150) : null,
          chapters: [],
        }));

        setSongs(songs);
      } catch (apiError) {
        console.error('API não disponível, usando dados de exemplo:', apiError);

        // Fallback para MOCK apenas se API falhar
        const MOCK_SONGS: Song[] = [
          {
            id: '1',
            title: 'Exemplo - API offline',
            status: 'completed',
            progress: 100,
            duration: 307,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            completed_at: new Date(Date.now() - 1800000).toISOString(),
            preview: 'Dados de exemplo - conecte o backend para ver suas transcrições reais',
            chapters: [],
          },
        ];

        setSongs(MOCK_SONGS);
      }
    } catch (error) {
      console.error('Erro ao carregar transcrições:', error);
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTranscriptions();
  }, [filter]);

  const filteredSongs = songs.filter((song) => {
    // Filtro por status
    if (filter !== 'all' && song.status !== filter) {
      return false;
    }

    // Filtro por busca
    if (searchQuery && !song.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleDelete = (song: Song) => {
    setSongToDelete(song);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (songToDelete) {
      try {
        await deleteTranscription(songToDelete.id);
        setSongs(songs.filter((s) => s.id !== songToDelete.id));
        success('Música deletada com sucesso!');
        setDeleteModalOpen(false);
        setSongToDelete(null);
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  const counts = {
    all: songs.length,
    completed: songs.filter((s) => s.status === 'completed').length,
    processing: songs.filter((s) => s.status === 'processing').length,
  };

  return (
    <div className="space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Minha Biblioteca
          </h1>
          <p className="text-white/60 mt-2">
            {counts.all} {counts.all === 1 ? 'música' : 'músicas'} no total
          </p>
        </div>

        <Button
          onClick={() => router.push('/upload')}
          variant="gradient"
          className="w-full sm:w-auto"
        >
          + Nova Música
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar músicas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all' as const, label: 'Todas' },
            { value: 'completed' as const, label: 'Concluídas' },
            { value: 'processing' as const, label: 'Processando' },
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                filter === filterOption.value
                  ? 'bg-brand-primary/20 text-white border border-brand-primary/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <span className="whitespace-nowrap">{filterOption.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                filter === filterOption.value
                  ? 'bg-white/20'
                  : 'bg-white/10'
              }`}>
                {counts[filterOption.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Songs Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 space-y-4 border border-white/10 animate-pulse">
              <div className="h-6 w-3/4 bg-white/10 rounded"></div>
              <div className="h-4 w-1/2 bg-white/10 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/10 rounded"></div>
                <div className="h-4 w-full bg-white/10 rounded"></div>
                <div className="h-4 w-2/3 bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredSongs.length === 0 ? (
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-24 h-24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
          }
          title={searchQuery ? 'Nenhum resultado encontrado' : 'Nenhuma música ainda'}
          description={
            searchQuery
              ? `Não encontramos músicas com "${searchQuery}"`
              : 'Faça upload da sua primeira música para começar a transcrever'
          }
          action={
            <Button onClick={() => router.push('/upload')} variant="primary">
              Fazer Upload
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onView={() => router.push(`/song/${song.id}`)}
              onDelete={() => handleDelete(song)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} size="sm">
        <ModalHeader>
          <h2 className="text-xl font-semibold text-white">
            Deletar música?
          </h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-white/60">
            Esta ação não pode ser desfeita. A música "{songToDelete?.title}" será
            permanentemente removida.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="error" onClick={confirmDelete}>
            Deletar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
