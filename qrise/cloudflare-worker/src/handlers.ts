import { setConsentCookie } from './consent';
import { logScanEvent } from './analytics-logger';
import type { WorkerEnv } from './types';

export async function handleConsent(request: Request, env: WorkerEnv): Promise<Response> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return new Response('Invalid request', { status: 400 });
  }
  const data = body as { preferences?: Partial<{ analytics: boolean; functional: boolean; marketing: boolean }> };

  const prefs = {
    analytics: data.preferences?.analytics ?? false,
    functional: data.preferences?.functional ?? true,
    marketing: data.preferences?.marketing ?? false,
  };

  const cookie = setConsentCookie(prefs);
  return new Response('OK', {
    headers: { 
      'Set-Cookie': cookie,
      'Content-Type': 'text/plain' 
    },
  });
}

export async function handleVerifyPassword(request: Request, env: WorkerEnv): Promise<Response> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return new Response('Invalid request', { status: 400 });
  }
  const data = body as { password?: string; qrId?: string };
  if (!data.password || !data.qrId) {
    return new Response('Invalid request', { status: 400 });
  }

  // Use a secure hash comparison (constant-time)
  const pwdHash = await hashString(data.password);
  
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/qr_codes?id=eq.${data.qrId}&select=password_hash`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });

  if (!res.ok) return new Response('Server Error', { status: 500 });
  const rows = await res.json() as any[];
  const storedHash = rows[0]?.password_hash;

  if (storedHash && constantTimeCompare(pwdHash, storedHash)) {
    const sessionToken = crypto.randomUUID();
    const cookie = `qr_session_${data.qrId}=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`;
    return new Response(JSON.stringify({ valid: true, sessionToken }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  }

  return new Response(JSON.stringify({ valid: false }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function handleTrackAction(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return new Response('Bad Request', { status: 400 });
  
  const data = body as { qrId: string; actionId: string };
  
  ctx.waitUntil(
    logScanEvent({
      qrId: data.qrId,
      matchedRuleId: data.actionId,
      isBot: false,
      isUnique: false,
    }, env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
  );

  return new Response('OK', { status: 200 });
}

async function hashString(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
