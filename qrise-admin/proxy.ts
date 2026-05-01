import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import * as jose from "jose";
import { User } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  let user = supabaseUser as User | null;

  // Check for .env admin session regardless of Supabase session
  const adminToken = request.cookies.get('admin_session')?.value;
  if (adminToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(adminToken, secret);
      if (payload.is_admin && payload.email === process.env.ADMIN_EMAIL) {
        // If we have a valid admin token, use it (it takes precedence for the admin panel)
        user = {
          id: payload.id as string,
          email: payload.email as string,
          app_metadata: { is_admin: true },
          user_metadata: { is_admin: true },
          last_sign_in_at: new Date().toISOString(),
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User;
      }
    } catch {
      // Invalid token, fall back to supabaseUser if it exists
    }
  }

  // 1. Allow public routes
  const publicRoutes = ["/login", "/api/auth/callback"];
  if (publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return response;
  }

  // 2. Redirect to login if no user
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Verify Admin Status
  const isAdminMetadata = user.app_metadata?.is_admin || user.user_metadata?.is_admin;
  const allowList = process.env.ADMIN_EMAIL_ALLOWLIST?.split(",") || [];
  const isEmailAllowed = allowList.includes(user.email || "") || user.email === process.env.ADMIN_EMAIL;

  let isDbAdmin = false;
  if (!isAdminMetadata) {
    const { createClient: createAdminSupabase } = await import('@supabase/supabase-js');
    const adminClient = createAdminSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: userProfile } = await adminClient
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    isDbAdmin = !!userProfile?.is_admin;
  }

  const isAdmin = isAdminMetadata || isDbAdmin;

  if (!isAdmin || !isEmailAllowed) {
    return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
  }

  // 4. Session timeout check (8 hours)
  const authTime = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
  const now = Date.now();
  const eightHours = 8 * 60 * 60 * 1000;
  
  if (now - authTime > eightHours) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=session_expired", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
