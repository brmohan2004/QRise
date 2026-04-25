import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { routingRules } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUser, verifyOwnership } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { qrCodes } from "@/lib/db/schema";

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

    const rules = await db.select().from(routingRules)
      .where(eq(routingRules.qrId, id))
      .orderBy(desc(routingRules.priority));

    return ApiResponse.ok(rules);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const isOwner = await verifyOwnership(user.id, id, qrCodes);
    if (!isOwner) return ApiResponse.forbidden();

    const body = await request.json();
    const { conditions, targetUrl, priority } = body;

    const result = await db.insert(routingRules).values({
      qrId: id,
      conditions,
      targetUrl,
      priority: priority || 0,
    }).returning();

    return ApiResponse.ok(result[0], 201);
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

    const body = await request.json(); // Array of rules
    if (!Array.isArray(body)) return ApiResponse.badRequest("Expected an array of rules");

    // Replace all rules in a transaction
    const result = await db.transaction(async (tx) => {
      await tx.delete(routingRules).where(eq(routingRules.qrId, id));
      if (body.length === 0) return [];
      
      return tx.insert(routingRules).values(body.map(r => ({
        qrId: id,
        conditions: r.conditions,
        targetUrl: r.targetUrl,
        priority: r.priority,
      })) as any).returning();
    });

    return ApiResponse.ok(result);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
