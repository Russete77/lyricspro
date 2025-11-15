/**
 * Rate Limiting
 * Limite de requisições por usuário
 */

// In-memory store (desenvolvimento)
// Em produção, use Redis/Upstash
const tokenBuckets = new Map<string, { tokens: number; lastRefill: number }>();

export interface RateLimitConfig {
  maxRequests: number; // Máximo de requisições
  windowMs: number; // Janela de tempo em ms
}

export const RATE_LIMITS = {
  upload: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads por minuto
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requisições por minuto
} as const;

/**
 * Verifica se o usuário pode fazer uma requisição
 */
export function checkRateLimit(userId: string, config: RateLimitConfig): {
  allowed: boolean;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const key = userId;

  // Obter ou criar bucket
  let bucket = tokenBuckets.get(key);

  if (!bucket) {
    bucket = {
      tokens: config.maxRequests,
      lastRefill: now,
    };
    tokenBuckets.set(key, bucket);
  }

  // Recarregar tokens se a janela passou
  const timeSinceRefill = now - bucket.lastRefill;
  if (timeSinceRefill >= config.windowMs) {
    bucket.tokens = config.maxRequests;
    bucket.lastRefill = now;
  }

  // Verificar se tem tokens disponíveis
  if (bucket.tokens > 0) {
    bucket.tokens--;
    return {
      allowed: true,
      remaining: bucket.tokens,
      reset: bucket.lastRefill + config.windowMs,
    };
  }

  return {
    allowed: false,
    remaining: 0,
    reset: bucket.lastRefill + config.windowMs,
  };
}

/**
 * Limpar tokens antigos (chamar periodicamente)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutos

  for (const [key, bucket] of tokenBuckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      tokenBuckets.delete(key);
    }
  }
}

// Limpar a cada 5 minutos
setInterval(cleanupRateLimits, 5 * 60 * 1000);
