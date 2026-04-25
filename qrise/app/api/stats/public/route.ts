import { db } from '@/lib/db';
import { qrCodes } from '@/lib/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  // For caching, we'd use Redis here
  // For now, return estimated total
  return NextResponse.json({
    totalQRsCreated: 0,
  });
}