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
 * Upload de arquivo para transcrição (UPLOAD DIRETO PARA R2)
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
  // Passo 1: Obter URL assinada para upload direto ao R2
  const presignedResponse = await fetchAPI<{
    uploadUrl: string;
    r2Key: string;
    expiresIn: number;
  }>('/api/transcriptions/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  const { uploadUrl, r2Key } = presignedResponse;

  // Passo 2: Upload direto para R2 com progresso
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress tracking
    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          // Progresso do upload (0-90%)
          const progress = (e.loaded / e.total) * 90;
          options.onProgress?.(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    // Upload direto para R2 usando presigned URL
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

  // Passo 3: Confirmar upload e iniciar processamento
  if (options.onProgress) {
    options.onProgress(95);
  }

  const confirmResponse = await fetchAPI<TranscriptionCreateResponse>(
    '/api/transcriptions/confirm-upload',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        r2Key,
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

  return confirmResponse;
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
