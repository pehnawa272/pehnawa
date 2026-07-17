import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (e) {
  console.error("[RateLimit] Failed to initialize Upstash Redis:", e);
}

export function getClientIp(req: NextRequest): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    return ips[0].trim();
  }
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;
  return "127.0.0.1";
}

export type RateLimitConfig = {
  requests: number;
  duration: string; // e.g. "60 s", "10 m", "15 m"
};

/**
 * Checks the rate limit for a given request and identifier.
 * Fails open (allows the request through) if Upstash Redis is unreachable.
 */
export async function checkRateLimit(
  req: NextRequest,
  prefix: string,
  config: RateLimitConfig
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  if (!redis) {
    console.warn(`[RateLimit] Redis not configured for ${prefix}. Failing open.`);
    return { success: true };
  }

  try {
    const ip = getClientIp(req);
    const identifier = `${prefix}:${ip}`;
    
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.duration as any),
      analytics: true,
      prefix: `@upstash/ratelimit:${prefix}`,
    });

    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error(`[RateLimit ERROR] Failed to check rate limit for ${prefix}:`, error);
    // Fail open to prevent service outage if Redis/Upstash is down
    return { success: true };
  }
}
