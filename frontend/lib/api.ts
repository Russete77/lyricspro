/**
 * Cliente HTTP para comunicação com Backend FastAPI
 * Base URL: http://localhost:8000 (desenvolvimento)
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

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

    xhr.open("POST", `${API_BASE_URL}/api/v1/transcriptions/upload`);
    xhr.send(formData);
  });
}

/**
 * Obtém status da transcrição
 */
export async function getTranscriptionStatus(
  jobId: string
): Promise<TranscriptionStatusResponse> {
  return fetchAPI(`/api/v1/transcriptions/${jobId}`);
}

/**
 * Obtém segmentos detalhados da transcrição
 */
export async function getTranscriptionSegments(
  jobId: string
): Promise<TranscriptionSegmentsResponse> {
  return fetchAPI(`/api/v1/transcriptions/${jobId}/segments`);
}

/**
 * Obtém capítulos detectados (estrutura musical)
 */
export async function getTranscriptionChapters(
  jobId: string
): Promise<TranscriptionChaptersResponse> {
  return fetchAPI(`/api/v1/transcriptions/${jobId}/chapters`);
}

/**
 * Download da transcrição em formato TXT
 */
export async function downloadTranscriptionTXT(
  jobId: string
): Promise<DownloadTextResponse> {
  return fetchAPI(`/api/v1/transcriptions/${jobId}/download?format=txt`);
}

/**
 * Download da transcrição em formato JSON completo
 */
export async function downloadTranscriptionJSON(
  jobId: string
): Promise<DownloadJSONResponse> {
  return fetchAPI(`/api/v1/transcriptions/${jobId}/download?format=json`);
}

/**
 * Download da transcrição em formato SRT (legendas)
 */
export async function downloadTranscriptionSRT(
  jobId: string
): Promise<DownloadSRTResponse> {
  return fetchAPI(`/api/v1/transcriptions/${jobId}/download?format=srt`);
}

/**
 * Download da transcrição em formato VTT (WebVTT)
 */
export async function downloadTranscriptionVTT(
  jobId: string
): Promise<DownloadVTTResponse> {
  return fetchAPI(`/api/v1/transcriptions/${jobId}/download?format=vtt`);
}

/**
 * Health check da API
 */
export async function checkHealth(): Promise<{ status: string }> {
  return fetchAPI("/api/health");
}

/**
 * Informações da API
 */
export async function getAPIInfo(): Promise<{
  version: string;
  whisper_model: string;
  whisper_device: string;
  diarization_enabled: boolean;
  post_processing_enabled: boolean;
  max_file_size_mb: number;
  max_duration_minutes: number;
  allowed_formats: string[];
}> {
  return fetchAPI("/api/info");
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
    title: string;
    status: string;
    progress: number;
    duration: number | null;
    created_at: string | null;
    completed_at: string | null;
    preview: string | null;
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
  return fetchAPI(`/api/v1/transcriptions${query ? `?${query}` : ''}`);
}

/**
 * Deleta uma transcrição
 */
export async function deleteTranscription(jobId: string): Promise<{message: string}> {
  return fetchAPI(`/api/v1/transcriptions/${jobId}`, {
    method: 'DELETE'
  });
}
