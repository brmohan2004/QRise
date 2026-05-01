import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolverCalls, typeResolvers } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  const secret = request.headers.get('x-internal-secret');
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      resolver_id, 
      qr_id, 
      scan_context, 
      resolver_status, 
      resolver_latency_ms, 
      response_type, 
      fallback_used, 
      is_test 
    } = body;

    if (!resolver_id) {
      return NextResponse.json({ error: 'resolver_id required' }, { status: 400 });
    }

    // 1. Insert into resolver_calls
    await db.insert(resolverCalls).values({
      resolverId: resolver_id,
      qrId: qr_id,
      scanContext: scan_context,
      resolverStatus: resolver_status,
      resolverLatencyMs: resolver_latency_ms,
      responseType: response_type,
      fallbackUsed: fallback_used || false,
      isTest: is_test || false,
      calledAt: new Date(),
    });

    // 2. Update type_resolvers aggregates using atomic SQL increments
    // Only update aggregates if this is NOT a test call
    if (!is_test) {
      const isError = resolver_status && resolver_status >= 400 ? 1 : 0;
      const latency = resolver_latency_ms || 0;

      await db.update(typeResolvers)
        .set({
          totalCalls: sql`${typeResolvers.totalCalls} + 1`,
          totalErrors: sql`${typeResolvers.totalErrors} + ${isError}`,
          // Rolling average: (avg * count + new_val) / (count + 1)
          // Cast to bigint for arithmetic, then back to integer for storage
          avgLatencyMs: sql`CAST(ROUND((CAST(${typeResolvers.avgLatencyMs} AS bigint) * ${typeResolvers.totalCalls} + ${latency}) / (${typeResolvers.totalCalls} + 1)) AS integer)`,
          lastCalledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(typeResolvers.id, resolver_id));
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ResolverLog] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
