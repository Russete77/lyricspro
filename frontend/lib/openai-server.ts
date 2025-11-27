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
 * NOTA: O texto já foi transcrito pela API Whisper. Esta função apenas FORMATA
 * e ORGANIZA o texto existente em seções musicais (verso, refrão, etc.)
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

  // IMPORTANTE: Deixar CLARO que estamos apenas FORMATANDO texto já transcrito,
  // não pedindo para transcrever ou reproduzir conteúdo protegido
  const prompt = isPortuguese
    ? `Você é um assistente de formatação de texto. O texto abaixo foi transcrito automaticamente por um sistema de reconhecimento de fala (Whisper ASR). Sua tarefa é APENAS organizar e formatar este texto em seções, adicionando marcadores de estrutura.

TAREFA: Organize o texto transcrito em seções usando marcadores. NÃO modifique o conteúdo, apenas adicione os marcadores de seção apropriados.

MARCADORES A USAR (em português):
- [Introdução] - para partes instrumentais ou repetições iniciais
- [Verso 1], [Verso 2], etc. - para estrofes narrativas
- [Refrão] - para partes que se repetem
- [Ponte] - para transições musicais
- [Final] - para a conclusão

TEXTO TRANSCRITO PARA FORMATAR:
${text.substring(0, 120000)}

INSTRUÇÕES:
1. Mantenha TODO o texto original
2. Apenas adicione os marcadores de seção
3. Separe as linhas de forma lógica
4. Use marcadores EM PORTUGUÊS`
    : `You are a text formatting assistant. The text below was automatically transcribed by a speech recognition system (Whisper ASR). Your task is ONLY to organize and format this text into sections by adding structure markers.

TASK: Organize the transcribed text into sections using markers. Do NOT modify the content, only add appropriate section markers.

MARKERS TO USE (in English):
- [Intro] - for instrumental parts or initial repetitions
- [Verse 1], [Verse 2], etc. - for narrative stanzas
- [Chorus] - for repeating parts
- [Bridge] - for musical transitions
- [Outro] - for the conclusion

TRANSCRIBED TEXT TO FORMAT:
${text.substring(0, 120000)}

INSTRUCTIONS:
1. Keep ALL original text
2. Only add section markers
3. Separate lines logically
4. Use markers IN ENGLISH`;

  // Few-shot example com texto genérico (não protegido por copyright)
  const exampleInput = isPortuguese
    ? 'bom dia sol nascendo no horizonte mais um dia começando agora vou seguir em frente bom dia sol nascendo'
    : 'good morning sun rising on the horizon another day is starting now I will move forward good morning sun rising';

  const exampleOutput = isPortuguese
    ? `[Introdução]
bom dia sol nascendo no horizonte

[Verso 1]
mais um dia começando
agora vou seguir em frente

[Refrão]
bom dia sol nascendo`
    : `[Intro]
good morning sun rising on the horizon

[Verse 1]
another day is starting
now I will move forward

[Chorus]
good morning sun rising`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: isPortuguese
          ? 'Você é um assistente de formatação de texto. Sua função é organizar textos transcritos automaticamente em seções estruturadas, adicionando marcadores como [Introdução], [Verso], [Refrão], [Ponte], [Final]. Você NÃO modifica o conteúdo, apenas organiza e formata.'
          : 'You are a text formatting assistant. Your function is to organize automatically transcribed texts into structured sections, adding markers like [Intro], [Verse], [Chorus], [Bridge], [Outro]. You do NOT modify the content, only organize and format.',
      },
      // Few-shot example
      {
        role: 'user',
        content: isPortuguese
          ? `Formate este texto transcrito em seções:\n\n${exampleInput}`
          : `Format this transcribed text into sections:\n\n${exampleInput}`,
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
