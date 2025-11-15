/**
 * Cliente HTTP para comunicação com Next.js API Routes
 * Usa URLs relativas para funcionar tanto em dev quanto em produção
 */

import type {
  TranscriptionCreateResponse,
  TranscriptionStatusResponse,
  TranscriptionSegmentsResponse,
  TranscriptionChaptersResponse,
  DownloadTextResponse,
  DownloadJSONResponse,
  DownloadSRTResponse,
  DownloadVTTResponse,
} from "./types";

// Em Next.js, API routes estão no mesmo domínio, então usamos URLs relativas
// Isso funciona tanto em dev (localhost:3000) quanto em produção (vercel.app)
const API_BASE_URL = "";

/**
 * Helper para fazer requests HTTP
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: response.statusText,
    }));
    throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// API Methods
// ============================================================================

/**
 * Upload de arquivo para transcrição usando MULTIPART
 * Suporta arquivos de qualquer tamanho (sem limite de 4.5MB da Vercel)
 */
export async function uploadFile(
  file: File,
  options: {
    language?: string;
    model_size?: string;
    enable_diarization?: boolean;
    enable_post_processing?: boolean;
    webhook_url?: string;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<TranscriptionCreateResponse> {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB por chunk
  const FALLBACK_THRESHOLD = 4 * 1024 * 1024; // 4MB - usa upload tradicional se menor

  // Se arquivo for pequeno (<4MB), usa upload tradicional (mais rápido)
  if (file.size < FALLBACK_THRESHOLD) {
    return uploadFileTraditional(file, options);
  }

  // Arquivo grande: usa multipart upload
  return uploadFileMultipart(file, options, CHUNK_SIZE);
}

/**
 * Upload tradicional (para arquivos pequenos <4MB)
 */
async function uploadFileTraditional(
  file: File,
  options: {
    language?: string;
    model_size?: string;
    enable_diarization?: boolean;
    enable_post_processing?: boolean;
    webhook_url?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<TranscriptionCreateResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", options.language || "pt");

  if (options.model_size) {
    formData.append("model_size", options.model_size);
  }

  formData.append("enable_diarization", String(options.enable_diarization || false));
  formData.append("enable_post_processing", String(options.enable_post_processing !== false));

  if (options.webhook_url) {
    formData.append("webhook_url", options.webhook_url);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (options.onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          options.onProgress?.(progress);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error("Invalid JSON response"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.detail || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", `${API_BASE_URL}/api/transcriptions/upload`);
    xhr.send(formData);
  });
}

/**
 * Upload multipart (para arquivos grandes >4MB)
 */
async function uploadFileMultipart(
  file: File,
  options: {
    language?: string;
    model_size?: string;
    enable_diarization?: boolean;
    enable_post_processing?: boolean;
    onProgress?: (progress: number) => void;
  },
  chunkSize: number
): Promise<TranscriptionCreateResponse> {
  // Passo 1: Iniciar multipart upload
  const startResponse = await fetchAPI<{
    uploadId: string;
    key: string;
    chunkSize: number;
  }>('/api/multipart/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  const { uploadId, key } = startResponse;
  const totalChunks = Math.ceil(file.size / chunkSize);
  const uploadedParts: Array<{ PartNumber: number; ETag: string }> = [];

  // Passo 2: Upload de cada chunk
  for (let i = 0; i < totalChunks; i++) {
    const partNumber = i + 1;
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    // Obter presigned URL para este chunk
    const chunkResponse = await fetchAPI<{
      uploadUrl: string;
      partNumber: number;
    }>('/api/multipart/chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        uploadId,
        partNumber,
      }),
    });

    // Upload do chunk direto para R2
    const uploadResponse = await fetch(chunkResponse.uploadUrl, {
      method: 'PUT',
      body: chunk,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload chunk ${partNumber}`);
    }

    // Pegar ETag do response
    const etag = uploadResponse.headers.get('ETag');
    if (!etag) {
      throw new Error(`No ETag returned for chunk ${partNumber}`);
    }

    uploadedParts.push({
      PartNumber: partNumber,
      ETag: etag,
    });

    // Atualizar progresso (0-90% para upload dos chunks)
    if (options.onProgress) {
      const progress = ((i + 1) / totalChunks) * 90;
      options.onProgress(progress);
    }
  }

  // Passo 3: Completar multipart upload
  if (options.onProgress) {
    options.onProgress(95);
  }

  const completeResponse = await fetchAPI<TranscriptionCreateResponse>(
    '/api/multipart/complete',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        uploadId,
        parts: uploadedParts,
        originalFilename: file.name,
        fileType: file.type,
        fileSize: file.size,
        language: options.language || 'pt',
        enableDiarization: options.enable_diarization || false,
        enablePostProcessing: options.enable_post_processing !== false,
      }),
    }
  );

  if (options.onProgress) {
    options.onProgress(100);
  }

  return completeResponse;
}

/**
 * Obtém status da transcrição
 */
export async function getTranscriptionStatus(
  jobId: string
): Promise<TranscriptionStatusResponse> {
  return fetchAPI(`/api/transcriptions/${jobId}`);
}

/**
 * Obtém segmentos detalhados da transcrição
 */
export async function getTranscriptionSegments(
  jobId: string
): Promise<TranscriptionSegmentsResponse> {
  // Segmentos agora vêm junto com o status
  const status = await getTranscriptionStatus(jobId);
  return {
    segments: status.segments || [],
    total_segments: status.segments?.length || 0,
  };
}

/**
 * Obtém capítulos detectados (estrutura musical)
 */
export async function getTranscriptionChapters(
  jobId: string
): Promise<TranscriptionChaptersResponse> {
  // Capítulos agora vêm junto com o status
  const status = await getTranscriptionStatus(jobId);
  return {
    chapters: status.chapters || [],
  };
}

/**
 * Download da transcrição em formato TXT
 */
export async function downloadTranscriptionTXT(
  jobId: string
): Promise<DownloadTextResponse> {
  const response = await fetch(`${API_BASE_URL}/api/transcriptions/${jobId}/download?format=txt`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  return { text };
}

/**
 * Download da transcrição em formato JSON completo
 */
export async function downloadTranscriptionJSON(
  jobId: string
): Promise<DownloadJSONResponse> {
  return fetchAPI(`/api/transcriptions/${jobId}/download?format=json`);
}

/**
 * Download da transcrição em formato SRT (legendas)
 */
export async function downloadTranscriptionSRT(
  jobId: string
): Promise<DownloadSRTResponse> {
  const response = await fetch(`${API_BASE_URL}/api/transcriptions/${jobId}/download?format=srt`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const srt = await response.text();
  return { srt };
}

/**
 * Download da transcrição em formato VTT (WebVTT)
 */
export async function downloadTranscriptionVTT(
  jobId: string
): Promise<DownloadVTTResponse> {
  const response = await fetch(`${API_BASE_URL}/api/transcriptions/${jobId}/download?format=vtt`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const vtt = await response.text();
  return { vtt };
}

/**
 * Lista todas as transcrições
 */
export async function listTranscriptions(options: {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
} = {}): Promise<{
  items: Array<{
    id: string;
    original_filename: string;
    status: string;
    progress: number;
    file_type: string;
    file_size: number;
    created_at: string;
    completed_at: string | null;
  }>;
  total: number;
  limit: number;
  offset: number;
}> {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());
  if (options.status) params.append('status', options.status);

  const query = params.toString();
  return fetchAPI(`/api/transcriptions${query ? `?${query}` : ''}`);
}

/**
 * Deleta uma transcrição
 */
export async function deleteTranscription(jobId: string): Promise<{success: boolean}> {
  return fetchAPI(`/api/transcriptions/${jobId}`, {
    method: 'DELETE'
  });
}
