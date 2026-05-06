/**
 * In-memory sliding window rate limiter.
 *
 * Limits: MAX_REQUESTS per WINDOW_MS per IP.
 * Best-effort on serverless (resets on cold start).
 */

const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const ipMap = new Map();

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipMap) {
    const valid = timestamps.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) {
      ipMap.delete(ip);
    } else {
      ipMap.set(ip, valid);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

export function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = (ipMap.get(ip) || []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    return false;
  }

  timestamps.push(now);
  ipMap.set(ip, timestamps);
  return true;
}
