import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { typeMarketplaceSubmissions, customQrTypes, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const submissions = await db
    .select({
      submission: typeMarketplaceSubmissions,
      typeSlug: customQrTypes.slug,
      typeName: customQrTypes.name,
      userEmail: users.email,
    })
    .from(typeMarketplaceSubmissions)
    .innerJoin(customQrTypes, eq(typeMarketplaceSubmissions.typeId, customQrTypes.id))
    .innerJoin(users, eq(typeMarketplaceSubmissions.userId, users.id))
    .orderBy(desc(typeMarketplaceSubmissions.createdAt));

  return NextResponse.json({ submissions });
}

async function isAdmin(userId: string): Promise<boolean> {
  return true;
}

