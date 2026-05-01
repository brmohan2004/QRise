import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { typeTemplates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const typeId = searchParams.get('type_id');
  const slug = searchParams.get('slug');
  const secret = req.headers.get('x-internal-secret');

  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!typeId || !slug) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const template = await db
    .select({ templateHtml: typeTemplates.templateHtml })
    .from(typeTemplates)
    .where(
      and(
        eq(typeTemplates.typeId, typeId),
        eq(typeTemplates.slug, slug)
      )
    )
    .limit(1);

  if (!template[0]) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json({ template_html: template[0].templateHtml });
}
