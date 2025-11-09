'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/utils';
import { Progress } from './Progress';

interface MusicUploaderProps {
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  uploadProgress?: number;
  isUploading?: boolean;
}

export function MusicUploader({
  onFileSelect,
  maxSizeMB = 100,
  acceptedFormats = ['mp3', 'wav', 'm4a', 'mp4', 'avi', 'mov', 'mkv', 'webm', 'ogg', 'flac'],
  uploadProgress,
  isUploading,
}: MusicUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return false;
    }

    // Check file format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !acceptedFormats.includes(extension)) {
      setError(`Formato não suportado. Formatos aceitos: ${acceptedFormats.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer',
          isDragging
            ? 'border-brand-primary bg-brand-primary/5 shadow-glow'
            : 'border-neutral-300 dark:border-neutral-700 hover:border-brand-primary hover:shadow-glow',
          isUploading && 'pointer-events-none opacity-60',
          error && 'border-error'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.map((f) => `.${f}`).join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center text-center">
          {isUploading ? (
            <>
              <div className="w-16 h-16 mb-4 text-brand-primary">
                <svg
                  className="animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-white mb-2">
                Fazendo upload...
              </p>
              {uploadProgress !== undefined && (
                <div className="w-full max-w-xs">
                  <Progress value={uploadProgress} showPercentage gradient />
                </div>
              )}
            </>
          ) : selectedFile ? (
            <>
              <div className="w-16 h-16 mb-4 text-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-white mb-1">
                {selectedFile.name}
              </p>
              <p className="text-sm text-white/80">
                {formatBytes(selectedFile.size)}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mb-4 text-brand-primary">
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
                    d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-white mb-2">
                Arraste um arquivo ou clique para fazer upload
              </p>
              <p className="text-sm text-white/80 mb-1">
                Formatos aceitos: {acceptedFormats.join(', ').toUpperCase()}
              </p>
              <p className="text-sm text-white/80">
                Tamanho máximo: {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
