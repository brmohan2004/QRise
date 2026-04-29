import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { target, userId, qrId } = await request.json();

  try {
    if (target === 'all') {
      // Flush Cloudflare KV
      const cfResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE_ID}/bulk`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deleteAll: true }), // Note: Actual bulk delete API varies, this is a conceptual placeholder for production implementation
        }
      );
      
      // Flush all Redis
      await redis.flushdb();
    } else if (target === 'qr' && qrId) {
      await redis.del(`qr:${qrId}`);
      // Cloudflare specific key delete
      await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE_ID}/values/qr:${qrId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${process.env.CF_API_TOKEN}` },
        }
      );
    } else if (target === 'user' && userId) {
      // Scan and delete user keys in Redis
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, { match: `user:${userId}:*`, count: 100 });
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        cursor = nextCursor;
      } while (cursor !== '0');
    }

    await writeAuditLog({
      adminUserId: admin.adminId,
      action: 'infra.cache_flushed',
      targetType: 'system',
      targetId: 'cache',
      details: { target, userId, qrId },
      ipAddress: admin.ipAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cache flush error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    // Cloudflare usage stats (optional, depends on API access)
    let kvStats = { size: 'Unknown' };
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE_ID}`,
        {
          headers: { 'Authorization': `Bearer ${process.env.CF_API_TOKEN}` },
        }
      );
      const data = await res.json();
      kvStats.size = data.result?.size || 'Unknown';
    } catch {}

    const totalKeys = await redis.dbsize();

    return NextResponse.json({
      redis: {
        used_memory: 'Managed (Upstash)',
        total_keys: totalKeys,
        hit_rate: 'N/A',
      },
      kv: kvStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
