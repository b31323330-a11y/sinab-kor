interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * In-memory rate limiter for form submissions
 * @param key unique identifier (e.g., client IP or identifier)
 * @param limit maximum allowed attempts in window (default 5)
 * @param windowMs time window in milliseconds (default 1 hour = 3,600,000 ms)
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60 * 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetAt) {
    const record: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitMap.set(key, record);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: record.resetAt,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

