export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { ApiResponse } from "@/lib/api-response";
import { rateLimitByIP } from "@/lib/redis";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = await rateLimitByIP(ip, "plans-api", 50, "1m");
    if (!rl.success) {
      return ApiResponse.error("Too many requests", 429);
    }

    const allPlans = await db
      .select()
      .from(plans)
      .where(eq(plans.isPubliclyVisible, true))
      .orderBy(asc(plans.sortOrder));

    return ApiResponse.ok(allPlans);
  } catch (error) {
    console.error("Plans API Error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
