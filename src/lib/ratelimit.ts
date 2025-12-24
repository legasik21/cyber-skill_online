// Simple in-memory rate limiter
// For production, consider using Redis or Upstash

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request is allowed based on rate limiting
 * @param key - Unique identifier (e.g., visitor_id + IP)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No existing entry, create new one
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Rate limit configs
export const MESSAGE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10, // 10 messages
  windowMs: 60 * 1000, // per minute
};

export const CONVERSATION_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3, // 3 conversations
  windowMs: 60 * 60 * 1000, // per hour
};
