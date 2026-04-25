import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFormById } from "@/lib/services/form.service";
import { updateQR, deleteQR } from "@/lib/services/qr.service";
import { db } from "@/lib/db";
import { forms, formSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await getFormById(id);
    if (!form || form.userId !== user.id || form.isDeleted) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    return NextResponse.json({ error: ApiResponse.getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await getFormById(id);
    if (!existing || existing.userId !== user.id || existing.isDeleted) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, fields, successMessage, isActive } = body;

    const result = await db.update(forms)
      .set({
        name,
        fieldsSchema: fields || undefined,
        successMessage,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(forms.id, id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: ApiResponse.getErrorMessage(error) }, { status: 500 });
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

    const existing = await getFormById(id);
    if (!existing || existing.userId !== user.id || existing.isDeleted) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // 1. Soft delete the form
    await db.update(forms)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(forms.id, id));

    // 2. Soft delete the linked QR (following QR service pattern)
    if (existing.qrId) {
      await deleteQR(existing.qrId, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: ApiResponse.getErrorMessage(error) }, { status: 500 });
  }
}
