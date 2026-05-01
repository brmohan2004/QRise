import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customQrTypes, users, qrCodes } from '@/lib/db/schema';
import { eq, desc, count, and } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'most_used';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('page') || '0') * limit;

  // Only public + verified types
  const types = await db
    .select({
      type: customQrTypes,
      user: users,
      qrCount: count(qrCodes.id),
    })
    .from(customQrTypes)
    .leftJoin(users, eq(customQrTypes.userId, users.id))
    .leftJoin(qrCodes, eq(customQrTypes.id, qrCodes.customTypeId))
    .where(
      and(
        eq(customQrTypes.isPublic, true),
        eq(customQrTypes.isVerified, true)
      )
    )
    .groupBy(customQrTypes.id, users.id)
    .orderBy(
      sort === 'newest' ? desc(customQrTypes.createdAt) : desc(count(qrCodes.id))
    )
    .limit(limit)
    .offset(offset);

  // Return sanitized fields
  const sanitized = types.map(t => ({
    id: t.type.id,
    slug: t.type.slug,
    name: t.type.name,
    description: t.type.description,
    icon_url: t.type.iconUrl,
    is_verified: t.type.isVerified,
    creator_username: t.user?.email?.split('@')[0] || 'Unknown',
    scan_count: Number(t.type.scanCount),
    qr_count: Number(t.qrCount || 0),
    fields_schema: t.type.fieldsSchema,
  }));

  return NextResponse.json({ types: sanitized });
}
