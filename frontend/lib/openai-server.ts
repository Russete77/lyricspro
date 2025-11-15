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
 * Post-processa texto com GPT-4o
 */
export async function postProcessText(text: string): Promise<{
  text: string;
  summary?: string;
  topics?: string[];
}> {
  const client = getOpenAIClient();

  const prompt = `Você é um ESPECIALISTA em correção de transcrições de áudio em português brasileiro.

OBJETIVO: Corrigir erros de transcrição mantendo 100% fidelidade à letra OFICIAL quando for música conhecida.

🎵 MÚSICAS CONHECIDAS - PRIORIDADE MÁXIMA:
Se reconhecer uma música brasileira famosa, use a letra OFICIAL:

**SERTANEJO:**
- Lamento Sertanejo (Dominguinhos/Gilberto Gil)
- Chitãozinho & Xororó, Milionário & José Rico, Zezé Di Camargo & Luciano
- Bruno & Marrone, Victor & Leo, Jorge & Mateus

**MPB:**
- Chico Buarque, Caetano Veloso, Gilberto Gil, Milton Nascimento
- Elis Regina, Gal Costa, Maria Bethânia

**SAMBA/PAGODE:**
- Beth Carvalho, Zeca Pagodinho, Alcione, Martinho da Vila

**OUTROS:**
- Tim Maia, Djavan, Legião Urbana, Cazuza, Barão Vermelho

REGRAS DE CORREÇÃO:
1. ✅ **MÚSICAS CONHECIDAS**: Use a letra OFICIAL completa
2. ✅ Corrija erros de transcrição (ex: "por ser de na" → "por ser de lá")
3. ✅ Adicione pontuação e quebras de linha entre estrofes
4. ✅ Capitalize início de versos
5. ✅ Preserve sotaques regionais APENAS se não for música conhecida
6. ❌ NÃO invente conteúdo se não reconhecer a música

Texto transcrito:
${text.substring(0, 120000)}

Retorne APENAS o texto CORRIGIDO (letra oficial se for música conhecida), sem explicações ou comentários.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Você é um especialista em CORREÇÃO de transcrições automáticas.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 16000,
  });

  const correctedText = response.choices[0].message.content?.trim() || text;

  console.log('[GPT-4o] Post-processamento concluído');

  return {
    text: correctedText,
  };
}
