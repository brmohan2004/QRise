import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, qrCodes, forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { confirmEmail, confirm } = body;

    if (!confirm || confirmEmail !== user.email) {
      return NextResponse.json({ error: "Confirmation failed. Email does not match." }, { status: 400 });
    }

    // 1. Soft delete user datasets
    await db.update(qrCodes).set({ isActive: false }).where(eq(qrCodes.userId, user.id));
    await db.update(forms).set({ isActive: false }).where(eq(forms.userId, user.id));

    // 2. Mark user as deleted
    await db.update(users).set({ 
      fullName: "Deleted User", 
      email: `deleted_${user.id}@qrise.invalid`,
      updatedAt: new Date()
    }).where(eq(users.id, user.id));

    // 3. Sign out of Supabase Auth (User should handle this on client side too)
    await supabase.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
