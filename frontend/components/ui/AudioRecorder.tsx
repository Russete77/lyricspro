'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
  maxDurationSeconds?: number;
}

export function AudioRecorder({
  onRecordingComplete,
  maxDurationSeconds = 300 // 5 minutos padrão
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      stopRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Analisar nível de áudio
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255); // Normalizar para 0-1

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startRecording = async () => {
    try {
      setError(null);
      audioChunksRef.current = [];

      // Solicitar permissão de microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      streamRef.current = stream;

      // Configurar visualização de áudio
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyzeAudio();

      // Configurar MediaRecorder com o melhor formato disponível
      let mimeType = 'audio/webm';
      let extension = 'webm';

      // Tentar formatos em ordem de preferência
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
        extension = 'wav';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
        extension = 'm4a';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
        extension = 'webm';
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000 // 128kbps para boa qualidade
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Validar se tem áudio gravado
        if (audioChunksRef.current.length === 0) {
          setError('Nenhum áudio foi gravado. Verifique se o microfone está funcionando.');
          cleanup();
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Validar tamanho mínimo (pelo menos 1KB para considerar válido)
        if (audioBlob.size < 1024) {
          setError('Áudio muito curto ou vazio. Grave pelo menos 1 segundo de áudio.');
          cleanup();
          return;
        }

        const audioFile = new File(
          [audioBlob],
          `recording-${Date.now()}.${extension}`,
          { type: mimeType }
        );

        console.log('Arquivo de áudio criado:', {
          name: audioFile.name,
          size: audioFile.size,
          type: audioFile.type,
          duration: duration
        });

        onRecordingComplete(audioFile);
        cleanup();
      };

      mediaRecorder.start(100); // Coletar dados a cada 100ms
      setIsRecording(true);
      setDuration(0);

      // Timer de duração
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDurationSeconds) {
            stopRecording(true);
          }
          return newDuration;
        });
      }, 1000);

    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Permissão negada. Por favor, permita o acesso ao microfone.');
        } else if (err.name === 'NotFoundError') {
          setError('Microfone não encontrado. Verifique se há um microfone conectado.');
        } else {
          setError('Erro ao acessar microfone. Tente novamente.');
        }
      } else {
        setError('Erro desconhecido ao iniciar gravação.');
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const stopRecording = (save: boolean = true) => {
    if (mediaRecorderRef.current && isRecording) {
      if (save) {
        mediaRecorderRef.current.stop();
      } else {
        cleanup();
      }
    }
  };

  const cleanup = () => {
    // Parar todas as tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Fechar AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Limpar timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioLevel(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className={cn(
        "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 backdrop-blur-xl",
        isRecording
          ? "border-brand-primary bg-brand-primary/10 shadow-glow animate-pulse-slow"
          : "border-white/20 bg-white/5 hover:border-brand-primary/50 hover:bg-white/10"
      )}>
        <div className="flex flex-col items-center text-center">
          {!isRecording ? (
            <>
              <div className="w-16 h-16 mb-4 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-white mb-2">
                Gravar Áudio
              </p>
              <p className="text-sm text-white/80 mb-4">
                Clique para começar a gravar do microfone
              </p>
              <Button
                variant="glass"
                onClick={startRecording}
                className="min-w-[150px]"
              >
                🎙️ Iniciar Gravação
              </Button>
            </>
          ) : (
            <>
              {/* Visualização de áudio aprimorada */}
              <div className="w-40 h-40 mb-6 relative">
                {/* Anel externo pulsante */}
                <div className={cn(
                  "absolute inset-0 rounded-full bg-brand-primary/10 animate-ping",
                  isPaused && "opacity-0"
                )} />
                {/* Anel médio */}
                <div className={cn(
                  "absolute inset-0 rounded-full bg-brand-primary/20",
                  isPaused && "opacity-30"
                )} />
                {/* Anel interno reativo ao áudio */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full bg-gradient-to-br from-brand-primary to-brand-light transition-all duration-100",
                    isPaused && "opacity-30"
                  )}
                  style={{
                    transform: `scale(${0.7 + audioLevel * 0.5})`,
                    boxShadow: `0 0 ${30 + audioLevel * 50}px rgba(116, 53, 253, ${0.3 + audioLevel * 0.4})`
                  }}
                />
                {/* Ícone central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-20 h-20 text-white drop-shadow-glow"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
              </div>

              <div className="mb-6 space-y-2">
                <p className="text-4xl font-bold text-white mb-2 font-mono tracking-wider">
                  {formatTime(duration)}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    isPaused ? "bg-yellow-400" : "bg-brand-primary animate-pulse"
                  )} />
                  <p className="text-sm font-medium text-white/90">
                    {isPaused ? 'Gravação Pausada' : 'Gravando...'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={pauseRecording}
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40 min-w-[120px]"
                >
                  {isPaused ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Retomar
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                      Pausar
                    </>
                  )}
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => stopRecording(true)}
                  className="min-w-[150px] shadow-glow"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                  Parar e Salvar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => stopRecording(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10 min-w-[100px]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-error bg-error/10 p-3 rounded-lg">{error}</p>
      )}
    </div>
  );
}
