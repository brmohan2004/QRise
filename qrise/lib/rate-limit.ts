import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

const rateLimiters: Map<string, Ratelimit> = new Map();

function getRatelimitInstance(limit: number, window: Duration): Ratelimit {
  const key = `${limit}:${window}`;
  
  if (!rateLimiters.has(key)) {
    rateLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window),
      })
    );
  }
  
  return rateLimiters.get(key)!;
}

export async function rateLimitByIP(
  ip: string,
  action: string,
  limit: number,
  window: Duration
): Promise<RateLimitResult> {
  const identifier = `${action}:${ip}`;
  const ratelimit = getRatelimitInstance(limit, window);
  
  const result = await ratelimit.limit(identifier);
  
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export const authAttempts = {
  limit: 5,
  window: '15m',
} as const;

export const otpRequests = {
  limit: 5,
  window: '1h',
} as const;

export const apiRequests = {
  limit: 100,
  window: '1m',
} as const;

export const qrScans = {
  limit: 1000,
  window: '1m',
} as const;

export async function checkAuthRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimitByIP(ip, 'auth', authAttempts.limit, authAttempts.window);
}

export async function checkOTPRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimitByIP(ip, 'otp', otpRequests.limit, otpRequests.window);
}

export async function checkAPIRateLimit(apiKey: string): Promise<RateLimitResult> {
  return rateLimitByIP(apiKey, 'api', apiRequests.limit, apiRequests.window);
}

export async function checkScanRateLimit(qrId: string, ip: string): Promise<RateLimitResult> {
  return rateLimitByIP(ip, `scan:${qrId}`, qrScans.limit, qrScans.window);
}
