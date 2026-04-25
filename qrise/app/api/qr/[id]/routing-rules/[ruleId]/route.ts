import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { routingRules, qrCodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, verifyOwnership } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const { id, ruleId } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const isOwner = await verifyOwnership(user.id, id, qrCodes);
    if (!isOwner) return ApiResponse.forbidden();

    const body = await request.json();
    const { priority, conditions, targetUrl } = body;

    const result = await db.update(routingRules)
      .set({ priority, conditions, targetUrl })
      .where(and(eq(routingRules.id, ruleId), eq(routingRules.qrId, id)))
      .returning();

    if (result.length === 0) return ApiResponse.notFound("Rule not found");

    return ApiResponse.ok(result[0]);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const { id, ruleId } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const isOwner = await verifyOwnership(user.id, id, qrCodes);
    if (!isOwner) return ApiResponse.forbidden();

    const result = await db.delete(routingRules)
      .where(and(eq(routingRules.id, ruleId), eq(routingRules.qrId, id)))
      .returning();

    if (result.length === 0) return ApiResponse.notFound("Rule not found");

    return ApiResponse.noContent();
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
