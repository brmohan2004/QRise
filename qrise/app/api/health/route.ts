import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const checks = await Promise.allSettled([
      db.execute(sql`SELECT 1 as is_alive`),
      redis.ping(),
    ]);

    const isDbAlive = checks[0].status === 'fulfilled';
    const isRedisAlive = checks[1].status === 'fulfilled';

    if (!isDbAlive || !isRedisAlive) {
      return NextResponse.json(
        {
          status: 'degraded',
          db: isDbAlive ? 'ok' : 'error',
          redis: isRedisAlive ? 'ok' : 'error',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'ok',
        db: 'ok',
        redis: 'ok',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
