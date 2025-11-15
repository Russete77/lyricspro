'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MusicUploader } from '@/components/ui/MusicUploader';
import { AudioRecorder } from '@/components/ui/AudioRecorder';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUpload } from '@/hooks/useUpload';
import { useToast } from '@/components/ui/Toast';

export default function UploadPage() {
  const router = useRouter();
  const { success, error: showErrorToast } = useToast();
  const { upload, isUploading, uploadProgress, error } = useUpload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [language, setLanguage] = useState('pt');
  const [uploadMode, setUploadMode] = useState<'file' | 'record'>('file');

  // Cleanup do audio URL quando mudar arquivo ou desmontar componente
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const handleFileSelect = (file: File) => {
    // Limpar URL antigo se existir
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }

    setSelectedFile(file);
    setAudioURL(URL.createObjectURL(file));

    // Auto-preencher título com nome do arquivo (sem extensão)
    if (!songTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setSongTitle(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showErrorToast('Selecione um arquivo primeiro');
      return;
    }

    try {
      const response = await upload(selectedFile, {
        language,
        enable_post_processing: true,
      });

      success('Upload concluído! Iniciando transcrição...');

      // Redirecionar para página de processamento
      setTimeout(() => {
        router.push(`/song/${response.id}?processing=true`);
      }, 1000);
    } catch (err) {
      showErrorToast(error || 'Erro ao fazer upload');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Fazer Upload de Música
        </h1>
        <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto">
          Envie seu arquivo de áudio ou vídeo para transcrição inteligente com IA
        </p>
      </div>

      {/* Upload Card */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="space-y-2">
          <CardTitle>Selecionar Arquivo</CardTitle>
          <CardDescription>
            Arraste e solte ou clique para selecionar (MP3, WAV, M4A, MP4, WEBM, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Seletor de modo */}
          <div className="flex gap-2 p-1.5 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                uploadMode === 'file'
                  ? 'bg-brand-primary/20 text-white border border-brand-primary/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Fazer Upload
            </button>
            <button
              onClick={() => setUploadMode('record')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                uploadMode === 'record'
                  ? 'bg-brand-primary/20 text-white border border-brand-primary/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Gravar Áudio
            </button>
          </div>

          {uploadMode === 'file' ? (
            <MusicUploader
              onFileSelect={handleFileSelect}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
              maxSizeMB={500}
            />
          ) : (
            <AudioRecorder
              onRecordingComplete={handleFileSelect}
              maxDurationSeconds={600}
            />
          )}

          {selectedFile && !isUploading && (
            <>
              {/* Player de áudio */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-light">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">Prévia do Áudio</h3>
                    <p className="text-xs text-white/60">{selectedFile.name}</p>
                  </div>
                </div>
                <audio
                  controls
                  className="w-full h-10 rounded-lg"
                  style={{
                    filter: 'invert(1) hue-rotate(180deg)',
                  }}
                  src={audioURL || ''}
                >
                  Seu navegador não suporta o elemento de áudio.
                </audio>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ouça seu arquivo antes de enviar para garantir que está correto
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="space-y-5 pt-2">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Título da Música
                  </label>
                  <Input
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Digite o título da música"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Idioma
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'pt', label: 'Português' },
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Español' },
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => setLanguage(lang.value)}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          language === lang.value
                            ? 'border-brand-primary/50 bg-brand-primary/10 text-white'
                            : 'border-white/10 text-white/60 hover:border-white/20 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="text-sm font-medium">{lang.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botão de upload */}
              <Button
                onClick={handleUpload}
                variant="gradient"
                size="lg"
                fullWidth
                isLoading={isUploading}
                className="mt-2"
              >
                {isUploading ? 'Fazendo Upload...' : 'Iniciar Transcrição'}
              </Button>

              {error && (
                <p className="text-error text-sm text-center">{error}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 gap-4 pt-4">
        <Card variant="glass" padding="lg" className="hover:bg-white/10 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-light">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                Rápido
              </h3>
              <p className="text-sm text-white/60">
                Transcrição em minutos, não horas
              </p>
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="lg" className="hover:bg-white/10 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-light">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                Inteligente
              </h3>
              <p className="text-sm text-white/60">
                Detecta automaticamente estrutura musical
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
