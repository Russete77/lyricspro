/**
 * OpenAI Client - Server-side only
 * Transcrição via OpenAI Whisper API
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
// @ts-ignore
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// @ts-ignore
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

const execAsync = promisify(exec);

// Caminhos para FFmpeg e FFprobe (funciona em Vercel!)
const FFMPEG_PATH = ffmpegInstaller.path;
const FFPROBE_PATH = ffprobeInstaller.path;

// Singleton
let openaiClient: OpenAI | null = null;
let apiKeyValidated: boolean = false;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 120000, // 2 minutos
      maxRetries: 3,
    });
  }

  return openaiClient;
}

/**
 * Valida se a API key da OpenAI está funcionando
 */
export async function validateOpenAIKey(): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = getOpenAIClient();

    // Fazer uma request simples para validar a key
    await client.models.list();

    apiKeyValidated = true;
    return { valid: true };
  } catch (error: any) {
    console.error('[OpenAI] Validação de API key falhou:', error);

    if (error.status === 401) {
      return { valid: false, error: 'API key inválida ou expirada' };
    } else if (error.status === 429) {
      return { valid: false, error: 'Limite de quota atingido' };
    } else {
      return { valid: false, error: error.message || 'Erro ao validar API key' };
    }
  }
}

/**
 * Verifica se a API key já foi validada
 */
export function isAPIKeyValidated(): boolean {
  return apiKeyValidated;
}

export interface TranscriptionOptions {
  language?: string;
  enableDiarization?: boolean;
  model?: 'whisper-1' | 'gpt-4o-transcribe' | 'gpt-4o-transcribe-diarize';
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language?: string;
  speakerCount?: number;
}

/**
 * Obtém a duração do áudio em segundos usando ffprobe
 */
async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `"${FFPROBE_PATH}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error('[FFprobe] Erro ao obter duração:', error);
    return 0;
  }
}

/**
 * Converte WAV para MP3 se necessário (OpenAI prefere MP3)
 */
async function convertToMP3IfNeeded(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  // Se já for MP3, retorna o mesmo arquivo
  if (ext === '.mp3') {
    return filePath;
  }

  // Se for WAV, converter para MP3
  if (ext === '.wav') {
    const mp3Path = filePath.replace(/\.wav$/i, '_converted.mp3');

    try {
      console.log(`[FFmpeg] Convertendo WAV para MP3: ${filePath}`);
      await execAsync(
        `"${FFMPEG_PATH}" -i "${filePath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}" -y`
      );
      console.log(`[FFmpeg] Conversão concluída: ${mp3Path}`);
      return mp3Path;
    } catch (error) {
      console.error('[FFmpeg] Erro na conversão, usando arquivo original:', error);
      return filePath; // Fallback para o arquivo original
    }
  }

  // Para outros formatos, retorna o original
  return filePath;
}

/**
 * Divide áudio em chunks usando ffmpeg
 */
async function splitAudioIntoChunks(
  filePath: string,
  chunkDuration: number = 1200 // 20 minutos
): Promise<string[]> {
  const duration = await getAudioDuration(filePath);

  if (duration <= chunkDuration) {
    return [filePath]; // Não precisa dividir
  }

  const chunks: string[] = [];
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);

  let currentTime = 0;
  let chunkIndex = 0;

  while (currentTime < duration) {
    const chunkPath = path.join(dir, `${basename}_chunk${chunkIndex}${ext}`);

    try {
      await execAsync(
        `"${FFMPEG_PATH}" -i "${filePath}" -ss ${currentTime} -t ${chunkDuration} -c copy "${chunkPath}" -y`
      );
      chunks.push(chunkPath);
      console.log(`[FFmpeg] Chunk ${chunkIndex} criado: ${chunkPath}`);
    } catch (error) {
      console.error(`[FFmpeg] Erro ao criar chunk ${chunkIndex}:`, error);
      break;
    }

    currentTime += chunkDuration;
    chunkIndex++;
  }

  return chunks;
}

/**
 * Transcreve áudio usando OpenAI API
 */
export async function transcribeAudio(
  filePath: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const client = getOpenAIClient();

  const {
    language = 'pt',
    enableDiarization = false,
    // Usar whisper-1 por padrão pois suporta verbose_json com segmentos
    model = enableDiarization ? 'gpt-4o-transcribe-diarize' : 'whisper-1',
  } = options;

  // Converter WAV para MP3 se necessário
  const convertedPath = await convertToMP3IfNeeded(filePath);

  // Verificar se precisa dividir em chunks
  // OpenAI limite: 25MB por arquivo (~10 min em MP3 320kbps)
  const chunks = await splitAudioIntoChunks(convertedPath, 600); // 10 minutos
  console.log(`[OpenAI] Processando ${chunks.length} chunk(s)`);

  const allSegments: TranscriptionSegment[] = [];
  let allText = '';
  let detectedLanguage = language;
  const allSpeakers = new Set<string>();
  let timeOffset = 0;

  // Processar cada chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkPath = chunks[i];
    console.log(`[OpenAI] Transcrevendo chunk ${i + 1}/${chunks.length}...`);

    // Ler arquivo do chunk
    const fileStream = fs.createReadStream(chunkPath);

    // Parâmetros base
    const params: any = {
      file: fileStream,
      model,
      // CRITICAL: Adicionar prompt para melhorar transcrição de músicas
      // O prompt ajuda o Whisper a entender contexto e evitar repetições excessivas
      prompt: 'This is a song with verses, chorus, and musical structure. Transcribe the lyrics accurately without repeating the same phrase excessively.',
    };

    // Adicionar idioma se não for auto
    if (language && language !== 'auto') {
      params.language = language;
    }

    // Configurar resposta baseado no modelo
    if (model === 'gpt-4o-transcribe-diarize') {
      // gpt-4o com diarização - não suporta verbose_json
      params.response_format = 'json';
    } else if (model === 'gpt-4o-transcribe') {
      // gpt-4o sem diarização - não suporta verbose_json
      params.response_format = 'json';
    } else {
      // whisper-1 - SUPORTA verbose_json com segmentos!
      params.response_format = 'verbose_json';
      params.timestamp_granularities = ['segment'];
    }

    // Executar transcrição do chunk
    console.log(`[OpenAI] Iniciando request para chunk ${i + 1}...`);
    console.log(`[OpenAI] Modelo: ${model}, Response format: ${params.response_format}`);

    let transcription: any;
    try {
      transcription = await client.audio.transcriptions.create(params);
      console.log(`[OpenAI] Chunk ${i + 1} request bem-sucedido!`);
    } catch (apiError: any) {
      console.error(`[OpenAI] Erro no chunk ${i + 1}:`, {
        message: apiError.message,
        status: apiError.status,
        code: apiError.code,
        type: apiError.type,
      });
      throw apiError;
    }

    // DEBUG: Ver estrutura da resposta
    console.log(`[OpenAI] Chunk ${i + 1} response keys:`, Object.keys(transcription));
    console.log(`[OpenAI] Chunk ${i + 1} segments count:`, transcription.segments?.length || 0);
    console.log(`[OpenAI] Chunk ${i + 1} words count:`, transcription.words?.length || 0);

    // Processar resposta do chunk
    if (transcription.segments && transcription.segments.length > 0) {
      // Resposta com segments (verbose_json)
      for (const seg of transcription.segments) {
        allSegments.push({
          start: seg.start + timeOffset,
          end: seg.end + timeOffset,
          text: seg.text.trim(),
          speaker: seg.speaker, // Pode existir ou não
        });

        // Se tiver speaker, adicionar ao set
        if (seg.speaker) {
          allSpeakers.add(seg.speaker);
        }
      }
    } else if (transcription.words && transcription.words.length > 0) {
      // Se tiver palavras individuais mas não segmentos, agrupar
      const words = transcription.words;
      let currentSeg: any = null;

      for (const word of words) {
        if (!currentSeg) {
          currentSeg = {
            start: word.start,
            end: word.end,
            text: word.word,
            speaker: word.speaker,
          };
        } else if (
          word.speaker === currentSeg.speaker &&
          word.start - currentSeg.end < 1.0 // Gap menor que 1 segundo
        ) {
          // Continuar no mesmo segmento
          currentSeg.end = word.end;
          currentSeg.text += ' ' + word.word;
        } else {
          // Novo segmento
          allSegments.push({
            start: currentSeg.start + timeOffset,
            end: currentSeg.end + timeOffset,
            text: currentSeg.text.trim(),
            speaker: currentSeg.speaker,
          });

          if (currentSeg.speaker) {
            allSpeakers.add(currentSeg.speaker);
          }

          currentSeg = {
            start: word.start,
            end: word.end,
            text: word.word,
            speaker: word.speaker,
          };
        }
      }

      // Adicionar último segmento
      if (currentSeg) {
        allSegments.push({
          start: currentSeg.start + timeOffset,
          end: currentSeg.end + timeOffset,
          text: currentSeg.text.trim(),
          speaker: currentSeg.speaker,
        });

        if (currentSeg.speaker) {
          allSpeakers.add(currentSeg.speaker);
        }
      }
    } else if (transcription.text) {
      // Fallback: Resposta simples sem segments/words
      console.warn('[OpenAI] Nenhum segmento retornado, usando texto completo');
      allSegments.push({
        start: timeOffset,
        end: timeOffset,
        text: transcription.text.trim(),
      });
    }

    // Adicionar texto do chunk
    const chunkText = transcription.text || '';
    allText += (allText ? ' ' : '') + chunkText;

    // Detectar idioma do primeiro chunk
    if (i === 0 && transcription.language) {
      detectedLanguage = transcription.language;
    }

    // Atualizar offset de tempo para o próximo chunk (10 minutos)
    if (i < chunks.length - 1) {
      timeOffset += 600;
    }

    // Limpar chunk temporário se não for o original
    if (chunkPath !== filePath) {
      try {
        fs.unlinkSync(chunkPath);
        console.log(`[FFmpeg] Chunk ${i + 1} removido`);
      } catch (error) {
        console.error(`[FFmpeg] Erro ao remover chunk ${i + 1}:`, error);
      }
    }
  }

  const speakerCount = allSpeakers.size > 0 ? allSpeakers.size : undefined;

  console.log('[OpenAI] Transcrição concluída:', {
    chunks: chunks.length,
    segments: allSegments.length,
    speakers: speakerCount,
    chars: allText.length,
  });

  // Limpar arquivo convertido se foi criado
  if (convertedPath !== filePath && convertedPath.includes('_converted.mp3')) {
    try {
      fs.unlinkSync(convertedPath);
      console.log('[FFmpeg] Arquivo convertido removido:', convertedPath);
    } catch (error) {
      console.error('[FFmpeg] Erro ao remover arquivo convertido:', error);
    }
  }

  return {
    text: allText,
    segments: allSegments,
    language: detectedLanguage,
    speakerCount,
  };
}

/**
 * Post-processa texto com GPT-4o (MULTILÍNGUE)
 */
export async function postProcessText(
  text: string,
  detectedLanguage?: string
): Promise<{
  text: string;
  summary?: string;
  topics?: string[];
}> {
  const client = getOpenAIClient();

  // Criar prompt baseado no idioma detectado
  const isPortuguese = detectedLanguage?.startsWith('pt') || detectedLanguage === 'pt';

  const prompt = isPortuguese
    ? `Formate esta letra de música com estrutura profissional EM PORTUGUÊS.

FORMATO OBRIGATÓRIO - Use exatamente este padrão EM PORTUGUÊS:

[Introdução]
(sons instrumentais ou repetições iniciais)

[Verso 1]
Primeira linha
Segunda linha
...

[Refrão]
Linha do refrão
...

[Verso 2]
...

[Refrão]

[Ponte]
(se houver)

[Final]
...

LETRA TRANSCRITA:
${text.substring(0, 120000)}

CRÍTICO: SEMPRE use tags EM PORTUGUÊS: [Introdução], [Verso], [Refrão], [Ponte], [Final]. NÃO use inglês!`
    : `Format this song lyrics with professional structure IN ENGLISH.

REQUIRED FORMAT - Use exactly this pattern IN ENGLISH:

[Intro]
(instrumental sounds or initial repetitions)

[Verse 1]
First line
Second line
...

[Chorus]
Chorus line
...

[Verse 2]
...

[Chorus]

[Bridge]
(if exists)

[Outro]
...

TRANSCRIBED LYRICS:
${text.substring(0, 120000)}

CRITICAL: ALWAYS use tags IN ENGLISH: [Intro], [Verse], [Chorus], [Bridge], [Outro]. Do NOT use Portuguese!`;

  // Usar few-shot para forçar o formato NO IDIOMA CORRETO
  const exampleInput = isPortuguese
    ? 'Olhar Em algum lugar pra relaxar Eu vou pedir pros anjos cantarem por mim Pra quem tem fé A vida nunca tem fim'
    : 'You can feel it in the streets On a day like this the heat I feel like summer';

  const exampleOutput = isPortuguese
    ? `[Introdução]
(instrumental)

[Verso 1]
Olhar
Em algum lugar pra relaxar

[Refrão]
Eu vou pedir pros anjos cantarem por mim
Pra quem tem fé
A vida nunca tem fim`
    : `[Intro]
(instrumental)

[Verse 1]
You can feel it in the streets
On a day like this the heat

[Chorus]
I feel like summer`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: isPortuguese
          ? 'Você formata letras de música com estrutura profissional usando tags EM PORTUGUÊS: [Introdução], [Verso], [Refrão], [Ponte], [Final].'
          : 'You format song lyrics with professional structure using tags IN ENGLISH: [Intro], [Verse], [Chorus], [Bridge], [Outro].',
      },
      // Few-shot example
      {
        role: 'user',
        content: isPortuguese
          ? `Formate esta letra:\n\n${exampleInput}`
          : `Format this lyrics:\n\n${exampleInput}`,
      },
      {
        role: 'assistant',
        content: exampleOutput,
      },
      // Actual request
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.2,
    max_tokens: 16000,
  });

  const correctedText = response.choices[0].message.content?.trim() || text;

  console.log('[GPT-4o] Post-processamento concluído');

  return {
    text: correctedText,
  };
}
