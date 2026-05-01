import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RateLimitConfig {
  plan_name: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
}

export async function getPlanLimits(plan: string): Promise<RateLimitConfig> {
  const cacheKey = `rate_limit_config:${plan}`;
  
  // 1. Check Redis Cache
  const cached = await redis.get<RateLimitConfig>(cacheKey);
  if (cached) return cached;

  // 2. Fetch from DB
  const { data, error } = await supabase
    .from('rate_limit_config')
    .select('*')
    .eq('plan_name', plan)
    .single();

  if (error || !data) {
    // Fallback to default limits if plan not found
    return {
      plan_name: plan,
      requests_per_minute: 60,
      requests_per_hour: 1000,
      requests_per_day: 5000
    };
  }

  // 3. Cache in Redis (5 min TTL)
  await redis.set(cacheKey, data, { ex: 300 });
  
  return data;
}

export async function checkAdvancedRateLimit(
  identifier: string,
  plan: string,
  endpoint: string
) {
  let limits = await getPlanLimits(plan);

  // Check for overrides if identifier is an API Key or UUID (User)
  const isApiKey = identifier.startsWith('qr_');
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  if (isApiKey || isUuid) {
    const overrideKey = `rl_override:${identifier}`;
    const cachedOverride = await redis.get<Partial<RateLimitConfig>>(overrideKey);
    
    let override = cachedOverride;
    if (!override) {
      if (isApiKey) {
        const { data } = await supabase
          .from('api_keys')
          .select('admin_call_limit_override')
          .eq('id', identifier)
          .single();
        if (data?.admin_call_limit_override) {
          override = data.admin_call_limit_override;
        }
      } else {
        // Fetch user override if exists (assuming a column in users table)
        const { data } = await supabase
          .from('users')
          .select('rate_limit_override')
          .eq('id', identifier)
          .single();
        const castedData = data as { rate_limit_override: Partial<RateLimitConfig> } | null;
        if (castedData?.rate_limit_override) {
          override = castedData.rate_limit_override;
        }
      }
      
      if (override) {
        await redis.set(overrideKey, override, { ex: 300 });
      }
    }

    if (override) {
      limits = {
        ...limits,
        requests_per_minute: override.requests_per_minute ?? limits.requests_per_minute,
        requests_per_hour: override.requests_per_hour ?? limits.requests_per_hour,
        requests_per_day: override.requests_per_day ?? limits.requests_per_day,
      };
    }
  }

  // Define 3 windows
  const minuteLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limits.requests_per_minute, '1 m'),
    prefix: 'rl:min',
  });

  const hourLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limits.requests_per_hour, '1 h'),
    prefix: 'rl:hr',
  });

  const dayLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limits.requests_per_day, '1 d'),
    prefix: 'rl:day',
  });

  const [minRes, hrRes, dayRes] = await Promise.all([
    minuteLimit.limit(`${identifier}:${endpoint}`),
    hourLimit.limit(`${identifier}:${endpoint}`),
    dayLimit.limit(`${identifier}:${endpoint}`),
  ]);

  const success = minRes.success && hrRes.success && dayRes.success;

  if (!success) {
    // Log violation
    await logViolation({
      identifier,
      endpoint,
      plan,
      action: 'none' // Default action
    });
  }

  return {
    success,
    remaining: Math.min(minRes.remaining, hrRes.remaining, dayRes.remaining),
    reset: Math.max(minRes.reset, hrRes.reset, dayRes.reset),
  };
}

async function logViolation(details: { identifier: string; endpoint: string; plan: string; action: string }) {
  // Check if identifier is an API Key (prefix check)
  const isApiKey = details.identifier.startsWith('qr_');
  
  await supabase.from('rate_limit_violations').insert({
    api_key_id: isApiKey ? details.identifier : null,
    user_id: !isApiKey ? details.identifier : null,
    ip_address: !isApiKey && (details.identifier.includes('.') || details.identifier.includes(':')) ? details.identifier : null,
    endpoint: details.endpoint,
    window_start: new Date().toISOString(),
    window_end: new Date(Date.now() + 60000).toISOString(),
    auto_action_taken: details.action,
  });

  // Auto-action logic (key disabling / IP blocking)
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  if (isApiKey) {
    // 1. Check Key Violations (Threshold: 50 in 1 hour)
    const { count } = await supabase
      .from('rate_limit_violations')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', details.identifier)
      .gt('created_at', oneHourAgo);

    if (count && count > 50) {
      await supabase
        .from('api_keys')
        .update({ is_active: false, status: 'disabled_by_system' })
        .eq('id', details.identifier);
      
      // Update the violation record to reflect action taken
      await supabase
        .from('rate_limit_violations')
        .update({ auto_action_taken: 'key_disabled' })
        .eq('api_key_id', details.identifier)
        .gt('created_at', oneHourAgo);
    }
  } else {
    // 2. Check IP Violations (Threshold: 1000 in 1 hour)
    // Assuming identifier is IP if not API Key and not a UUID user_id
    const isIp = details.identifier.includes('.') || details.identifier.includes(':');
    if (isIp) {
      const { count } = await supabase
        .from('rate_limit_violations')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', details.identifier)
        .gt('created_at', oneHourAgo);

      if (count && count > 1000) {
        await supabase.from('ip_blocks').insert({
          ip_address: details.identifier,
          reason: 'Auto-blocked: exceeded 1000 rate limit violations in 1 hour',
          block_type: 'temporary',
          expires_at: new Date(Date.now() + 86400000).toISOString(), // 24h
          blocked_by: '00000000-0000-0000-0000-000000000000', // System user ID
        });
        
        // Clear Redis cache for this IP block
        await redis.del(`block:ip:${details.identifier}`);
      }
    }
  }

  // 3. Check for same user across multiple keys (Threshold: 100 in 1 hour)
  if (isApiKey) {
    const { data: keyData } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('id', details.identifier)
      .single();
    
    if (keyData?.user_id) {
      const { count: userViolations } = await supabase
        .from('rate_limit_violations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', keyData.user_id)
        .gt('created_at', oneHourAgo);

      if (userViolations && userViolations > 100) {
        // Flag user-wide violation
        await supabase.from('rate_limit_violations').insert({
          user_id: keyData.user_id,
          endpoint: 'ALL',
          violations_count: userViolations,
          window_start: oneHourAgo,
          window_end: new Date().toISOString(),
          auto_action_taken: 'user_flagged',
          ip_address: details.identifier.includes('.') ? details.identifier : null
        });
      }
    }
  }
}

export async function isIPBlocked(ip: string): Promise<{ blocked: boolean; reason?: string }> {
  const cacheKey = `block:ip:${ip}`;
  const cached = await redis.get<{ blocked: boolean; reason: string }>(cacheKey);
  if (cached) return cached;

  // 1. Check for exact IP match
  const { data } = await supabase
    .from('ip_blocks')
    .select('reason, cidr_range')
    .eq('ip_address', ip)
    .is('unblocked_at', null)
    .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
    .maybeSingle();

  if (data) {
    const blockData = { blocked: true, reason: data.reason };
    await redis.set(cacheKey, blockData, { ex: 3600 });
    return blockData;
  }

  // 2. Check for CIDR range match (more expensive, fetch active ranges)
  const { data: ranges } = await supabase
    .from('ip_blocks')
    .select('reason, cidr_range')
    .not('cidr_range', 'is', null)
    .is('unblocked_at', null)
    .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`);

  if (ranges && ranges.length > 0) {
    // Basic CIDR check (simplified)
    for (const range of ranges) {
      if (ipMatchesCIDR(ip, range.cidr_range!)) {
        const blockData = { blocked: true, reason: range.reason };
        await redis.set(cacheKey, blockData, { ex: 3600 });
        return blockData;
      }
    }
  }

  return { blocked: false };
}

function ipMatchesCIDR(ip: string, cidr: string): boolean {
  try {
    const [range, bits] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);
    
    const ipInt = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    const rangeInt = range.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    
    return (ipInt & mask) === (rangeInt & mask);
  } catch {
    return false;
  }
}
