type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const inMemoryRateLimitStore = new Map<string, RateLimitState>();
const MAX_STORE_SIZE = 10_000;

function cleanupExpiredBuckets(now: number) {
  for (const [key, state] of inMemoryRateLimitStore.entries()) {
    if (state.resetAt <= now) {
      inMemoryRateLimitStore.delete(key);
    }
  }
}

function trimStoreIfNeeded(now: number) {
  if (inMemoryRateLimitStore.size <= MAX_STORE_SIZE) {
    return;
  }

  cleanupExpiredBuckets(now);
}

export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const xRealIp = request.headers.get("x-real-ip")?.trim();
  if (xRealIp) {
    return xRealIp;
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return "unknown";
}

export function checkRateLimit(request: Request, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  trimStoreIfNeeded(now);

  const ip = getClientIp(request);
  const key = `${config.keyPrefix}:${ip}`;
  const current = inMemoryRateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + config.windowMs;
    inMemoryRateLimitStore.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      limit: config.maxRequests,
      resetAt,
      retryAfterSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      limit: config.maxRequests,
      resetAt: current.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  inMemoryRateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    limit: config.maxRequests,
    resetAt: current.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

