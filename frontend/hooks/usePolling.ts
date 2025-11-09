'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTranscriptionStatus } from '@/lib/api';
import type { TranscriptionStatusResponse } from '@/lib/types';

interface UsePollingOptions {
  jobId: string | null;
  interval?: number; // ms
  enabled?: boolean;
  onComplete?: (data: TranscriptionStatusResponse) => void;
  onError?: (error: string) => void;
}

export function usePolling({
  jobId,
  interval = 3000, // 3 segundos
  enabled = true,
  onComplete,
  onError,
}: UsePollingOptions) {
  const [data, setData] = useState<TranscriptionStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Use refs para callbacks para evitar loop infinito
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Atualizar refs quando callbacks mudarem
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  const fetchStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      setIsLoading(true);
      setError(null);

      const status = await getTranscriptionStatus(jobId);

      if (!mountedRef.current) return;

      setData(status);

      // Se completou ou falhou, para o polling
      if (status.status === 'completed' || status.status === 'failed') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        if (status.status === 'completed') {
          onCompleteRef.current?.(status);
        } else if (status.status === 'failed') {
          onErrorRef.current?.(status.error_message || 'Erro desconhecido');
        }
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao buscar status';
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);

      // Para o polling em caso de erro
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [jobId]);

  // Iniciar/parar polling
  useEffect(() => {
    if (!jobId || !enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Buscar imediatamente
    fetchStatus();

    // Iniciar polling
    intervalRef.current = setInterval(fetchStatus, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, enabled, interval, fetchStatus]);

  // Cleanup no unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
