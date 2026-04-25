import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // IMPORTANT: This refreshes the session cookie on every request (updateSession pattern)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Public routes — never require auth ──
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/pricing',
    '/about',
    '/f/',        // Public forms
    '/s/',        // Short link redirects
    '/api/auth',
    '/api/newsletter',
    '/api/f/',
    '/api/forms/', // Public submission endpoint (rate-limited separately)
    '/api/cron/',
    '/api/webhooks/deliver',
    '/api/bulk/process',
  ];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p) || pathname === p);

  // ── Protected routes — require auth ──
  const protectedPaths = [
    '/dashboard',
    '/qr-codes',
    '/create',
    '/forms',
    '/api-manager',
    '/settings',
    '/onboarding',
  ];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // ── Auth routes — redirect to dashboard if already logged in ──
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.includes(pathname);

  // ── API routes (non-public) require auth via header or session ──
  const isApiRoute = pathname.startsWith('/api/') && !isPublicPath;

  if (isProtectedPath && !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
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
