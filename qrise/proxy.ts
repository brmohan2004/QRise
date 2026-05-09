import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import type { User } from '@supabase/supabase-js';

export default async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Supabase environment variables are missing in middleware.');
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ── Maintenance Mode Check ──
  let isMaintenance = false;
  let isReadOnly = false;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Skip Redis check in development to avoid local timeouts and speed up page loads
  if (process.env.NODE_ENV === 'production' && redisUrl && redisToken) {
    try {
      const redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      // Use a short timeout to prevent hanging the entire request if Redis is unreachable
      const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), ms));

      const maintenancePromise = redis.get('platform:maintenance');
      const readOnlyPromise = redis.get('platform:read_only');

      const [maintenanceRes, readOnlyRes] = await Promise.race([
        Promise.all([maintenancePromise, readOnlyPromise]),
        timeout(4000) // Increased to 4s
      ]) as [string | null, string | null];

      isMaintenance = maintenanceRes === 'true';
      isReadOnly = readOnlyRes === 'true';
    } catch (e) {
      console.error('Redis check skipped (timeout or error):', e);
    }
  }
  const { pathname } = request.nextUrl;

  // IMPORTANT: This refreshes the session cookie on every request (updateSession pattern)
  // Added a timeout to prevent middleware from hanging if Supabase is unreachable
  const getUserWithTimeout = async () => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase auth timeout')), 5000)
    );
    try {
      const result = (await Promise.race([
        supabase.auth.getUser(),
        timeout
      ])) as { data: { user: User | null }; error: unknown };
      return result;
    } catch (e) {
      console.error('Middleware auth check failed or timed out:', e);
      return { data: { user: null } };
    }
  };

  // ── Public routes — never require auth ──
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/pricing',
    '/about',
    '/f/',        // Public forms
    '/s/',        // Short link redirects
    '/abuse',     // Account suspension page
    '/api/auth',
    '/api/newsletter',
    '/api/f/',
    '/api/forms/', // Public submission endpoint (rate-limited separately)
    '/api/cron/',
    '/api/webhooks/deliver',
    '/api/bulk/process',
    '/explore',
    '/marketplace',
    '/api/marketplace',
  ];

  // Essential paths that bypass maintenance mode even for non-admins (e.g., webhooks, cron, auth)
  const essentialPaths = [
    '/api/auth',
    '/api/cron/',
    '/api/webhooks/deliver',
    '/login',
    '/register',
    '/api/auth/callback',
  ];

  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p) || pathname === p);
  const isEssentialPath = essentialPaths.some((p) => pathname.startsWith(p) || pathname === p);

  // ── Protected routes — require auth ──
  const protectedPaths = [
    '/dashboard',
    '/qr-codes',
    '/create',
    '/forms',
    '/api-manager',
    '/settings',
    '/onboarding',
    '/developer',
  ];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // ── API routes (non-public) require auth via header or session ──
  const isApiRoute = pathname.startsWith('/api/') && !isPublicPath;

  // ── Auth routes — redirect to dashboard if already logged in ──
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.includes(pathname);

  // PERFORMANCE OPTIMIZATION: Skip Auth/DB checks for public routes if not strictly needed
  // This drastically improves TTFB for SEO and first-time visitors
  let user = null;
  let profile: { is_suspended: boolean; is_admin: boolean } | null = null;

  // We only fetch the user if it's a protected path, an API route, or an auth path (login/register)
  // We ALSO fetch it for the marketplace to decide on rewrites, and for / to show personalized content if available
  // BUT to maximize SEO, we should avoid it for / if the user is likely a bot or guest.
  // For now, let's only fetch if NOT a static public path that doesn't change based on auth.
  const needsAuthCheck = isProtectedPath || isApiRoute || isAuthPath || pathname === '/marketplace';

  if (needsAuthCheck) {
    const {
      data: { user: foundUser },
    } = await getUserWithTimeout();
    user = foundUser;

    if (user) {
      const { data } = await supabase
        .from('users')
        .select('is_suspended, is_admin')
        .eq('id', user.id)
        .single();
      profile = data;
    }
  }

  // ── High Security Nonce Generation ──
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || 'https://*.upstash.io';
  const workerUrl = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL || 'https://*.workers.dev';

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https: http:;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://*.supabase.co https://res.cloudinary.com https://*.googleusercontent.com;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src 'self' ${supabaseUrl} ${upstashUrl} ${workerUrl} https://*.supabase.co https://api.cloudinary.com https://res.cloudinary.com blob:;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    object-src 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  // Helper to apply security headers to any response
  const applySecurityHeaders = (res: NextResponse) => {
    res.headers.set('x-nonce', nonce);
    res.headers.set('Content-Security-Policy', cspHeader);
    return res;
  };

  // ── Public Marketplace Rewrite ──
  if (pathname === '/marketplace' && !user) {
    return applySecurityHeaders(NextResponse.rewrite(new URL('/explore', request.url)));
  }

  if (isProtectedPath && !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // ── Maintenance Enforcement ──
  if (isMaintenance && !isEssentialPath) {
    const isAdmin = !!profile?.is_admin;
    if (!isAdmin && pathname !== '/maintenance') {
      return applySecurityHeaders(NextResponse.redirect(new URL('/maintenance', request.url)));
    }
  }

  // ── Read-Only Enforcement ──
  const isWriteRequest = ['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method);
  if (isReadOnly && isWriteRequest && !isEssentialPath) {
    const response = new NextResponse(
      JSON.stringify({ error: 'Platform is in read-only mode for maintenance.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
    return applySecurityHeaders(response);
  }

  if (profile) {
    if (profile.is_suspended && pathname !== '/abuse') {
      return applySecurityHeaders(NextResponse.redirect(new URL('/abuse', request.url)));
    }
  }

  if (isAuthPath && user) {
    return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
  }

  // For protected API routes without a session, return 401
  if (isApiRoute && !user) {
    return applySecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  return applySecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
