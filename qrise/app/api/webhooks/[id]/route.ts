import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { webhooks, webhookDeliveries } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const webhook = await db.select().from(webhooks)
      .where(and(eq(webhooks.id, id), eq(webhooks.userId, user.id)))
      .limit(1);

    if (!webhook[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const logs = await db.select().from(webhookDeliveries)
      .where(eq(webhookDeliveries.webhookId, id))
      .orderBy(desc(webhookDeliveries.deliveredAt))
      .limit(10);

    return NextResponse.json({ ...webhook[0], deliveries: logs });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isActive } = await request.json();

    const result = await db.update(webhooks)
      .set({ isActive })
      .where(and(eq(webhooks.id, id), eq(webhooks.userId, user.id)))
      .returning();

    if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await db.delete(webhooks)
      .where(and(eq(webhooks.id, id), eq(webhooks.userId, user.id)))
      .returning();

    if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
