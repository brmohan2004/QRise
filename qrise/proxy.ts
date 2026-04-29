import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

export async function proxy(request: NextRequest) {
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
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const isMaintenance = await redis.get('maintenance_mode');
  const { pathname } = request.nextUrl;

  // IMPORTANT: This refreshes the session cookie on every request (updateSession pattern)
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  let profile: any = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('is_suspended, is_admin')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  // ── Maintenance Enforcement ──
  if (isMaintenance === 'true' && !isEssentialPath) {
    const isAdmin = !!profile?.is_admin;

    if (!isAdmin) {
      // Return a premium maintenance page
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>System Maintenance | QRise</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #000; color: #fff; }
                .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
                .gradient-text { background: linear-gradient(135deg, #fff 0%, #666 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            </style>
        </head>
        <body class="flex items-center justify-center min-h-screen p-6 overflow-hidden text-center">
            <div class="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,#111_0%,#000_100%)]"></div>
            <div class="relative z-10 max-w-lg w-full">
                <div class="mb-8 flex justify-center">
                    <div class="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 animate-pulse">
                        <svg class="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>
                <h1 class="text-4xl font-extrabold mb-4 gradient-text">System Evolution</h1>
                <p class="text-gray-400 text-lg mb-8 leading-relaxed">
                    QRise is currently undergoing scheduled maintenance to enhance our infrastructure. We'll be back shortly with a faster, more secure experience.
                </p>
                <div class="glass p-1 rounded-2xl inline-flex items-center gap-3 pr-4 mb-8">
                    <span class="flex h-2 w-2 rounded-full bg-emerald-500 ml-2"></span>
                    <span class="text-xs font-bold uppercase tracking-widest text-emerald-500">Engineers On-Site</span>
                </div>
                <div class="pt-8 border-t border-white/5">
                    <p class="text-gray-600 text-sm italic">"Precision takes time. Excellence is worth the wait."</p>
                </div>
            </div>
        </body>
        </html>
        `,
        { status: 503, headers: { 'content-type': 'text/html' } }
      );
    }
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
