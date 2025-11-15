2025-11-14T17:42:14.022Z TRACE process-transcription (12 seconds)
2025-11-14T17:42:15.436Z TRACE Attempt 1 (1 second)
Fri Nov 14 2025 17:42:16 GMT+0000 (Coordinated Universal Time) exception 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   userId?: StringFilter | String,
?   originalFilename?: StringFilter | String,
?   fileType?: StringFilter | String,
?   fileSize?: BigIntFilter | BigInt,
?   duration?: FloatNullableFilter | Float | Null,
?   storagePath?: StringFilter | String,
?   status?: StringFilter | String,
?   progress?: IntFilter | Int,
?   currentStage?: StringNullableFilter | String | Null,
?   errorMessage?: StringNullableFilter | String | Null,
?   language?: StringFilter | String,
?   modelSize?: StringFilter | String,
?   enableDiarization?: BoolFilter | Boolean,
?   enablePostProcessing?: BoolFilter | Boolean,
?   transcriptionText?: StringNullableFilter | String | Null,
?   wordCount?: IntNullableFilter | Int | Null,
?   averageConfidence?: FloatNullableFilter | Float | Null,
?   detectedLanguage?: StringNullableFilter | String | Null,
?   speakerCount?: IntNullableFilter | Int | Null,
?   processingTimeSeconds?: FloatNullableFilter | Float | Null,
?   gpuUsed?: BoolFilter | Boolean,
?   costCredits?: FloatFilter | Float,
?   createdAt?: DateTimeFilter | DateTime,
?   startedAt?: DateTimeNullableFilter | DateTime | Null,
?   completedAt?: DateTimeNullableFilter | DateTime | Null,
?   segments?: TranscriptionSegmentListRelationFilter,
?   chapters?: TranscriptionChapterListRelationFilter,
?   exports?: TranscriptionExportListRelationFilter
  },
  data: {
    status: "failed",
    errorMessage: "\nInvalid `prisma.transcription.update()` invocation:\n\n{\n  where: {\n    id: undefined,\n?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   OR?: TranscriptionWhereInput[],\n?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   userId?: StringFilter | String,\n?   originalFilename?: StringFilter | String,\n?   fileType?: StringFilter | String,\n?   fileSize?: BigIntFilter | BigInt,\n?   duration?: FloatNullableFilter | Float | Null,\n?   storagePath?: StringFilter | String,\n?   status?: StringFilter | String,\n?   progress?: IntFilter | Int,\n?   currentStage?: StringNullableFilter | String | Null,\n?   errorMessage?: StringNullableFilter | String | Null,\n?   language?: StringFilter | String,\n?   modelSize?: StringFilter | String,\n?   enableDiarization?: BoolFilter | Boolean,\n?   enablePostProcessing?: BoolFilter | Boolean,\n?   transcriptionText?: StringNullableFilter | String | Null,\n?   wordCount?: IntNullableFilter | Int | Null,\n?   averageConfidence?: FloatNullableFilter | Float | Null,\n?   detectedLanguage?: StringNullableFilter | String | Null,\n?   speakerCount?: IntNullableFilter | Int | Null,\n?   processingTimeSeconds?: FloatNullableFilter | Float | Null,\n?   gpuUsed?: BoolFilter | Boolean,\n?   costCredits?: FloatFilter | Float,\n?   createdAt?: DateTimeFilter | DateTime,\n?   startedAt?: DateTimeNullableFilter | DateTime | Null,\n?   completedAt?: DateTimeNullableFilter | DateTime | Null,\n?   segments?: TranscriptionSegmentListRelationFilter,\n?   chapters?: TranscriptionChapterListRelationFilter,\n?   exports?: TranscriptionExportListRelationFilter\n  },\n  data: {\n    status: \"processing\",\n    progress: 0,\n    currentStage: \"starting\",\n    startedAt: new Date(\"2025-11-14T17:42:15.447Z\")\n  }\n}\n\nArgument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.",
    completedAt: new Date("2025-11-14T17:42:16.419Z")
  }
}

Argument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.
2025-11-14T17:42:15.445Z TRACE run() (1 second)
Fri Nov 14 2025 17:42:16 GMT+0000 (Coordinated Universal Time) exception 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   userId?: StringFilter | String,
?   originalFilename?: StringFilter | String,
?   fileType?: StringFilter | String,
?   fileSize?: BigIntFilter | BigInt,
?   duration?: FloatNullableFilter | Float | Null,
?   storagePath?: StringFilter | String,
?   status?: StringFilter | String,
?   progress?: IntFilter | Int,
?   currentStage?: StringNullableFilter | String | Null,
?   errorMessage?: StringNullableFilter | String | Null,
?   language?: StringFilter | String,
?   modelSize?: StringFilter | String,
?   enableDiarization?: BoolFilter | Boolean,
?   enablePostProcessing?: BoolFilter | Boolean,
?   transcriptionText?: StringNullableFilter | String | Null,
?   wordCount?: IntNullableFilter | Int | Null,
?   averageConfidence?: FloatNullableFilter | Float | Null,
?   detectedLanguage?: StringNullableFilter | String | Null,
?   speakerCount?: IntNullableFilter | Int | Null,
?   processingTimeSeconds?: FloatNullableFilter | Float | Null,
?   gpuUsed?: BoolFilter | Boolean,
?   costCredits?: FloatFilter | Float,
?   createdAt?: DateTimeFilter | DateTime,
?   startedAt?: DateTimeNullableFilter | DateTime | Null,
?   completedAt?: DateTimeNullableFilter | DateTime | Null,
?   segments?: TranscriptionSegmentListRelationFilter,
?   chapters?: TranscriptionChapterListRelationFilter,
?   exports?: TranscriptionExportListRelationFilter
  },
  data: {
    status: "failed",
    errorMessage: "\nInvalid `prisma.transcription.update()` invocation:\n\n{\n  where: {\n    id: undefined,\n?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   OR?: TranscriptionWhereInput[],\n?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   userId?: StringFilter | String,\n?   originalFilename?: StringFilter | String,\n?   fileType?: StringFilter | String,\n?   fileSize?: BigIntFilter | BigInt,\n?   duration?: FloatNullableFilter | Float | Null,\n?   storagePath?: StringFilter | String,\n?   status?: StringFilter | String,\n?   progress?: IntFilter | Int,\n?   currentStage?: StringNullableFilter | String | Null,\n?   errorMessage?: StringNullableFilter | String | Null,\n?   language?: StringFilter | String,\n?   modelSize?: StringFilter | String,\n?   enableDiarization?: BoolFilter | Boolean,\n?   enablePostProcessing?: BoolFilter | Boolean,\n?   transcriptionText?: StringNullableFilter | String | Null,\n?   wordCount?: IntNullableFilter | Int | Null,\n?   averageConfidence?: FloatNullableFilter | Float | Null,\n?   detectedLanguage?: StringNullableFilter | String | Null,\n?   speakerCount?: IntNullableFilter | Int | Null,\n?   processingTimeSeconds?: FloatNullableFilter | Float | Null,\n?   gpuUsed?: BoolFilter | Boolean,\n?   costCredits?: FloatFilter | Float,\n?   createdAt?: DateTimeFilter | DateTime,\n?   startedAt?: DateTimeNullableFilter | DateTime | Null,\n?   completedAt?: DateTimeNullableFilter | DateTime | Null,\n?   segments?: TranscriptionSegmentListRelationFilter,\n?   chapters?: TranscriptionChapterListRelationFilter,\n?   exports?: TranscriptionExportListRelationFilter\n  },\n  data: {\n    status: \"processing\",\n    progress: 0,\n    currentStage: \"starting\",\n    startedAt: new Date(\"2025-11-14T17:42:15.447Z\")\n  }\n}\n\nArgument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.",
    completedAt: new Date("2025-11-14T17:42:16.419Z")
  }
}

Argument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.
2025-11-14T17:42:16.457Z INFO prisma:error 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInpu
2025-11-14T17:42:17.496Z TRACE Retry #1 delay (100 milliseconds)
2025-11-14T17:42:19.393Z TRACE Attempt 2 (851.2 milliseconds)
Fri Nov 14 2025 17:42:20 GMT+0000 (Coordinated Universal Time) exception 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   userId?: StringFilter | String,
?   originalFilename?: StringFilter | String,
?   fileType?: StringFilter | String,
?   fileSize?: BigIntFilter | BigInt,
?   duration?: FloatNullableFilter | Float | Null,
?   storagePath?: StringFilter | String,
?   status?: StringFilter | String,
?   progress?: IntFilter | Int,
?   currentStage?: StringNullableFilter | String | Null,
?   errorMessage?: StringNullableFilter | String | Null,
?   language?: StringFilter | String,
?   modelSize?: StringFilter | String,
?   enableDiarization?: BoolFilter | Boolean,
?   enablePostProcessing?: BoolFilter | Boolean,
?   transcriptionText?: StringNullableFilter | String | Null,
?   wordCount?: IntNullableFilter | Int | Null,
?   averageConfidence?: FloatNullableFilter | Float | Null,
?   detectedLanguage?: StringNullableFilter | String | Null,
?   speakerCount?: IntNullableFilter | Int | Null,
?   processingTimeSeconds?: FloatNullableFilter | Float | Null,
?   gpuUsed?: BoolFilter | Boolean,
?   costCredits?: FloatFilter | Float,
?   createdAt?: DateTimeFilter | DateTime,
?   startedAt?: DateTimeNullableFilter | DateTime | Null,
?   completedAt?: DateTimeNullableFilter | DateTime | Null,
?   segments?: TranscriptionSegmentListRelationFilter,
?   chapters?: TranscriptionChapterListRelationFilter,
?   exports?: TranscriptionExportListRelationFilter
  },
  data: {
    status: "failed",
    errorMessage: "\nInvalid `prisma.transcription.update()` invocation:\n\n{\n  where: {\n    id: undefined,\n?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   OR?: TranscriptionWhereInput[],\n?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   userId?: StringFilter | String,\n?   originalFilename?: StringFilter | String,\n?   fileType?: StringFilter | String,\n?   fileSize?: BigIntFilter | BigInt,\n?   duration?: FloatNullableFilter | Float | Null,\n?   storagePath?: StringFilter | String,\n?   status?: StringFilter | String,\n?   progress?: IntFilter | Int,\n?   currentStage?: StringNullableFilter | String | Null,\n?   errorMessage?: StringNullableFilter | String | Null,\n?   language?: StringFilter | String,\n?   modelSize?: StringFilter | String,\n?   enableDiarization?: BoolFilter | Boolean,\n?   enablePostProcessing?: BoolFilter | Boolean,\n?   transcriptionText?: StringNullableFilter | String | Null,\n?   wordCount?: IntNullableFilter | Int | Null,\n?   averageConfidence?: FloatNullableFilter | Float | Null,\n?   detectedLanguage?: StringNullableFilter | String | Null,\n?   speakerCount?: IntNullableFilter | Int | Null,\n?   processingTimeSeconds?: FloatNullableFilter | Float | Null,\n?   gpuUsed?: BoolFilter | Boolean,\n?   costCredits?: FloatFilter | Float,\n?   createdAt?: DateTimeFilter | DateTime,\n?   startedAt?: DateTimeNullableFilter | DateTime | Null,\n?   completedAt?: DateTimeNullableFilter | DateTime | Null,\n?   segments?: TranscriptionSegmentListRelationFilter,\n?   chapters?: TranscriptionChapterListRelationFilter,\n?   exports?: TranscriptionExportListRelationFilter\n  },\n  data: {\n    status: \"processing\",\n    progress: 0,\n    currentStage: \"starting\",\n    startedAt: new Date(\"2025-11-14T17:42:19.407Z\")\n  }\n}\n\nArgument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.",
    completedAt: new Date("2025-11-14T17:42:20.198Z")
  }
}

Argument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.
2025-11-14T17:42:19.404Z TRACE run() (838.3 milliseconds)
Fri Nov 14 2025 17:42:20 GMT+0000 (Coordinated Universal Time) exception 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   userId?: StringFilter | String,
?   originalFilename?: StringFilter | String,
?   fileType?: StringFilter | String,
?   fileSize?: BigIntFilter | BigInt,
?   duration?: FloatNullableFilter | Float | Null,
?   storagePath?: StringFilter | String,
?   status?: StringFilter | String,
?   progress?: IntFilter | Int,
?   currentStage?: StringNullableFilter | String | Null,
?   errorMessage?: StringNullableFilter | String | Null,
?   language?: StringFilter | String,
?   modelSize?: StringFilter | String,
?   enableDiarization?: BoolFilter | Boolean,
?   enablePostProcessing?: BoolFilter | Boolean,
?   transcriptionText?: StringNullableFilter | String | Null,
?   wordCount?: IntNullableFilter | Int | Null,
?   averageConfidence?: FloatNullableFilter | Float | Null,
?   detectedLanguage?: StringNullableFilter | String | Null,
?   speakerCount?: IntNullableFilter | Int | Null,
?   processingTimeSeconds?: FloatNullableFilter | Float | Null,
?   gpuUsed?: BoolFilter | Boolean,
?   costCredits?: FloatFilter | Float,
?   createdAt?: DateTimeFilter | DateTime,
?   startedAt?: DateTimeNullableFilter | DateTime | Null,
?   completedAt?: DateTimeNullableFilter | DateTime | Null,
?   segments?: TranscriptionSegmentListRelationFilter,
?   chapters?: TranscriptionChapterListRelationFilter,
?   exports?: TranscriptionExportListRelationFilter
  },
  data: {
    status: "failed",
    errorMessage: "\nInvalid `prisma.transcription.update()` invocation:\n\n{\n  where: {\n    id: undefined,\n?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   OR?: TranscriptionWhereInput[],\n?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   userId?: StringFilter | String,\n?   originalFilename?: StringFilter | String,\n?   fileType?: StringFilter | String,\n?   fileSize?: BigIntFilter | BigInt,\n?   duration?: FloatNullableFilter | Float | Null,\n?   storagePath?: StringFilter | String,\n?   status?: StringFilter | String,\n?   progress?: IntFilter | Int,\n?   currentStage?: StringNullableFilter | String | Null,\n?   errorMessage?: StringNullableFilter | String | Null,\n?   language?: StringFilter | String,\n?   modelSize?: StringFilter | String,\n?   enableDiarization?: BoolFilter | Boolean,\n?   enablePostProcessing?: BoolFilter | Boolean,\n?   transcriptionText?: StringNullableFilter | String | Null,\n?   wordCount?: IntNullableFilter | Int | Null,\n?   averageConfidence?: FloatNullableFilter | Float | Null,\n?   detectedLanguage?: StringNullableFilter | String | Null,\n?   speakerCount?: IntNullableFilter | Int | Null,\n?   processingTimeSeconds?: FloatNullableFilter | Float | Null,\n?   gpuUsed?: BoolFilter | Boolean,\n?   costCredits?: FloatFilter | Float,\n?   createdAt?: DateTimeFilter | DateTime,\n?   startedAt?: DateTimeNullableFilter | DateTime | Null,\n?   completedAt?: DateTimeNullableFilter | DateTime | Null,\n?   segments?: TranscriptionSegmentListRelationFilter,\n?   chapters?: TranscriptionChapterListRelationFilter,\n?   exports?: TranscriptionExportListRelationFilter\n  },\n  data: {\n    status: \"processing\",\n    progress: 0,\n    currentStage: \"starting\",\n    startedAt: new Date(\"2025-11-14T17:42:19.407Z\")\n  }\n}\n\nArgument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.",
    completedAt: new Date("2025-11-14T17:42:20.198Z")
  }
}

Argument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.
2025-11-14T17:42:19.404Z INFO [Trigger] Iniciando transcrição undefined
2025-11-14T17:42:20.196Z INFO prisma:error 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInpu
2025-11-14T17:42:20.197Z ERROR [Trigger] Erro na transcrição undefined: PrismaClientValidationError: 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
2025-11-14T17:42:20.240Z INFO prisma:error 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInpu
2025-11-14T17:42:20.851Z TRACE Retry #2 delay (2.4 seconds)
2025-11-14T17:42:24.652Z TRACE Attempt 3 (876.3 milliseconds)
Fri Nov 14 2025 17:42:25 GMT+0000 (Coordinated Universal Time) exception 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   userId?: StringFilter | String,
?   originalFilename?: StringFilter | String,
?   fileType?: StringFilter | String,
?   fileSize?: BigIntFilter | BigInt,
?   duration?: FloatNullableFilter | Float | Null,
?   storagePath?: StringFilter | String,
?   status?: StringFilter | String,
?   progress?: IntFilter | Int,
?   currentStage?: StringNullableFilter | String | Null,
?   errorMessage?: StringNullableFilter | String | Null,
?   language?: StringFilter | String,
?   modelSize?: StringFilter | String,
?   enableDiarization?: BoolFilter | Boolean,
?   enablePostProcessing?: BoolFilter | Boolean,
?   transcriptionText?: StringNullableFilter | String | Null,
?   wordCount?: IntNullableFilter | Int | Null,
?   averageConfidence?: FloatNullableFilter | Float | Null,
?   detectedLanguage?: StringNullableFilter | String | Null,
?   speakerCount?: IntNullableFilter | Int | Null,
?   processingTimeSeconds?: FloatNullableFilter | Float | Null,
?   gpuUsed?: BoolFilter | Boolean,
?   costCredits?: FloatFilter | Float,
?   createdAt?: DateTimeFilter | DateTime,
?   startedAt?: DateTimeNullableFilter | DateTime | Null,
?   completedAt?: DateTimeNullableFilter | DateTime | Null,
?   segments?: TranscriptionSegmentListRelationFilter,
?   chapters?: TranscriptionChapterListRelationFilter,
?   exports?: TranscriptionExportListRelationFilter
  },
  data: {
    status: "failed",
    errorMessage: "\nInvalid `prisma.transcription.update()` invocation:\n\n{\n  where: {\n    id: undefined,\n?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   OR?: TranscriptionWhereInput[],\n?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   userId?: StringFilter | String,\n?   originalFilename?: StringFilter | String,\n?   fileType?: StringFilter | String,\n?   fileSize?: BigIntFilter | BigInt,\n?   duration?: FloatNullableFilter | Float | Null,\n?   storagePath?: StringFilter | String,\n?   status?: StringFilter | String,\n?   progress?: IntFilter | Int,\n?   currentStage?: StringNullableFilter | String | Null,\n?   errorMessage?: StringNullableFilter | String | Null,\n?   language?: StringFilter | String,\n?   modelSize?: StringFilter | String,\n?   enableDiarization?: BoolFilter | Boolean,\n?   enablePostProcessing?: BoolFilter | Boolean,\n?   transcriptionText?: StringNullableFilter | String | Null,\n?   wordCount?: IntNullableFilter | Int | Null,\n?   averageConfidence?: FloatNullableFilter | Float | Null,\n?   detectedLanguage?: StringNullableFilter | String | Null,\n?   speakerCount?: IntNullableFilter | Int | Null,\n?   processingTimeSeconds?: FloatNullableFilter | Float | Null,\n?   gpuUsed?: BoolFilter | Boolean,\n?   costCredits?: FloatFilter | Float,\n?   createdAt?: DateTimeFilter | DateTime,\n?   startedAt?: DateTimeNullableFilter | DateTime | Null,\n?   completedAt?: DateTimeNullableFilter | DateTime | Null,\n?   segments?: TranscriptionSegmentListRelationFilter,\n?   chapters?: TranscriptionChapterListRelationFilter,\n?   exports?: TranscriptionExportListRelationFilter\n  },\n  data: {\n    status: \"processing\",\n    progress: 0,\n    currentStage: \"starting\",\n    startedAt: new Date(\"2025-11-14T17:42:24.664Z\")\n  }\n}\n\nArgument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.",
    completedAt: new Date("2025-11-14T17:42:25.474Z")
  }
}

Argument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.
2025-11-14T17:42:24.661Z TRACE run() (865.1 milliseconds)
Fri Nov 14 2025 17:42:25 GMT+0000 (Coordinated Universal Time) exception 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   userId?: StringFilter | String,
?   originalFilename?: StringFilter | String,
?   fileType?: StringFilter | String,
?   fileSize?: BigIntFilter | BigInt,
?   duration?: FloatNullableFilter | Float | Null,
?   storagePath?: StringFilter | String,
?   status?: StringFilter | String,
?   progress?: IntFilter | Int,
?   currentStage?: StringNullableFilter | String | Null,
?   errorMessage?: StringNullableFilter | String | Null,
?   language?: StringFilter | String,
?   modelSize?: StringFilter | String,
?   enableDiarization?: BoolFilter | Boolean,
?   enablePostProcessing?: BoolFilter | Boolean,
?   transcriptionText?: StringNullableFilter | String | Null,
?   wordCount?: IntNullableFilter | Int | Null,
?   averageConfidence?: FloatNullableFilter | Float | Null,
?   detectedLanguage?: StringNullableFilter | String | Null,
?   speakerCount?: IntNullableFilter | Int | Null,
?   processingTimeSeconds?: FloatNullableFilter | Float | Null,
?   gpuUsed?: BoolFilter | Boolean,
?   costCredits?: FloatFilter | Float,
?   createdAt?: DateTimeFilter | DateTime,
?   startedAt?: DateTimeNullableFilter | DateTime | Null,
?   completedAt?: DateTimeNullableFilter | DateTime | Null,
?   segments?: TranscriptionSegmentListRelationFilter,
?   chapters?: TranscriptionChapterListRelationFilter,
?   exports?: TranscriptionExportListRelationFilter
  },
  data: {
    status: "failed",
    errorMessage: "\nInvalid `prisma.transcription.update()` invocation:\n\n{\n  where: {\n    id: undefined,\n?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   OR?: TranscriptionWhereInput[],\n?   NOT?: TranscriptionWhereInput | TranscriptionWhereInput[],\n?   userId?: StringFilter | String,\n?   originalFilename?: StringFilter | String,\n?   fileType?: StringFilter | String,\n?   fileSize?: BigIntFilter | BigInt,\n?   duration?: FloatNullableFilter | Float | Null,\n?   storagePath?: StringFilter | String,\n?   status?: StringFilter | String,\n?   progress?: IntFilter | Int,\n?   currentStage?: StringNullableFilter | String | Null,\n?   errorMessage?: StringNullableFilter | String | Null,\n?   language?: StringFilter | String,\n?   modelSize?: StringFilter | String,\n?   enableDiarization?: BoolFilter | Boolean,\n?   enablePostProcessing?: BoolFilter | Boolean,\n?   transcriptionText?: StringNullableFilter | String | Null,\n?   wordCount?: IntNullableFilter | Int | Null,\n?   averageConfidence?: FloatNullableFilter | Float | Null,\n?   detectedLanguage?: StringNullableFilter | String | Null,\n?   speakerCount?: IntNullableFilter | Int | Null,\n?   processingTimeSeconds?: FloatNullableFilter | Float | Null,\n?   gpuUsed?: BoolFilter | Boolean,\n?   costCredits?: FloatFilter | Float,\n?   createdAt?: DateTimeFilter | DateTime,\n?   startedAt?: DateTimeNullableFilter | DateTime | Null,\n?   completedAt?: DateTimeNullableFilter | DateTime | Null,\n?   segments?: TranscriptionSegmentListRelationFilter,\n?   chapters?: TranscriptionChapterListRelationFilter,\n?   exports?: TranscriptionExportListRelationFilter\n  },\n  data: {\n    status: \"processing\",\n    progress: 0,\n    currentStage: \"starting\",\n    startedAt: new Date(\"2025-11-14T17:42:24.664Z\")\n  }\n}\n\nArgument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.",
    completedAt: new Date("2025-11-14T17:42:25.474Z")
  }
}

Argument `where` of type TranscriptionWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.
2025-11-14T17:42:24.661Z INFO [Trigger] Iniciando transcrição undefined
2025-11-14T17:42:25.473Z INFO prisma:error 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInpu
2025-11-14T17:42:25.473Z ERROR [Trigger] Erro na transcrição undefined: PrismaClientValidationError: 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
2025-11-14T17:42:25.524Z INFO prisma:error 
Invalid `prisma.transcription.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: TranscriptionWhereInput | TranscriptionWhereInput[],
?   OR?: TranscriptionWhereInput[],
?   NOT?: TranscriptionWhereInput | TranscriptionWhereInpu