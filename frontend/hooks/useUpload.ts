'use client';

import { useState, useCallback } from 'react';
import { uploadFile } from '@/lib/api';
import type { TranscriptionCreateResponse } from '@/lib/types';

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<TranscriptionCreateResponse | null>(null);

  const upload = useCallback(
    async (
      file: File,
      options: {
        language?: string;
        enable_diarization?: boolean;
        enable_post_processing?: boolean;
      } = {}
    ) => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      setResponse(null);

      try {
        const result = await uploadFile(file, {
          ...options,
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        });

        setResponse(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao fazer upload';
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setResponse(null);
  }, []);

  return {
    upload,
    isUploading,
    uploadProgress,
    error,
    response,
    reset,
  };
}
