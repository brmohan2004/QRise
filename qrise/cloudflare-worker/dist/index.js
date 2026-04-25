import { buildPasswordPage } from './pages/password-page';
import { buildActionMenuPage } from './pages/action-menu';
import { buildNotFoundPage } from './pages/not-found';
import { buildErrorPage } from './pages/error-page';
import { setConsentCookie } from './consent';
import { hashIP, checkUniqueness, logScanEvent } from './analytics-logger';
import { isBotUA, parseDevice } from './bot-filter';
import { checkRateLimit } from './rate-limiter';
const ASSET_CACHE_TTL = 60 * 60 * 24;
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        if (url.pathname.startsWith('/.well-known/')) {
            return handleWellKnown(request, env);
        }
        if (url.pathname.startsWith('/icons/')) {
            return handleStaticAsset(request, env, ctx);
        }
        if (url.pathname === '/api/track-action') {
            return handleTrackAction(request, env, ctx);
        }
        if (url.pathname === '/api/verify-password') {
            return handleVerifyPassword(request, env);
        }
        if (url.pathname === '/api/consent') {
            return handleConsent(request, env);
        }
        if (url.pathname === '/api/analytics/ping') {
            return new Response('OK', { status: 200 });
        }
        if (url.pathname.startsWith('/api/')) {
            return new Response('Not Found', { status: 404 });
        }
        return handleRedirect(request, env, ctx);
    },
};
async function handleWellKnown(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/.well-known/apple-app-site-association') {
        return new Response(JSON.stringify({
            applinks: { apps: [], details: [] },
            webcredentials: { apps: ['TEAMID.com.qrise.app'] },
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    }
    if (url.pathname === '/.well-known/assetlinks.json') {
        return new Response(JSON.stringify([{
                relation: ['delegate_permission/common.handle_all_urls'],
                target: {
                    namespace: 'android_app',
                    package_name: 'com.qrise.app',
                    sha256_cert_fingerprints: ['YOUR_CERT_FINGERPRINT'],
                },
            }]), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    }
    return new Response('Not Found', { status: 404 });
}
async function handleStaticAsset(request, env, ctx) {
    const url = new URL(request.url);
    const fileName = url.pathname.split('/').pop();
    if (!fileName)
        return new Response('Not Found', { status: 404 });
    const assetKey = `assets/${fileName}`;
    const cache = await env.QR_KV.getWithMetadata(assetKey);
    if (cache && cache.value) {
        const meta = cache.metadata;
        const headers = {
            'Content-Type': getMimeType(fileName),
            'Cache-Control': `public, max-age=${ASSET_CACHE_TTL}`,
            'ETag': meta?.customKey || '',
        };
        if (request.headers.get('If-None-Match') === meta?.customKey) {
            return new Response(null, { status: 304, headers });
        }
        return new Response(cache.value, { headers });
    }
    return new Response('Not Found', { status: 404 });
}
async function handleRedirect(request, env, ctx) {
    const url = new URL(request.url);
    const shortCode = url.hostname.split('.')[0];
    if (!shortCode || shortCode === 'www' || shortCode === 'app') {
        return serveLandingPage(env);
    }
    const rateLimit = await checkRateLimit(env.QR_KV, shortCode, 100, 60);
    if (!rateLimit.allowed) {
        return rateLimitedResponse();
    }
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    const ipHash = await hashIP(ip);
    const ua = request.headers.get('User-Agent') || '';
    const isBot = isBotUA(ua);
    const device = parseDevice(ua);
    const qr = await resolveQR(shortCode, env);
    if (!qr || !qr.isActive) {
        return notFoundResponse(shortCode, env);
    }
    if (qr.passwordHash) {
        return passwordProtectedResponse(qr, shortCode, env);
    }
    if (qr.actions && qr.actions.length > 0) {
        return actionMenuResponse(qr, env);
    }
    const context = {
        device: device.type,
        os: device.os,
        browser: device.browser,
        country: request.cf?.country || 'unknown',
        hour: new Date().getHours(),
    };
    const finalUrl = evaluateRedirect(qr, context) || qr.targetUrl;
    ctx.waitUntil(logScanEvent({
        qrId: qr.qrId,
        ipHash,
        country: request.cf?.country || 'unknown',
        city: request.cf?.city,
        deviceType: device.type,
        os: device.os,
        browser: device.browser,
        isBot,
        isUnique: await checkUniqueness(env.QR_KV, qr.qrId, ipHash, ua.slice(0, 128)),
        matchedRuleId: getMatchedRuleId(qr, context),
    }, env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY));
    return Response.redirect(finalUrl, 302);
}
async function handleTrackAction(request, env, ctx) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
        return new Response('Invalid request', { status: 400 });
    }
    const data = body;
    if (!data.qrId || !data.actionId) {
        return new Response('Invalid request', { status: 400 });
    }
    ctx.waitUntil(logScanEvent({
        qrId: data.qrId,
        matchedRuleId: data.actionId,
        isBot: false,
        isUnique: false,
    }, env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY));
    return new Response('OK', { status: 200 });
}
async function handleVerifyPassword(request, env) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
        return new Response('Invalid request', { status: 400 });
    }
    const data = body;
    if (!data.password || !data.qrId) {
        return new Response('Invalid request', { status: 400 });
    }
    const pwdHash = await hashString(data.password);
    const storedHash = await getPasswordHash(data.qrId, env);
    if (storedHash && pwdHash === storedHash) {
        const sessionToken = generateSessionToken(data.qrId);
        const cookie = `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax`;
        return new Response(JSON.stringify({
            valid: true,
            redirectUrl: '/',
            sessionToken,
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookie,
            },
        });
    }
    return new Response(JSON.stringify({ valid: false }), { headers: { 'Content-Type': 'application/json' } });
}
async function handleConsent(request, env) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
        return new Response('Invalid request', { status: 400 });
    }
    const data = body;
    const prefs = {
        analytics: data.preferences?.analytics ?? false,
        functional: data.preferences?.functional ?? true,
        marketing: data.preferences?.marketing ?? false,
    };
    const cookie = setConsentCookie(prefs);
    return new Response('OK', {
        headers: { 'Set-Cookie': cookie },
    });
}
function serveLandingPage(env) {
    return new Response(buildLandingPage(env.APP_URL), {
        headers: { 'Content-Type': 'text/html' },
    });
}
function passwordProtectedResponse(qr, shortCode, env) {
    return new Response(buildPasswordPage({
        qrId: qr.qrId,
        shortCode,
        label: qr.label,
        appUrl: env.APP_URL,
    }), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
function actionMenuResponse(qr, env) {
    const actions = (qr.actions || []).map(a => ({
        id: a.id,
        label: a.label,
        actionType: a.actionType,
        actionValue: a.actionValue,
        icon: a.icon || '',
        displayOrder: a.displayOrder,
    }));
    return new Response(buildActionMenuPage({
        qrId: qr.qrId,
        actions,
        title: qr.label || 'Select an Option',
        appUrl: env.APP_URL,
    }), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
function notFoundResponse(shortCode, env) {
    return new Response(buildNotFoundPage({
        shortCode,
        appUrl: env.APP_URL,
    }), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
function rateLimitedResponse() {
    return new Response('Too many requests. Please try again later.', {
        status: 429,
        headers: {
            'Content-Type': 'text/plain',
            'Retry-After': '60',
        },
    });
}
function errorResponse(message, shortCode, env) {
    return new Response(buildErrorPage({
        statusCode: 500,
        message,
        shortCode,
        appUrl: env.APP_URL,
    }), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
async function resolveQR(shortCode, env) {
    const cached = await env.QR_KV.get(`qr:${shortCode}`);
    if (cached)
        return JSON.parse(cached);
    try {
        const endpoint = `${env.SUPABASE_URL}/rest/v1/qr_codes?short_code=eq.${shortCode}&select=*`;
        const res = await fetch(endpoint, {
            headers: {
                'apikey': env.SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            },
        });
        if (!res.ok)
            return null;
        const rows = await res.json();
        if (!rows.length)
            return null;
        const qr = rows[0];
        const resolved = {
            qrId: qr.id,
            type: qr.type,
            targetUrl: qr.target_url,
            isActive: qr.is_active,
            passwordHash: qr.password_hash,
            actions: (qr.actions || []),
            label: qr.label,
            routingRules: (qr.routing_rules || []),
        };
        await env.QR_KV.put(`qr:${shortCode}`, JSON.stringify(resolved), {
            expirationTtl: 60,
        });
        return resolved;
    }
    catch (err) {
        console.error('DB fetch error:', err);
        return null;
    }
}
async function getPasswordHash(qrId, env) {
    const endpoint = `${env.SUPABASE_URL}/rest/v1/qr_codes?id=eq.${qrId}&select=password_hash`;
    const res = await fetch(endpoint, {
        headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        },
    });
    if (!res.ok)
        return null;
    const rows = await res.json();
    const row = rows[0];
    return row?.password_hash || null;
}
async function hashString(str) {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
function generateSessionToken(qrId) {
    const payload = `qr:${qrId}:${Date.now()}:${Math.random().toString(36).substring(2)}`;
    return btoa(payload).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
}
function evaluateRedirect(qr, context) {
    if (!qr.routingRules)
        return null;
    const sorted = [...qr.routingRules].sort((a, b) => a.priority - b.priority);
    for (const rule of sorted) {
        let allMatch = true;
        for (const condition of rule.conditions) {
            if (!evaluateCondition(condition, context)) {
                allMatch = false;
                break;
            }
        }
        if (allMatch)
            return rule.targetUrl;
    }
    return null;
}
function evaluateCondition(condition, ctx) {
    const value = ctx[condition.field];
    if (condition.op === 'eq')
        return value === condition.value;
    if (condition.op === 'in' && Array.isArray(condition.value)) {
        return condition.value.includes(value);
    }
    return false;
}
function getMatchedRuleId(qr, ctx) {
    if (!qr.routingRules)
        return undefined;
    const sorted = [...qr.routingRules].sort((a, b) => a.priority - b.priority);
    for (const rule of sorted) {
        let allMatch = true;
        for (const condition of rule.conditions) {
            if (!evaluateCondition(condition, ctx)) {
                allMatch = false;
                break;
            }
        }
        if (allMatch)
            return rule.id;
    }
    return undefined;
}
function getMimeType(filename) {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const map = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
        webp: 'image/webp',
        html: 'text/html',
        css: 'text/css',
        js: 'application/javascript',
        json: 'application/json',
    };
    return map[ext || ''] || 'application/octet-stream';
}
function buildLandingPage(appUrl) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QRise - Smart QR Codes</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .hero {
      background: white;
      border-radius: 16px;
      padding: 60px 40px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    h1 {
      font-size: 48px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    p {
      font-size: 18px;
      color: #666;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    .beta {
      display: inline-block;
      background: #f0f0f0;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #666;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="beta">BETA</div>
    <h1>QRise</h1>
    <p>Smart QR codes that adapt to your users.<br>Scan a QR code to get started.</p>
  </div>
</body>
</html>`;
}
//# sourceMappingURL=index.js.map