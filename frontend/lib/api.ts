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

  console.log('[Upload] Tamanho do arquivo:', file.size, 'bytes');
  console.log('[Upload] Usando método: multipart (universal)');

  // SEMPRE usa multipart upload direto para R2
  // Evita limite de 4MB do Vercel e garante consistência
  return uploadFileMultipart(file, options, CHUNK_SIZE);
}

/**
 * Upload multipart universal (todos os tamanhos)
 * Evita limite de 4MB do Vercel fazendo upload direto para R2
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
  console.log('[Multipart Client] Iniciando upload:', { filename: file.name, size: file.size });

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

  console.log('[Multipart Client] Upload iniciado:', startResponse);

  const { uploadId, key } = startResponse;
  const totalChunks = Math.ceil(file.size / chunkSize);
  const uploadedParts: Array<{ PartNumber: number; ETag: string }> = [];

  // Passo 2: Upload de cada chunk
  console.log(`[Multipart Client] Fazendo upload de ${totalChunks} chunks`);

  for (let i = 0; i < totalChunks; i++) {
    const partNumber = i + 1;
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    console.log(`[Multipart Client] Chunk ${partNumber}/${totalChunks}: obtendo URL...`);

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

    console.log(`[Multipart Client] Chunk ${partNumber}/${totalChunks}: fazendo upload para R2...`);

    // Upload do chunk direto para R2
    let etag: string;
    try {
      const uploadResponse = await fetch(chunkResponse.uploadUrl, {
        method: 'PUT',
        body: chunk,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      console.log(`[Multipart Client] Chunk ${partNumber}/${totalChunks}: response status=${uploadResponse.status}`);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => 'No error body');
        console.error(`[Multipart Client] Erro no chunk ${partNumber}:`, {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          body: errorText,
        });
        throw new Error(`Failed to upload chunk ${partNumber}: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      // Pegar ETag do response
      const responseEtag = uploadResponse.headers.get('ETag');
      if (!responseEtag) {
        console.error(`[Multipart Client] Sem ETag no chunk ${partNumber}`);
        throw new Error(`No ETag returned for chunk ${partNumber}`);
      }

      etag = responseEtag;
      console.log(`[Multipart Client] Chunk ${partNumber}/${totalChunks}: sucesso, ETag=${etag}`);
    } catch (error) {
      console.error(`[Multipart Client] Exceção no chunk ${partNumber}:`, error);
      throw error;
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

  console.log('[Multipart Client] Todos os chunks foram enviados');

  // Passo 3: Completar multipart upload
  if (options.onProgress) {
    options.onProgress(95);
  }

  console.log('[Multipart Client] Finalizando upload no R2...');

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

  console.log('[Multipart Client] Upload completo!', completeResponse);

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
