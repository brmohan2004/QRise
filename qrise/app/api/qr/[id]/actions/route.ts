import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qrActions, qrCodes } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUser, verifyOwnership } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const isOwner = await verifyOwnership(user.id, id, qrCodes);
    if (!isOwner) return ApiResponse.forbidden();

    const actions = await db.select().from(qrActions)
      .where(eq(qrActions.qrId, id))
      .orderBy(desc(qrActions.displayOrder));

    return ApiResponse.ok(actions);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const isOwner = await verifyOwnership(user.id, id, qrCodes);
    if (!isOwner) return ApiResponse.forbidden();

    const body = await request.json(); // Array of actions
    if (!Array.isArray(body)) return ApiResponse.badRequest("Expected an array of actions");

    // Replace all actions in a transaction
    const result = await db.transaction(async (tx) => {
      await tx.delete(qrActions).where(eq(qrActions.qrId, id));
      if (body.length === 0) return [];
      
      return tx.insert(qrActions).values(body.map(a => ({
        qrId: id,
        actionType: a.actionType || a.type,
        actionValue: a.actionValue || a.value,
        label: a.label,
        icon: a.icon,
        displayOrder: a.displayOrder,
      })) as any).returning();
    });

    return ApiResponse.ok(result);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
