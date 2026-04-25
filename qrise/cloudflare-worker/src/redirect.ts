import { getConsentFromCookie } from './consent';
import { hashIP, checkUniqueness, logScanEvent } from './analytics-logger';
import { isBotUA, parseDevice } from './bot-filter';
import { checkRateLimit } from './rate-limiter';
import type { WorkerEnv, ResolvedQR, RequestContext } from './types';
import { buildPasswordPage } from './pages/password-page';
import { buildActionMenuPage } from './pages/action-menu';
import { buildNotFoundPage } from './pages/not-found';

export async function handleRedirect(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  const shortCode = new URL(request.url).hostname.split('.')[0];

  if (!(await checkRateLimit(env.QR_KV, shortCode, 100, 60)).allowed) {
    return new Response('Too many requests.', { status: 429, headers: { 'Retry-After': '60' } });
  }

  const qr = await resolveQR(shortCode, env);
  if (!qr || !qr.isActive) {
    return new Response(buildNotFoundPage({ shortCode, appUrl: env.APP_URL }), { headers: { 'Content-Type': 'text/html' } });
  }

  if (qr.passwordHash) {
    return new Response(buildPasswordPage({ qrId: qr.qrId, shortCode, label: qr.label, appUrl: env.APP_URL }), { headers: { 'Content-Type': 'text/html' } });
  }

  if (qr.actions?.length) {
    return new Response(buildActionMenuPage({ qrId: qr.qrId, actions: qr.actions, title: qr.label || 'Select', appUrl: env.APP_URL }), { headers: { 'Content-Type': 'text/html' } });
  }

  const device = parseDevice(request.headers.get('User-Agent') || '');
  const context: RequestContext = { device: device.type as any, os: device.os, browser: device.browser, country: (request.cf?.country as string) || 'unknown', hour: new Date().getHours(), language: 'en' };
  
  const targetUrl = evaluateRules(qr.routingRules, context) || qr.targetUrl;
  const consent = getConsentFromCookie(request.headers.get('Cookie'));
  
  if (consent?.preferences.analytics) {
    const ipHash = await hashIP(request.headers.get('CF-Connecting-IP') || '0.0.0.0');
    ctx.waitUntil(logScanEvent({ qrId: qr.qrId, ipHash, country: context.country, city: request.cf?.city as string, deviceType: device.type, os: device.os, browser: device.browser, isBot: isBotUA(request.headers.get('User-Agent') || ''), isUnique: await checkUniqueness(env.QR_KV, qr.qrId, ipHash, request.headers.get('User-Agent') || '') }, env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY));
  }

  return Response.redirect(targetUrl, 302);
}

async function resolveQR(shortCode: string, env: WorkerEnv): Promise<ResolvedQR | null> {
  const cached = await env.QR_KV.get(`qr:${shortCode}`);
  if (cached) return JSON.parse(cached as string);

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/qr_codes?short_code=eq.${shortCode}&select=*`, { headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}` } });
  const rows = await res.json() as any[];
  if (!rows.length) return null;

  const qr = rows[0];
  const resolved: ResolvedQR = { qrId: qr.id, type: qr.type, targetUrl: qr.target_url, isActive: qr.is_active, passwordHash: qr.password_hash, actions: qr.actions, label: qr.label, routingRules: qr.routing_rules };
  await env.QR_KV.put(`qr:${shortCode}`, JSON.stringify(resolved), { expirationTtl: 60 });
  return resolved;
}

function evaluateRules(rules: ResolvedQR['routingRules'], ctx: RequestContext): string | null {
  if (!rules) return null;
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);
  for (const rule of sorted) {
    if (rule.conditions.every(c => matchCondition(c, ctx))) return rule.targetUrl;
  }
  return null;
}

function matchCondition(c: { field: string; op: string; value: any }, ctx: RequestContext): boolean {
  const v = ctx[c.field as keyof RequestContext];
  return c.op === 'eq' ? v === c.value : c.op === 'in' ? Array.isArray(c.value) && c.value.includes(v) : false;
}