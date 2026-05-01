import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { db } from '@/lib/db';
import { planRateLimits, userRateLimitOverrides } from '@/lib/db/schema';
import { eq, and, gt, or, isNull } from 'drizzle-orm';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = redisUrl && redisToken 
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

const REDIS_TIMEOUT = 2000; // 2 seconds

async function redisWithTimeout<T>(promise: Promise<T>): Promise<T> {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Redis operation timed out')), REDIS_TIMEOUT)
  );
  return Promise.race([promise, timeout]);
}

export interface PlanRateLimits {
  plan: string;
  rpm: number;
  rpd: number;
  maxBurst: number;
  imageRendersPerMonth: number;
  embedRendersPerMonth: number;
  resolverCallsPerMonth: number;
  apiCallsPerMonth: number;
  maxWebhooks: number;
  maxCustomTypes: number;
  maxResolverTimeoutMs: number;
  maxDynamicQrs: number;
}

export const DEFAULT_UNLIMITED_LIMITS: PlanRateLimits = {
  plan: 'unlimited',
  rpm: 10000,
  rpd: 100000,
  maxBurst: 100,
  imageRendersPerMonth: 1000000,
  embedRendersPerMonth: 1000000,
  resolverCallsPerMonth: 1000000,
  apiCallsPerMonth: 1000000,
  maxWebhooks: 1000,
  maxCustomTypes: 1000,
  maxResolverTimeoutMs: 60000,
  maxDynamicQrs: 10000,
};

const PLAN_CACHE_TTL = 60; // seconds
const USER_CACHE_TTL = 60;

export async function getPlanRateLimits(plan: string): Promise<PlanRateLimits> {
  const cacheKey = `rl_config:${plan}`;
  try {
    if (redis) {
      const cached = await redisWithTimeout(redis.get<PlanRateLimits>(cacheKey));
      if (cached) return cached;
    }
  } catch (e) {
    console.warn('Redis error or timeout in getPlanRateLimits:', e);
  }

  try {
    const rows = await db
      .select()
      .from(planRateLimits)
      .where(eq(planRateLimits.plan, plan))
      .limit(1);

    const row = rows[0];
    if (!row) {
      // Fallback to unlimited if plan is not configured yet
      const limits: PlanRateLimits = {
        ...DEFAULT_UNLIMITED_LIMITS,
        plan: plan, // Keep the requested plan name but use unlimited values
      };
      if (redis) {
        redisWithTimeout(redis.set(cacheKey, limits, { ex: PLAN_CACHE_TTL })).catch(console.error);
      }
      return limits;
    }

    const limits: PlanRateLimits = {
      plan: row.plan,
      rpm: row.rpm,
      rpd: row.rpd,
      maxBurst: row.maxBurst,
      imageRendersPerMonth: row.imageRendersPerMonth,
      embedRendersPerMonth: row.embedRendersPerMonth,
      resolverCallsPerMonth: row.resolverCallsPerMonth,
      apiCallsPerMonth: row.apiCallsPerMonth,
      maxWebhooks: row.maxWebhooks,
      maxCustomTypes: row.maxCustomTypes,
      maxResolverTimeoutMs: row.maxResolverTimeoutMs,
      maxDynamicQrs: (row as Record<string, unknown>).maxDynamicQrs as number || 50,
    };

    if (redis) {
      redisWithTimeout(redis.set(cacheKey, limits, { ex: PLAN_CACHE_TTL })).catch(console.error);
    }
    return limits;
  } catch (error) {
    console.error('Database error in getPlanRateLimits, falling back to unlimited:', error);
    return {
      ...DEFAULT_UNLIMITED_LIMITS,
      plan: plan,
    };
  }
}

export async function getUserRateLimits(
  userId: string,
  fallbackPlan: PlanRateLimits
): Promise<PlanRateLimits> {
  const cacheKey = `rl_config:user:${userId}`;
  try {
    if (redis) {
      const cached = await redisWithTimeout(redis.get<PlanRateLimits>(cacheKey));
      if (cached) return cached;
    }
  } catch (e) {
    console.warn('Redis error or timeout in getUserRateLimits:', e);
  }

  try {
    const overrides = await db
      .select()
      .from(userRateLimitOverrides)
      .where(
        and(
          eq(userRateLimitOverrides.userId, userId),
          or(
            gt(userRateLimitOverrides.expiresAt, new Date()),
            isNull(userRateLimitOverrides.expiresAt)
          )
        )
      )
      .limit(1);

    if (overrides[0]) {
      const override = overrides[0].override as Partial<PlanRateLimits>;
      const merged: PlanRateLimits = {
        ...fallbackPlan,
        ...override,
      };
      if (redis) {
        redisWithTimeout(redis.set(cacheKey, merged, { ex: USER_CACHE_TTL })).catch(console.error);
      }
      return merged;
    }
  } catch (error) {
    console.error('Database error in getUserRateLimits:', error);
  }

  return fallbackPlan;
}

export async function bustRateLimitCache(plan: string): Promise<void> {
  if (!redis) return;
  const cacheKey = `rl_config:${plan}`;
  redisWithTimeout(redis.del(cacheKey)).catch(console.error);
  // Set flag for admin badge (24h)
  redisWithTimeout(redis.set('rl_changed_recently', 'true', { ex: 86400 })).catch(console.error);
}

export async function bustUserRateLimitCache(userId: string): Promise<void> {
  if (!redis) return;
  const cacheKey = `rl_config:user:${userId}`;
  redisWithTimeout(redis.del(cacheKey)).catch(console.error);
}

export async function checkRateLimit(
  identifier: string,
  limits: PlanRateLimits,
  endpoint?: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!redis) {
    // If Redis is not configured, allow everything (unlimited mode)
    return {
      success: true,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  try {
    const minuteLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limits.rpm + limits.maxBurst, '1 m'),
      prefix: 'rl:min',
    });

    const dayLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limits.rpd, '1 d'),
      prefix: 'rl:day',
    });

    const key = endpoint ? `${identifier}:${endpoint}` : identifier;
    const [minRes, dayRes] = await redisWithTimeout(Promise.all([
      minuteLimit.limit(key),
      dayLimit.limit(key),
    ]));

    const success = minRes.success && dayRes.success;
    return {
      success,
      remaining: Math.min(minRes.remaining, dayRes.remaining),
      reset: Math.max(minRes.reset, dayRes.reset),
    };
  } catch (error) {
    console.error('Rate limit check failed, defaulting to success:', error);
    return {
      success: true,
      remaining: 0,
      reset: 0,
    };
  }
}
