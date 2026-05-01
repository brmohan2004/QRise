import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  // Priority: Cloudflare header -> X-Forwarded-For -> remote address
  const ip = cfConnectingIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1');

  return NextResponse.json({ ip });
}
