import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { qrCodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateQRBuffer } from "@/lib/qr-generator";
import { ApiResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 🔒 SECURITY: Ownership check — user can only fetch their own QR thumbnails
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const qr = await db.select().from(qrCodes)
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, user.id)))
      .limit(1);

    if (!qr[0]) {
      return NextResponse.json({ error: "QR code not found or access denied" }, { status: 404 });
    }

    // Generate QR thumbnail
    const design = qr[0].designConfig || {};
    const shortCode = qr[0].shortCode;

    const buffer = await generateQRBuffer({
      data: `${process.env.NEXT_PUBLIC_APP_URL}/r/${shortCode}`,
      size: 200,
      ...design,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: ApiResponse.getErrorMessage(error) }, { status: 500 });
  }
}
