-- CreateTable
CREATE TABLE "transcriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "duration" REAL,
    "storage_path" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "current_stage" TEXT,
    "error_message" TEXT,
    "language" TEXT NOT NULL DEFAULT 'pt',
    "model_size" TEXT NOT NULL DEFAULT 'gpt-4o-transcribe-diarize',
    "enable_diarization" BOOLEAN NOT NULL DEFAULT false,
    "enable_post_processing" BOOLEAN NOT NULL DEFAULT true,
    "transcription_text" TEXT,
    "word_count" INTEGER,
    "average_confidence" REAL,
    "detected_language" TEXT,
    "speaker_count" INTEGER,
    "processing_time_seconds" REAL,
    "gpu_used" BOOLEAN NOT NULL DEFAULT false,
    "cost_credits" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" DATETIME,
    "completed_at" DATETIME
);

-- CreateTable
CREATE TABLE "transcription_segments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcription_id" TEXT NOT NULL,
    "segment_index" INTEGER NOT NULL,
    "start_time" REAL NOT NULL,
    "end_time" REAL NOT NULL,
    "text" TEXT NOT NULL,
    "confidence" REAL,
    "speaker_label" TEXT,
    "words" JSONB,
    CONSTRAINT "transcription_segments_transcription_id_fkey" FOREIGN KEY ("transcription_id") REFERENCES "transcriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transcription_chapters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcription_id" TEXT NOT NULL,
    "chapter_index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "start_time" REAL NOT NULL,
    "end_time" REAL NOT NULL,
    "summary" TEXT,
    CONSTRAINT "transcription_chapters_transcription_id_fkey" FOREIGN KEY ("transcription_id") REFERENCES "transcriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transcription_exports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcription_id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transcription_exports_transcription_id_fkey" FOREIGN KEY ("transcription_id") REFERENCES "transcriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "transcriptions_user_id_idx" ON "transcriptions"("user_id");

-- CreateIndex
CREATE INDEX "transcriptions_status_idx" ON "transcriptions"("status");

-- CreateIndex
CREATE INDEX "transcriptions_created_at_idx" ON "transcriptions"("created_at");

-- CreateIndex
CREATE INDEX "transcription_segments_transcription_id_idx" ON "transcription_segments"("transcription_id");

-- CreateIndex
CREATE INDEX "transcription_chapters_transcription_id_idx" ON "transcription_chapters"("transcription_id");

-- CreateIndex
CREATE INDEX "transcription_exports_transcription_id_idx" ON "transcription_exports"("transcription_id");
