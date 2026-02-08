const IS_DEV = process.env.NODE_ENV === "development";

const rateLimit = new Map<string, { count: number; lastReset: number }>();

// ✅ Much shorter for dev, stricter for production
const WINDOW_MS = IS_DEV ? 1 * 60 * 1000 : 15 * 60 * 1000; // 1 min dev, 15 min prod
const MAX_ATTEMPTS = IS_DEV ? 100 : 10; // 100 attempts in dev, 10 in prod

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  // ✅ Skip entirely in development
  if (IS_DEV) {
    return { allowed: true, remaining: 999, resetIn: 0 };
  }

  const now = Date.now();
  const record = rateLimit.get(identifier);

  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimit.entries()) {
      if (now - value.lastReset > WINDOW_MS) {
        rateLimit.delete(key);
      }
    }
  }

  if (!record || now - record.lastReset > WINDOW_MS) {
    rateLimit.set(identifier, { count: 1, lastReset: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const resetIn = WINDOW_MS - (now - record.lastReset);
    return { allowed: false, remaining: 0, resetIn };
  }

  record.count++;
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - record.count,
    resetIn: WINDOW_MS - (now - record.lastReset),
  };
}

// ✅ Helper to clear rate limits (useful for testing)
export function clearRateLimits() {
  rateLimit.clear();
}