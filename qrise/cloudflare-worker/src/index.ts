import { handleRedirect } from './redirect';
import { handleConsent, handleVerifyPassword, handleTrackAction } from './handlers';
import type { WorkerEnv } from './types';

const ASSET_CACHE_TTL = 60 * 60 * 24;

export default {
  async fetch(
    request: Request,
    env: WorkerEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Static Assets
    if (url.pathname.startsWith('/icons/')) {
      return handleStaticAsset(request, env, ctx);
    }

    // Well-Known
    if (url.pathname.startsWith('/.well-known/')) {
      return handleWellKnown(request);
    }

    // API Handlers
    if (url.pathname === '/api/consent') {
      return handleConsent(request, env);
    }

    if (url.pathname === '/api/verify-password') {
      return handleVerifyPassword(request, env);
    }

    if (url.pathname === '/api/track-action') {
      return handleTrackAction(request, env, ctx);
    }

    // Main Redirect Engine
    if (url.hostname.split('.')[0] !== 'app' && url.hostname.split('.')[0] !== 'www') {
      return handleRedirect(request, env, ctx);
    }

    // Catch-all
    return serveLandingPage(env);
  },
} satisfies ExportedHandler<WorkerEnv>;

async function handleWellKnown(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === '/.well-known/apple-app-site-association') {
    return new Response(JSON.stringify({ applinks: { apps: [], details: [] } }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response('Not Found', { status: 404 });
}

async function handleStaticAsset(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  const fileName = new URL(request.url).pathname.split('/').pop();
  if (!fileName) return new Response('Not Found', { status: 404 });

  const cached = await env.QR_KV.get(`asset:${fileName}`, { type: 'arrayBuffer' });
  if (cached) {
    return new Response(cached, {
      headers: { 
        'Content-Type': getMimeType(fileName),
        'Cache-Control': `public, max-age=${ASSET_CACHE_TTL}`
      }
    });
  }
  return new Response('Not Found', { status: 404 });
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', webp: 'image/webp'
  };
  return map[ext || ''] || 'application/octet-stream';
}

function serveLandingPage(env: WorkerEnv): Response {
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head><title>QRise</title></head>
      <body style="font-family:sans-serif; text-align:center; padding:50px;">
        <h1>QRise</h1>
        <p>Smart Dynamic QR Codes</p>
        <a href="${env.APP_URL}" style="color:#667eea; text-decoration:none;">Go to App</a>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}
