import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { qrCodes, qrRedirectHistory } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUser, verifyOwnership } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { updateQR } from "@/lib/services/qr.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const isOwner = await verifyOwnership(user.id, id, qrCodes);
    if (!isOwner) return ApiResponse.forbidden();

    const history = await db.select().from(qrRedirectHistory)
      .where(eq(qrRedirectHistory.qrId, id))
      .orderBy(desc(qrRedirectHistory.changedAt))
      .limit(20);

    return ApiResponse.ok(history);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const body = await request.json();
    const { historyId } = body;

    const entry = await db.select().from(qrRedirectHistory)
      .where(and(eq(qrRedirectHistory.id, historyId), eq(qrRedirectHistory.qrId, id)))
      .limit(1);

    if (!entry[0]) return ApiResponse.notFound("History entry not found");

    // Restore by updating current targetUrl
    const updated = await updateQR(id, user.id, {
      targetUrl: entry[0].oldUrl || "",
    });

    return ApiResponse.ok({ message: "URL restored successfully", updated });
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
