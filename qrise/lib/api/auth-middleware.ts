import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys, users, plans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateRequestId } from '@/lib/api/request-id';
import { apiError } from '@/lib/api/response';
import { getPlanRateLimits, getUserRateLimits, checkRateLimit, redis, type PlanRateLimits } from '@/lib/api/rate-limit-config';
import { trackUsage } from '@/lib/api/usage-tracker';
import { type ApiScope } from '@/lib/api/scope-registry';
import { hashApiKey } from '@/lib/api-key';
import { getSandboxDb } from '@/lib/db/sandbox-client';
import { type Database } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

export interface ApiContext {
  requestId: string;
  apiKey: typeof apiKeys.$inferSelect;
  user: typeof users.$inferSelect;
  plan: string;
  limits: PlanRateLimits;
  environment: 'live' | 'test' | 'int';
  hasScope: (scope: ApiScope) => boolean;
  db: Database;
  params?: Record<string, string>;
}

export interface WithApiAuthOptions {
  scope?: ApiScope;
  billableUnit?: 'api_call' | 'image_render' | 'embed_render' | 'resolver_call';
}

type ApiHandler = (req: NextRequest & { params?: Record<string, string> }, ctx: ApiContext) => Promise<NextResponse>;
type RouteHandler = (req: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;

export function withApiAuth(handler: ApiHandler, options?: ApiScope | WithApiAuthOptions): RouteHandler {
  let scope: ApiScope | undefined;
  let billableUnit: 'api_call' | 'image_render' | 'embed_render' | 'resolver_call' = 'api_call';

  if (typeof options === 'string') {
    scope = options;
  } else if (options) {
    scope = options.scope;
    if (options.billableUnit) billableUnit = options.billableUnit;
  }

  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const authHeader = req.headers.get('authorization');
    // 1. Try Session Auth if no API Key or Invalid Prefix (for dashboard usage)
    if (!authHeader || (!authHeader.startsWith('Bearer qr_live_') && !authHeader.startsWith('Bearer qr_test_'))) {
      const sessionUser = await getAuthenticatedUser();
      if (sessionUser && !sessionUser.isApiKey) {
        // Build context for Session User
        const params = await context.params;
        let user;
        let plan = 'free';
        try {
          const userRec = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
          user = userRec[0];
          plan = user?.plan || 'free';
        } catch (e) {
          console.error('Failed to fetch user from DB in auth-middleware:', e);
          user = { id: sessionUser.id, plan: 'free' } as unknown as typeof users.$inferSelect;
        }
        const limits = await getPlanRateLimits(plan);

        const apiCtx: ApiContext = {
          requestId,
          apiKey: {
            id: `session_${sessionUser.id}`,
            userId: sessionUser.id,
            name: 'Session Auth',
            keyPrefix: 'session',
            keyHash: 'session',
            scopes: [scope || 'all'],
            isActive: true,
            expiresAt: null,
            lastUsedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            environment: 'live',
            ipAllowlist: null,
            callsThisMonth: 0,
            callsResetAt: null,
            description: null,
            lastIp: null,
            monthlyCallLimit: null,
            adminCallLimitOverride: null,
          } as unknown as typeof apiKeys.$inferSelect,
          user: user as unknown as typeof users.$inferSelect,
          plan,
          limits,
          environment: 'live',
          hasScope: () => true, // Dashboard users have all scopes for these routes
          db: db,
          params,
        };

        // Resolve and attach params to request
        const reqWithParams = req as NextRequest & { params: Record<string, string> };
        reqWithParams.params = params;

        return handler(reqWithParams, apiCtx);
      }
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return apiError('MISSING_API_KEY', 'Missing Authorization header.', 401);
      }
    }

    const token = authHeader.replace('Bearer ', '');

    // Detect environment by prefix
    let environment: 'live' | 'test' | 'int' = 'live';
    if (token.startsWith('qr_test_')) {
      environment = 'test';
    } else if (token.startsWith('qr_int_')) {
      environment = 'int';
    } else if (!token.startsWith('qr_live_')) {
      return apiError('INVALID_API_KEY', 'Invalid API key prefix.', 401);
    }

    const keyHash = await hashApiKey(token);

    const apiKeyRecords = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);

    if (!apiKeyRecords[0]) {
      return apiError('INVALID_API_KEY', 'Invalid API key.', 401);
    }

    const apiKey = apiKeyRecords[0];

    // Helper for tracking usage on errors
    const trackAndReturn = async (errorResponse: NextResponse) => {
      const latencyMs = Date.now() - startTime;
      await trackUsage({
        apiKeyId: apiKey.id,
        userId: apiKey.userId,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: errorResponse.status,
        latencyMs,
        requestId,
        environment: environment as 'live' | 'test' | 'int',
        billableUnit,
      }).catch(console.error);
      
      errorResponse.headers.set('X-QRise-Request-Id', requestId);
      return errorResponse;
    };

    if (!apiKey.isActive) {
      return trackAndReturn(apiError('REVOKED_API_KEY', 'This API key has been revoked.', 401));
    }

    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return trackAndReturn(apiError('EXPIRED_API_KEY', 'This API key has expired.', 401));
    }

    // IP allowlist check
    if (apiKey.ipAllowlist && apiKey.ipAllowlist.length > 0) {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
      const allowed = apiKey.ipAllowlist.some((cidr: string) => ipMatches(cidr, clientIp));
      if (!allowed) {
        return trackAndReturn(apiError('IP_NOT_ALLOWED', 'IP address not allowed for this key.', 403));
      }
    }

    // Fetch user + plan
    const userRecords = await db
      .select({
        user: users,
        plan: plans,
      })
      .from(users)
      .leftJoin(plans, eq(users.plan, plans.name))
      .where(eq(users.id, apiKey.userId))
      .limit(1);

    if (!userRecords[0]) {
      return apiError('INVALID_API_KEY', 'User not found.', 401);
    }

    const user = userRecords[0].user;
    const plan = userRecords[0].plan?.name || 'free';

    // Load rate limits (plan + user overrides)
    const planLimits = await getPlanRateLimits(plan);
    const limits = await getUserRateLimits(user.id, planLimits);

    // Scope check
    if (scope && !apiKey.scopes.includes(scope)) {
      return trackAndReturn(apiError('INSUFFICIENT_SCOPE', `Required scope: ${scope}`, 403));
    }

    // Monthly quota check
    const quotaKey = `quota_exceeded:${user.id}`;
    if (redis) {
      const quotaExceeded = await redis.get(quotaKey).catch(() => null);
      if (quotaExceeded) {
        // Free plan is always blocked. Paid plans blocked only if overages are disabled.
        const isFreePlan = plan === 'free' || plan === 'unlimited'; // unlimited in dev might mean free for this check
        const allowsOverages = (user as typeof users.$inferSelect).allowOverages === true;

        if (isFreePlan || !allowsOverages) {
          const message = isFreePlan 
            ? 'Your plan limit has been reached. Please upgrade to continue.'
            : 'Your plan limit has been reached. Please enable overages or upgrade your plan.';
          
          return trackAndReturn(apiError('QUOTA_EXCEEDED', message, 429, {
            plan,
            can_enable_overages: !isFreePlan
          }));
        }
      }
    }

    // Rate limit check (live only)
    let rateLimitResult = { success: true, remaining: 0, reset: 0 };
    if (environment === 'live') {
      const ratelimitKey = `${apiKey.id}:${req.method} ${req.nextUrl.pathname}`;
      rateLimitResult = await checkRateLimit(ratelimitKey, limits, req.nextUrl.pathname);
      if (!rateLimitResult.success) {
        const retryAfter = Math.ceil(rateLimitResult.reset / 1000);
        const response = apiError('RATE_LIMITED', 'Rate limit exceeded.', 429, {
          retry_after: retryAfter,
        });
        response.headers.set('Retry-After', String(retryAfter));
        return trackAndReturn(response);
      }
    }

    // Build context for handler
    const params = await context.params;
    const apiCtx: ApiContext = {
      requestId,
      apiKey,
      user,
      plan,
      limits,
      environment: environment as 'live' | 'test' | 'int',
      hasScope: (s: ApiScope) => apiKey.scopes.includes(s),
      db: environment === 'test' ? getSandboxDb() : db,
      params,
    };

    // Resolve and attach params to request for handler consumption
    const reqWithParams = req as NextRequest & { params: Record<string, string> };
    reqWithParams.params = params;

    // Call handler
    const response = await handler(reqWithParams, apiCtx);
    const latencyMs = Date.now() - startTime;

    // Track usage for success/error from handler
    trackUsage({
      apiKeyId: apiKey.id,
      userId: user.id,
      endpoint: req.nextUrl.pathname,
      method: req.method,
      statusCode: response.status,
      latencyMs,
      requestId,
      environment: environment as 'live' | 'test' | 'int',
      billableUnit,
    }).catch(console.error);

    // Add headers
    response.headers.set('X-QRise-Request-Id', requestId);
    response.headers.set('X-QRise-Plan', plan);
    response.headers.set('X-RateLimit-Limit', String(limits.rpm + limits.maxBurst));
    response.headers.set('X-RateLimit-Window', '60');
    if (rateLimitResult.success) {
      response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.reset / 1000)));
    }

    return response;
  };
}


function ipMatches(cidr: string, ip: string): boolean {
  // Simplified CIDR matching for IPv4
  if (!cidr.includes('/')) {
    return cidr === ip;
  }
  const [range, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr, 10);
  const mask = ~((1 << (32 - bits)) - 1);
  const ipToInt = (addr: string) => addr.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0;
  const rangeInt = ipToInt(range);
  const ipInt = ipToInt(ip);
  return (ipInt & mask) === (rangeInt & mask);
}
