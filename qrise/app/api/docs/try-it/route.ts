import { NextRequest, NextResponse } from 'next/server'
import { rateLimitByIP } from '@/lib/redis'

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE']
const ALLOWED_PATHS = ['/qr', '/bulk', '/forms', '/webhooks']

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 calls per IP per minute
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const { success } = await rateLimitByIP(ip, "try-it", 10, "1 m")
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in a minute.' },
        { status: 429 }
      )
    }

    const { method, path, headers, body, apiKey } = await req.json()

    if (!ALLOWED_METHODS.includes(method)) {
      return NextResponse.json(
        { error: 'Invalid method. Allowed: GET, POST, PUT, DELETE' },
        { status: 400 }
      )
    }

    const hasAllowedPath = ALLOWED_PATHS.some(p => path.startsWith(p))
    if (!hasAllowedPath) {
      return NextResponse.json(
        { error: 'Invalid path. Allowed: /qr, /bulk, /forms, /webhooks' },
        { status: 400 }
      )
    }

    if (apiKey === process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 400 }
      )
    }

    const targetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api${path}`

    const startTime = Date.now()
    const response = await fetch(targetUrl, {
      method,
      headers: {
        ...headers,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const durationMs = Date.now() - startTime

    let responseBody;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    const responseData = {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      durationMs: durationMs,
    };

    if (response.ok) {
      return NextResponse.json({ success: true, data: responseData });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: responseBody?.error || 'Request failed',
          data: responseData 
        },
        { status: response.status < 400 ? 400 : response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}