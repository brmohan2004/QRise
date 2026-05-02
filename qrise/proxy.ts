import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

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
      const result = await Promise.race([
        supabase.auth.getUser(),
        timeout
      ]) as { data: { user: any } };
      return result;
    } catch (e) {
      console.error('Middleware auth check failed or timed out:', e);
      return { data: { user: null } };
    }
  };

  const {
    data: { user },
  } = await getUserWithTimeout();

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

  // ── Auth routes — redirect to dashboard if already logged in ──
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.includes(pathname);

  // ── API routes (non-public) require auth via header or session ──
  const isApiRoute = pathname.startsWith('/api/') && !isPublicPath;

  // ── Public Marketplace Rewrite ──
  // If guest visits /marketplace, show them the marketing page (/explore)
  if (pathname === '/marketplace' && !user) {
    return NextResponse.rewrite(new URL('/explore', request.url));
  }

  if (isProtectedPath && !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  let profile: { is_suspended: boolean; is_admin: boolean } | null = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('is_suspended, is_admin')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  // ── Maintenance Enforcement ──
  if (isMaintenance && !isEssentialPath) {
    const isAdmin = !!profile?.is_admin;
    if (!isAdmin && pathname !== '/maintenance') {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  // ── Read-Only Enforcement ──
  const isWriteRequest = ['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method);
  if (isReadOnly && isWriteRequest && !isEssentialPath) {
    return new NextResponse(
      JSON.stringify({ error: 'Platform is in read-only mode for maintenance.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (profile) {
    if (profile.is_suspended && pathname !== '/abuse') {
      return NextResponse.redirect(new URL('/abuse', request.url));
    }
  }



  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For protected API routes without a session, return 401
  if (isApiRoute && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
