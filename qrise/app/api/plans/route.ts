
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { ApiResponse } from "@/lib/api-response";

export async function GET() {
  try {
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
