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

// Accepted orders per IP (+ visitor cookie) — throttles direct-API order spam.
export const ORDER_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3, // 3 orders
  windowMs: 60 * 60 * 1000, // per hour
};

// Accepted orders per normalized email identity (gmail dots/+tags collapsed) —
// stops one spammer cycling dotted variants of the same address past the per-IP cap.
export const ORDER_EMAIL_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3, // 3 orders
  windowMs: 60 * 60 * 1000, // per hour
};

// Form-token issuance per IP — generous enough for real reloads, tight enough to
// throttle bots farming fresh tokens in bulk.
export const TOKEN_ISSUE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 40, // 40 token fetches
  windowMs: 10 * 60 * 1000, // per 10 minutes
};
