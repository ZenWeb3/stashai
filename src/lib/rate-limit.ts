const rateLimit = new Map<string, { count: number; lastReset: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5; // 5 attempts per window

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  // Clean up old entries periodically
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
