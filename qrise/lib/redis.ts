import { Redis } from '@upstash/redis';
import { Ratelimit, type Duration } from '@upstash/ratelimit';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authAttempts = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix: 'rl:auth',
});

export const otpRequests = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:otp',
});

export const apiRequests = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'rl:api',
});

const rateLimiters = new Map<string, Ratelimit>();

export async function rateLimitByIP(
  ip: string,
  action: string,
  limit: number,
  window: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `${action}:${limit}:${window}`;
  
  if (!rateLimiters.has(key)) {
    rateLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window as Duration),
        prefix: `rl:${action}`,
      })
    );
  }
  
  const limiter = rateLimiters.get(key)!;
  const result = await limiter.limit(ip);
  
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}