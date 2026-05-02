import { createHmac } from 'node:crypto';

interface ResolverContext {
  device_type: string;
  os: string;
  country: string;
  language: string;
  timestamp: string;
  qr_payload: any;
}

export async function executeResolver(
  resolverUrl: string,
  resolverSecret: string,
  timeoutMs: number,
  context: ResolverContext
): Promise<{ rendered_html?: string; redirect_url?: string; error?: string }> {
  try {
    const ts = Math.floor(Date.now() / 1000);
    const bodyStr = JSON.stringify({ scan_context: context });
    
    // Generate signature
    const hmac = createHmac('sha256', resolverSecret);
    hmac.update(`${ts}.${bodyStr}`);
    const signature = `t=${ts},v1=${hmac.digest('hex')}`;

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(resolverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-QRise-Signature': signature,
        'User-Agent': 'QRise-Resolver/1.0',
      },
      body: bodyStr,
      signal: controller.signal,
    });

    clearTimeout(t);

    if (!res.ok) {
      return { error: `Resolver returned ${res.status}` };
    }

    const data = await res.json();
    return {
      rendered_html: data.rendered_html,
      redirect_url: data.redirect_url,
    };
  } catch (err: any) {
    return { error: err.message || 'Resolver timeout or network error' };
  }
}
