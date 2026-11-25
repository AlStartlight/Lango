import "server-only";

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

/**
 * In-process fixed-window limiter. It is sufficient for a single instance and
 * local development. For multi-instance production, back this with Redis or a
 * database table (PRD 13.2).
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
  const now = Date.now();
  const existing = buckets.get(key);
  const timestamps = (existing?.timestamps ?? []).filter(
    (timestamp) => now - timestamp < windowMs,
  );

  if (timestamps.length >= limit) {
    const oldest = timestamps[0] ?? now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((windowMs - (now - oldest)) / 1000),
      ),
      remaining: 0,
    };
  }

  timestamps.push(now);
  buckets.set(key, { timestamps });

  if (buckets.size > 10_000) {
    for (const [bucketKey, bucket] of buckets) {
      const alive = bucket.timestamps.some(
        (timestamp) => now - timestamp < windowMs,
      );
      if (!alive) buckets.delete(bucketKey);
    }
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(0, limit - timestamps.length),
  };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
