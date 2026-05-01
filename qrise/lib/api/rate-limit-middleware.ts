import { NextRequest, NextResponse } from 'next/server';
import { checkAdvancedRateLimit, isIPBlocked, redis, supabase } from './rate-limit-api';

export async function rateLimitMiddleware(req: NextRequest) {
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  
  // 1. Check for IP Blocks
  const blockCheck = await isIPBlocked(ip);
  if (blockCheck.blocked) {
    return new NextResponse(
      JSON.stringify({ error: 'Your IP has been blocked', reason: blockCheck.reason }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Identify User/Key
  const apiKey = req.headers.get('x-api-key');
  let identifier = apiKey || ip;
  let plan = 'free';

  if (apiKey) {
    // Fetch plan associated with API Key
    const cacheKey = `api_key_plan:${apiKey}`;
    const cachedPlan = await redis.get<string>(cacheKey);
    
    if (cachedPlan) {
      plan = cachedPlan;
    } else {
      const { data } = await supabase
        .from('api_keys')
        .select('users(plan)')
        .eq('id', apiKey)
        .is('is_active', true)
        .single();
      
      const castedData = data as { users: { plan: string } | null } | null;
      if (castedData?.users?.plan) {
        plan = castedData.users.plan;
        await redis.set(cacheKey, plan, { ex: 300 });
      }
    }
  } else {
    // Try to get user from session cookie for web app routes
    const sessionCookie = req.cookies.get('sb-access-token')?.value;
    if (sessionCookie) {
      const { data: { user } } = await supabase.auth.getUser(sessionCookie);
      if (user) {
        identifier = user.id;
        // Fetch user plan
        const userCacheKey = `user_plan:${user.id}`;
        const cachedUserPlan = await redis.get<string>(userCacheKey);
        if (cachedUserPlan) {
          plan = cachedUserPlan;
        } else {
          const { data: userData } = await supabase
            .from('users')
            .select('plan')
            .eq('id', user.id)
            .single();
          if (userData?.plan) {
            plan = userData.plan;
            await redis.set(userCacheKey, plan, { ex: 300 });
          }
        }
      }
    } else {
      // Fallback to IP for anonymous users
      identifier = ip;
      plan = 'free';
    }
  }

  const endpoint = req.nextUrl.pathname;

  // 3. Enforcement
  const result = await checkAdvancedRateLimit(identifier, plan, endpoint);

  if (!result.success) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Too Many Requests', 
        message: 'You have exceeded your rate limit. Please try again later.' 
      }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': 'Variable',
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString()
        } 
      }
    );
  }

  return NextResponse.next();
}
