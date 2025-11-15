/**
 * Cliente HTTP para comunicação com Next.js API Routes
 * Base URL: http://localhost:3000 (desenvolvimento)
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
 * Upload de arquivo para transcrição
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

  // Upload com progresso (se suportado)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress tracking
    if (options.onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          options.onProgress?.(progress);
        }
      });
    }

    // Completion
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

    xhr.addEventListener("error", () => {
      reject(new Error("Network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("POST", `${API_BASE_URL}/api/transcriptions/upload`);
    xhr.send(formData);
  });
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
