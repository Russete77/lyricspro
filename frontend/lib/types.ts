/**
 * Types para comunicação com Backend FastAPI
 * Baseado em: backend/app/models/schemas.py
 */

// ============================================================================
// Upload & Create
// ============================================================================

export interface TranscriptionCreateRequest {
  language?: string; // pt, en, auto
  model_size?: string; // tiny, base, small, medium, large-v3
  enable_diarization?: boolean;
  enable_post_processing?: boolean;
  webhook_url?: string;
}

export interface TranscriptionCreateResponse {
  job_id: string;
  status: string;
  estimated_time_minutes: number;
  message: string;
}

// ============================================================================
// Status & Progress
// ============================================================================

export type TranscriptionStatus = "pending" | "processing" | "completed" | "failed";

export interface ExportFormat {
  format: string; // txt, srt, vtt, json
  download_url: string;
  file_size: number;
}

export interface TranscriptionStatusResponse {
  job_id: string;
  status: TranscriptionStatus;
  progress: number; // 0-100
  current_stage: string | null;
  error_message: string | null;

  // Quando completado:
  transcription_text: string | null;
  word_count: number | null;
  duration: number | null; // segundos
  speaker_count: number | null;

  // Downloads disponíveis
  exports: ExportFormat[];

  created_at: string; // ISO date
  completed_at: string | null; // ISO date
}

// ============================================================================
// Segments & Words
// ============================================================================

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
  speaker: string | null;
  words: WordTimestamp[];
}

export interface TranscriptionSegmentsResponse {
  segments: TranscriptionSegment[];
  total_segments: number;
}

// ============================================================================
// Chapters (Estrutura Musical para LyricsPro)
// ============================================================================

export interface TranscriptionChapter {
  title: string; // VERSO 1, REFRÃO, PONTE, etc.
  start: number;
  end: number;
  summary: string | null;
}

export interface TranscriptionChaptersResponse {
  chapters: TranscriptionChapter[];
}

// ============================================================================
// Download Response
// ============================================================================

export interface DownloadTextResponse {
  text: string;
}

export interface DownloadJSONResponse {
  job_id: string;
  text: string;
  word_count: number;
  duration: number;
  language: string;
  speaker_count: number;
  segments: TranscriptionSegment[];
}

export interface DownloadSRTResponse {
  srt: string;
}

export interface DownloadVTTResponse {
  vtt: string;
}

// ============================================================================
// UI Helpers
// ============================================================================

export interface Song {
  id: string;
  title: string;
  status: TranscriptionStatus;
  progress: number;
  duration: number | null;
  created_at: string;
  completed_at: string | null;
  preview: string | null;
  chapters: TranscriptionChapter[];
}
