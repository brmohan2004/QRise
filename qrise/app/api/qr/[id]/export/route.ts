import { NextResponse } from "next/server";
import { generateQRBuffer, generateQRSVG } from "@/lib/qr-generator";
import { ApiResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { qrCodes } from "@/lib/db/schema/qr-codes";
import { eq, and } from "drizzle-orm";
import { uploadQRExport } from "@/lib/cloudinary";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "png";
    const dpi = parseInt(searchParams.get("dpi") || "72");
    const download = searchParams.get("download") === "true";

    const qr = await db.query.qrCodes.findFirst({
      where: and(eq(qrCodes.id, id), eq(qrCodes.userId, user.id)),
    });
    if (!qr) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const targetUrl = `https://qr.ise/r/${qr.shortCode}`;

    let buffer: Buffer;
    if (format === "svg") {
      const svg = await generateQRSVG({
        data: targetUrl,
        ...(qr.designConfig as object),
      });
      buffer = Buffer.from(svg);
    } else {
      buffer = await generateQRBuffer({
        data: targetUrl,
        size: dpi === 300 ? 1200 : 400,
        ...(qr.designConfig as object),
      });
    }

    const { url } = await uploadQRExport(buffer, id, format as 'png' | 'svg', user.id);

    let finalUrl = url;
    if (download) {
      finalUrl = url.replace('/upload/', '/upload/fl_attachment/');
    }

    return NextResponse.redirect(finalUrl);
  } catch (error) {
    return NextResponse.json({ error: ApiResponse.getErrorMessage(error) }, { status: 500 });
  }
}
