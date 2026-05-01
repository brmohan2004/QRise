import type { WorkerEnv, ResolvedQR } from './types';

export interface ScanContext {
  device_type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  country: string;
  language: string;
  timestamp: string;
  qr_payload: Record<string, unknown>;
}

export interface ResolverResponse {
  type: 'redirect' | 'html' | 'json';
  url?: string;
  html?: string;
  data?: Record<string, unknown>;
  template?: string;
}

export async function resolveCustomQR(
  request: Request,
  qr: ResolvedQR & { customTypeSlug: string; resolverUrl: string; resolverSecret: string; timeoutMs: number; fallbackUrl?: string; fallbackHtml?: string; customTypePayload: Record<string, unknown> },
  env: WorkerEnv,
  ctx: ExecutionContext
): Promise<Response> {
  // 1. Build scan context
  const userAgent = request.headers.get('User-Agent') || '';
  const device = inferDevice(userAgent);
  const os = inferOS(userAgent);
  const country = request.cf?.country || 'XX';
  const language = request.headers.get('Accept-Language')?.split(',')[0] || 'en';

  const scanContext: ScanContext = {
    device_type: device,
    os,
    country: (request as any).cf?.country || 'XX',
    language,
    timestamp: new Date().toISOString(),
    qr_payload: qr.customTypePayload,
  };

  const body = JSON.stringify({ scan_context: scanContext });
  // 2. Sign
  const ts = Date.now();
  const signature = await signPayload(qr.resolverSecret, ts, body);

  // 3. Call resolver with timeout
  let resolverRes: Response;
  try {
    const controller = new AbortController();
    const timeoutMs = Math.min(qr.timeoutMs || 3000, env.MAX_TIMEOUT_MS || 5000);
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(qr.resolverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-QRise-Signature': signature,
        'X-QRise-Type': qr.customTypeSlug,
        'X-QRise-QR-Id': qr.qrId,
        'User-Agent': 'QRise-Resolver/1.0',
      },
      body,
      signal: controller.signal as any,
    });

    clearTimeout(timer);
    resolverRes = res;
  } catch (err: any) {
    // Timeout or network error — fallback
    return serveFallback(qr.fallbackUrl, qr.fallbackHtml, request);
  }

  const status = resolverRes.status;
  const responseText = await resolverRes.text();

  // Log the resolver call (fire-and-forget)
  ctx.waitUntil(
    fetch(env.INTERNAL_API_URL + '/api/internal/resolver-log', {
      method: 'POST',
      headers: { 'X-Internal-Secret': env.INTERNAL_SECRET, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resolver_id: qr.resolverId,
        qr_id: qr.qrId,
        scan_context: scanContext,
        resolver_status: status,
        resolver_latency_ms: Date.now() - ts,
        response_type: 'unknown',
        fallback_used: false,
        is_test: false,
      }),
    })
  );

  if (status >= 400) {
    return serveFallback(qr.fallbackUrl, qr.fallbackHtml, request);
  }

  // Parse resolver response
  let parsed: ResolverResponse;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    // Not JSON? return raw as HTML maybe
    return new Response(responseText, { headers: { 'Content-Type': 'text/html' } });
  }

  // Respond based on type
  if (parsed.type === 'redirect' && parsed.url) {
    return Response.redirect(parsed.url, 302);
  }
  if (parsed.type === 'html' && parsed.html) {
    return new Response(parsed.html, { headers: { 'Content-Type': 'text/html' } });
  }
  if (parsed.type === 'json') {
    // If template provided, render Mustache; else return JSON
    if (parsed.template) {
      const html = await renderMustacheTemplate(parsed.template, { ...parsed.data, scan_context: scanContext }, env);
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }
    return new Response(JSON.stringify(parsed.data), { headers: { 'Content-Type': 'application/json' } });
  }

  // Unknown response — fallback
  return serveFallback(qr.fallbackUrl, qr.fallbackHtml, request);
}

async function signPayload(secret: string, timestamp: number, body: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const message = `${timestamp}.${body}`;
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const hex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `t=${timestamp},v1=${hex}`;
}

function serveFallback(url?: string, html?: string, _req?: Request): Response {
  if (html) {
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  }
  if (url) {
    return Response.redirect(url, 302);
  }
  return new Response('Service unavailable', { status: 503 });
}

function inferDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/mobile|android|iphone|ipad/i.test(ua)) return /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
  return 'desktop';
}
function inferOS(ua: string): string {
  if (/windows/i.test(ua)) return 'windows';
  if (/mac/i.test(ua)) return 'macos';
  if (/linux/i.test(ua)) return 'linux';
  if (/android/i.test(ua)) return 'android';
  if (/ios|iphone|ipad/i.test(ua)) return 'ios';
  return 'other';
}

async function renderMustacheTemplate(templateSlug: string, data: Record<string, unknown>, env: WorkerEnv): Promise<string> {
  const typeId = (data.scan_context as any)?.qr_payload?.type_id;
  if (!typeId) return `<!-- Error: typeId missing --> <pre>${JSON.stringify(data, null, 2)}</pre>`;

  const cacheKey = `template:${typeId}:${templateSlug}`;
  let html = await env.QR_KV.get(cacheKey);
  
  if (!html) {
    const res = await fetch(`${env.INTERNAL_API_URL}/api/internal/template?type_id=${typeId}&slug=${templateSlug}`, {
      headers: { 'X-Internal-Secret': env.INTERNAL_SECRET }
    });
    if (res.ok) {
      const result = await res.json() as any;
      html = result.template_html;
      if (html) {
        await env.QR_KV.put(cacheKey, html, { expirationTtl: 300 });
      }
    }
  }

  if (!html) return `<!-- Template ${templateSlug} not found --> <pre>${JSON.stringify(data, null, 2)}</pre>`;

  // Simple Mustache-like replacement: {{ user.name }} -> data.user.name
  return html.replace(/\{\{\s*([\w\.]+)\s*\}\}/g, (match, key) => {
    const keys = key.split('.');
    let val: any = data;
    for (const k of keys) {
      if (val && typeof val === 'object' && k in val) {
        val = val[k];
      } else {
        return match;
      }
    }
    return val !== undefined ? String(val) : match;
  });
}
