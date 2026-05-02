import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ApiResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    return ApiResponse.ok(allCoupons);
  } catch (error: any) {
    return ApiResponse.error(error.message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return ApiResponse.unauthorized();
    }

    const body = await request.json();
    const { code, discountType, discountValue, maxUses, validUntil } = body;

    if (!code || !discountType || !discountValue) {
      return ApiResponse.badRequest("Missing required fields");
    }

    const result = await db.insert(coupons).values({
      code: code.toUpperCase(),
      discountType,
      discountValue: discountValue.toString(),
      maxUses,
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: true,
      createdBy: user.id,
    }).returning();

    return ApiResponse.ok(result[0], 201);
  } catch (error: any) {
    return ApiResponse.error(error.message, 500);
  }
}
